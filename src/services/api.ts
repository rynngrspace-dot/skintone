export interface PredictionResponse {
  skin_tone: string;
  skin_tone_class: "light" | "mid-dark" | "dark";
  rekomendasi: {
    foundation: string;
    blush: string;
    lipstik: string;
  };
  penjelasan: string;
}

// Local lookup dictionary matching backend recommendation data
export const kamusWarnaLokal: Record<string, {
  skin_tone: string;
  color: string;
  rekomendasi: { foundation: string; blush: string; lipstik: string };
  penjelasan: string;
}> = {
  "light": {
    "skin_tone": "Light (Kuning Langsat / Terang)",
    "color": "#F5D6C6",
    "rekomendasi": {
      "foundation": "Warna Ivory, Fair, atau Beige terang.",
      "blush": "Warna Soft Pink, Peach, atau Coral muda.",
      "lipstik": "Warna Nude Pink, Soft Peach, atau warna berry terang."
    },
    "penjelasan": "Kulit terang (light) memiliki undertone yang mudah terlihat. Warna-warna soft pink dan peach akan memberikan efek merona alami yang segar tanpa terlihat menor. Foundation ivory akan menyatu sempurna tanpa membuat wajah terlihat abu-abu."
  },
  "mid-dark": {
    "skin_tone": "Medium (Sawo Matang)",
    "color": "#D2A27E",
    "rekomendasi": {
      "foundation": "Warna Sand, Honey, atau Warm Beige.",
      "blush": "Warna Mauve, Rose, atau Apricot gelap.",
      "lipstik": "Warna Terracotta, Brick Red (Merah Bata), atau Warm Nude."
    },
    "penjelasan": "Kulit sawo matang (medium) sangat cocok dengan warna-warna hangat (warm tones). Warna seperti terracotta dan rose akan menonjolkan kecerahan kulit asli dan memberikan kesan eksotis yang elegan."
  },
  "dark": {
    "skin_tone": "Dark (Cokelat Tua / Gelap)",
    "color": "#8D5B4C",
    "rekomendasi": {
      "foundation": "Warna Caramel, Cocoa, atau Espresso.",
      "blush": "Warna Deep Berry, Plum, atau Merah Bata gelap.",
      "lipstik": "Warna Burgundy, Deep Plum, atau Cokelat Kemerahan."
    },
    "penjelasan": "Untuk kulit gelap, warna-warna bold dan intens seperti plum atau burgundy akan terlihat sangat memukau dan menyatu dengan kontur wajah. Warna ini memberikan dimensi yang tegas dan menawan pada kulit."
  }
};

// Backend API base URL — FastAPI server
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * Helper to infer skin tone class from the label string.
 * Used as fallback when backend doesn't return skin_tone_class directly.
 */
function inferSkinToneClass(skinToneLabel: string): "light" | "mid-dark" | "dark" {
  const lower = skinToneLabel.toLowerCase();
  if (lower.includes("light") || lower.includes("terang") || lower.includes("langsat")) {
    return "light";
  }
  if (lower.includes("dark") || lower.includes("gelap") || lower.includes("cokelat")) {
    return "dark";
  }
  return "mid-dark";
}

/**
 * Predicts the skin tone of the user by sending their photo to the FastAPI backend.
 * 
 * Pipeline:
 * 1. Sends image as multipart/form-data to POST /api/predict
 * 2. Backend: YOLOv5 detects person → Haar Cascade crops face → Custom model classifies skin tone
 * 3. Returns skin_tone label, skin_tone_class, rekomendasi, and penjelasan
 * 
 * If mockClassOverride is provided (manual testing buttons), bypasses the backend entirely.
 * If the backend is offline, falls back to a random mock response.
 */
export async function predictSkinTone(
  imageFile: File,
  mockClassOverride?: "light" | "mid-dark" | "dark"
): Promise<PredictionResponse> {
  // Manual testing mode — bypass backend entirely
  if (mockClassOverride) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const local = kamusWarnaLokal[mockClassOverride];
    return {
      skin_tone: local.skin_tone,
      skin_tone_class: mockClassOverride,
      rekomendasi: local.rekomendasi,
      penjelasan: local.penjelasan
    };
  }

  // Build multipart form data with the image file
  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch(`${BACKEND_URL}/api/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API error (${response.status}): ${errText}`);
    }

    const data = await response.json();

    // Use skin_tone_class directly from backend if available,
    // otherwise infer from the skin_tone label string
    const skinToneClass: "light" | "mid-dark" | "dark" =
      data.skin_tone_class && ["light", "mid-dark", "dark"].includes(data.skin_tone_class)
        ? data.skin_tone_class
        : inferSkinToneClass(data.skin_tone || "");

    return {
      skin_tone: data.skin_tone || kamusWarnaLokal[skinToneClass].skin_tone,
      skin_tone_class: skinToneClass,
      rekomendasi: data.rekomendasi || kamusWarnaLokal[skinToneClass].rekomendasi,
      penjelasan: data.penjelasan || kamusWarnaLokal[skinToneClass].penjelasan
    };
  } catch (error) {
    console.warn("Backend API offline or threw error. Falling back to mock prediction.", error);

    // Offline fallback: choose random class and simulate delay
    const classes: Array<"light" | "mid-dark" | "dark"> = ["light", "mid-dark", "dark"];
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const local = kamusWarnaLokal[randomClass];

    await new Promise((resolve) => setTimeout(resolve, 2500));

    return {
      skin_tone: local.skin_tone,
      skin_tone_class: randomClass,
      rekomendasi: local.rekomendasi,
      penjelasan: local.penjelasan
    };
  }
}

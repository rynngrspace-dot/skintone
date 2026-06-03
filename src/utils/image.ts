/**
 * Compresses a base64 image (data URL) to a target maximum size (width/height)
 * and outputs a compressed JPEG base64 string.
 */
export function compressBase64Image(
  base64Str: string,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    // If it's not a browser environment or not a valid data URL, return original
    if (typeof window === "undefined" || !base64Str.startsWith("data:image")) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64Str); // Fallback to original if context creation fails
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Export as a compressed JPEG
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      resolve(base64Str); // Fallback to original on load error
    };
  });
}

export const shadesMap: Record<string, string> = {
  // Foundation
  "ivory": "#F9E4D4",
  "fair": "#FCE8DB",
  "beige": "#E8C8B0",
  "sand": "#DEC0A5",
  "honey": "#CFA37E",
  "warm beige": "#D6A885",
  "caramel": "#B0835D",
  "cocoa": "#7C5335",
  "espresso": "#4C2D18",
  // Blush
  "soft pink": "#FFB7C5",
  "peach": "#FFD1B3",
  "coral": "#FF7F50",
  "mauve": "#D69CA9",
  "rose": "#C08081",
  "apricot": "#FBAC83",
  "deep berry": "#8A2E44",
  "plum": "#6B3047",
  "merah bata": "#A04040",
  // Lipstick
  "nude pink": "#E09A97",
  "soft peach": "#F4A284",
  "berry": "#C84E6D",
  "terracotta": "#C36241",
  "brick red": "#A52A2A",
  "warm nude": "#B58778",
  "burgundy": "#800020",
  "deep plum": "#4E1627",
  "cokelat kemerahan": "#8B5A2B"
};

/**
 * Parses recommendation text and extracts matching shades with their hex colors.
 */
export function getShadeColors(recText: string): Array<{ name: string; hex: string }> {
  if (!recText) return [];

  const foundShades: Array<{ name: string; hex: string }> = [];
  const lowerText = recText.toLowerCase();

  Object.entries(shadesMap).forEach(([name, hex]) => {
    if (lowerText.includes(name)) {
      const capName = name.replace(/\b\w/g, (c) => c.toUpperCase());
      foundShades.push({ name: capName, hex });
    }
  });

  return foundShades;
}

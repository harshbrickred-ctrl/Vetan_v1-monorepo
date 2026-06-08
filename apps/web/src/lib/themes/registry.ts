export const ADMIN_THEME_IDS = [
  "light",
  "dark",
  "ocean",
  "cocoa",
  "sage",
  "nature",
] as const;

export type AdminThemeId = (typeof ADMIN_THEME_IDS)[number];

export type ThemeDefinition = {
  id: AdminThemeId;
  label: string;
  description: string;
  swatches: string[];
  previewImage?: string;
};

export const ADMIN_THEMES: ThemeDefinition[] = [
  {
    id: "light",
    label: "Persimmon Light",
    description: "Default Vetan light theme with warm persimmon accents.",
    swatches: ["#fdfcfc", "#f87941", "#2f3035", "#e6e4e6"],
    previewImage: "/themes/saas-palette.png",
  },
  {
    id: "dark",
    label: "Persimmon Dark",
    description: "Default Vetan dark theme for low-light environments.",
    swatches: ["#2f3035", "#f87941", "#fdfcfc", "#b1b1b1"],
    previewImage: "/themes/saas-palette.png",
  },
  {
    id: "ocean",
    label: "Ocean",
    description: "Cool teal and blue tones from Design31.",
    swatches: ["#f3f8fa", "#498aa8", "#2f6581", "#19171d"],
    previewImage: "/themes/design31.png",
  },
  {
    id: "cocoa",
    label: "Cocoa",
    description: "Warm chocolate and rose palette from Design38.",
    swatches: ["#120908", "#e2b3a7", "#5c4945", "#a08784"],
    previewImage: "/themes/design38.png",
  },
  {
    id: "sage",
    label: "Sage Lime",
    description: "Soft sage greens with key-lime highlights from Design44.",
    swatches: ["#e9eeea", "#e2f28e", "#6b8f4e", "#131412"],
    previewImage: "/themes/design44.png",
  },
  {
    id: "nature",
    label: "Nature",
    description: "Earthy greens and warm sand tones from Design48.",
    swatches: ["#fbfcfc", "#a8be83", "#f2c27f", "#88734b"],
    previewImage: "/themes/design48.png",
  },
];

export function isAdminThemeId(value: string): value is AdminThemeId {
  return (ADMIN_THEME_IDS as readonly string[]).includes(value);
}

export function parseAdminThemeFromSettings(
  settings: Record<string, unknown> | undefined,
): AdminThemeId {
  const appearance = settings?.appearance;
  if (
    appearance &&
    typeof appearance === "object" &&
    !Array.isArray(appearance)
  ) {
    const theme = (appearance as Record<string, unknown>).adminTheme;
    if (typeof theme === "string" && isAdminThemeId(theme)) return theme;
  }
  return "light";
}

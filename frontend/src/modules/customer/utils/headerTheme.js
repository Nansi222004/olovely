/** Shift hex color channels by amount (negative = darker). */
export function shiftHex(hex, amount) {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return hex;

  const normalized =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;

  const value = normalized.slice(1);
  if (value.length !== 6) return hex;

  const clamp = (num) => Math.max(0, Math.min(255, num + amount));
  const r = clamp(parseInt(value.slice(0, 2), 16));
  const g = clamp(parseInt(value.slice(2, 4), 16));
  const b = clamp(parseInt(value.slice(4, 6), 16));

  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

const DEFAULT_BASE = "#123B8E";

/** Blend hex toward white (t=0 base, t≈1 near-white). */
export function mixHexWithWhite(hex, t) {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
    return "#f8fafc";
  }
  const normalized =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
  const value = normalized.slice(1);
  if (value.length !== 6) return "#f8fafc";

  const mix = (c) => Math.round(c + (255 - c) * t);
  const r = mix(parseInt(value.slice(0, 2), 16));
  const g = mix(parseInt(value.slice(2, 4), 16));
  const b = mix(parseInt(value.slice(4, 6), 16));
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * Derives full 5-stop dynamic theme shades from any category's base color.
 * Creates a continuous full-page gradient atmosphere matching Olovely brand identity.
 */
export function deriveCategoryTheme(baseHeaderColor, headerFontColor) {
  const hex = (baseHeaderColor && typeof baseHeaderColor === "string" && baseHeaderColor.startsWith("#"))
    ? baseHeaderColor.toUpperCase()
    : DEFAULT_BASE;

  let dark, primary, bright, light, veryLight, accentAction;

  if (hex === "#16A34A" || hex === "#0B6B30" || hex === "#087A3D" || hex === "#22C55E" || hex === "#2FC765") {
    // FRESH PRODUCE (Green)
    dark = "#0B6B30";
    primary = "#16A34A";
    bright = "#2FC765";
    light = "#DCFCE7";
    veryLight = "#F0FDF4";
    accentAction = "#16A34A";
  } else if (hex === "#F4B400" || hex === "#B47700" || hex === "#D97706" || hex === "#C56F00" || hex === "#FACC15" || hex === "#FFD54A") {
    // SNACKS & DRINKS (Warm Golden Yellow)
    dark = "#B47700";
    primary = "#F4B400";
    bright = "#FFD54A";
    light = "#FFF1B8";
    veryLight = "#FFFBEA";
    accentAction = "#B47700";
  } else if (
    hex === "#E53935" ||
    hex === "#B71C1C" ||
    hex === "#EF4444" ||
    hex === "#EC4899" ||
    hex === "#DB2777" ||
    hex === "#E11D48" ||
    hex === "#FF625D"
  ) {
    // PERSONAL & BEAUTY (Red - Olovely Logo Aligned)
    dark = "#B71C1C";
    primary = "#E53935";
    bright = "#FF625D";
    light = "#FFE0DF";
    veryLight = "#FFF3F2";
    accentAction = "#E53935";
  } else if (hex !== "#123B8E" && hex.startsWith("#") && hex.length === 7) {
    // Dynamic 5-stop vibrant palette derived from any custom category hex
    dark = shiftHex(hex, -45);
    primary = hex;
    bright = shiftHex(hex, 30);
    light = mixHexWithWhite(hex, 0.72);
    veryLight = mixHexWithWhite(hex, 0.90);
    accentAction = hex;
  } else {
    // ALL / GROCERY & KITCHEN (Royal Blue - Default)
    dark = "#0B255C";
    primary = "#123B8E";
    bright = "#1976D2";
    light = "#DCEBFF";
    veryLight = "#F2F7FF";
    accentAction = "#123B8E";
  }

  const isLight = headerFontColor === "#172033" || headerFontColor === "#111111" || primary === "#F4B400";
  const textColor = isLight ? "#172033" : "#FFFFFF";
  const mutedTextColor = isLight ? "rgba(23, 32, 51, 0.80)" : "rgba(255, 255, 255, 0.90)";
  const searchBg = "rgba(255, 255, 255, 0.95)";

  const headerGradient = `linear-gradient(180deg, ${dark} 0%, ${primary} 55%, ${bright} 100%)`;
  const pageGradient = `linear-gradient(180deg, ${dark} 0px, ${primary} 220px, ${bright} 450px, ${light} 800px, ${veryLight} 1250px, #FFFFFF 100%)`;
  const sectionGradient = `linear-gradient(135deg, ${dark} 0%, ${primary} 55%, ${bright} 100%)`;
  const cardHeaderGradient = `linear-gradient(135deg, ${dark} 0%, ${primary} 60%, ${bright} 100%)`;
  const cardTint = `linear-gradient(135deg, ${light} 0%, ${veryLight} 100%)`;

  return {
    base: primary,
    dark,
    primary,
    bright,
    light,
    veryLight,
    pale: veryLight,
    accentAction,
    textColor,
    mutedTextColor,
    searchBg,
    headerGradient,
    pageGradient,
    sectionGradient,
    cardHeaderGradient,
    cardTint,
    isLight,
  };
}

export function buildSearchBarBackgroundColor(baseHeaderColor, headerFontColor) {
  return deriveCategoryTheme(baseHeaderColor, headerFontColor).searchBg;
}

/**
 * Dynamic 3-level gradient header (category-driven).
 */
export function buildHeaderGradient(baseHeaderColor, headerFontColor) {
  return deriveCategoryTheme(baseHeaderColor, headerFontColor).headerGradient;
}

/** Solid fill for floating cart pill: header mid tone, slightly darker. */
export function buildMiniCartColor(baseHeaderColor) {
  const base = (baseHeaderColor && typeof baseHeaderColor === "string" && baseHeaderColor.startsWith("#")) ? baseHeaderColor : DEFAULT_BASE;
  const mid = shiftHex(base, 15);
  return shiftHex(mid, -20);
}

/** Gradient for floating mini cart pill (same palette as header, horizontal). */
export function buildMiniCartGradient(baseHeaderColor) {
  const base = (baseHeaderColor && typeof baseHeaderColor === "string" && baseHeaderColor.startsWith("#")) ? baseHeaderColor : DEFAULT_BASE;
  const top = shiftHex(base, -12);
  const mid = shiftHex(base, 15);
  const deep = shiftHex(mid, -25);
  return `linear-gradient(135deg, ${top} 0%, ${mid} 48%, ${deep} 100%)`;
}


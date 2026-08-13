// Shared between admin (Offer Sections) and customer (Offers page) for consistent section styling.

export const BACKGROUND_COLOR_OPTIONS = [
  {
    id: "yellow",
    label: "Yellow",
    value: "#FCD34D",
    start: "#FEF3C7",
    end: "#FACC15",
  },
  {
    id: "orange",
    label: "Orange",
    value: "#FB923C",
    start: "#FED7AA",
    end: "#FB923C",
  },
  {
    id: "green",
    label: "Green",
    value: "var(--primary)",
    start: "#BBF7D0",
    end: "var(--primary)",
  },
  {
    id: "blue",
    label: "Blue",
    value: "#3B82F6",
    start: "#DBEAFE",
    end: "#2563EB",
  },
  {
    id: "pink",
    label: "Pink",
    value: "#EC4899",
    start: "#FCE7F3",
    end: "#EC4899",
  },
  {
    id: "purple",
    label: "Purple",
    value: "#8B5CF6",
    start: "#EDE9FE",
    end: "#8B5CF6",
  },
];

export const SIDE_IMAGE_OPTIONS = [
  {
    key: "hair-care",
    label: "Hair Care",
    imageUrl:
      "https://images.unsplash.com/photo-1522338242762-594f63bcf581?w=200&h=200&fit=crop",
  },
  {
    key: "grocery",
    label: "Grocery",
    imageUrl:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop",
  },
  {
    key: "electronics",
    label: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop",
  },
  {
    key: "beauty",
    label: "Beauty",
    imageUrl:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop",
  },
  {
    key: "kitchen",
    label: "Kitchen",
    imageUrl:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop",
  },
  {
    key: "fashion",
    label: "Fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop",
  },
];

export const getSideImageByKey = (key) =>
  SIDE_IMAGE_OPTIONS.find((o) => o.key === key)?.imageUrl ||
  SIDE_IMAGE_OPTIONS[0].imageUrl;

function shiftHexSimple(hex, amount) {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return hex;
  const normalized = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  const value = normalized.slice(1);
  if (value.length !== 6) return hex;
  const clamp = (num) => Math.max(0, Math.min(255, num + amount));
  const r = clamp(parseInt(value.slice(0, 2), 16));
  const g = clamp(parseInt(value.slice(2, 4), 16));
  const b = clamp(parseInt(value.slice(4, 6), 16));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export const getBackgroundColorByValue = (value) =>
  value || BACKGROUND_COLOR_OPTIONS[0].value;

export const getBackgroundGradientByValue = (value) => {
  if (!value || typeof value !== "string") {
    return `linear-gradient(135deg, #0B2E73 0%, #123B8E 50%, #2D63C8 100%)`;
  }
  const hex = value.toUpperCase();
  if (hex === "#123B8E" || hex.includes("PRIMARY") || hex.includes("BLUE")) {
    return `linear-gradient(135deg, #0B2E73 0%, #123B8E 55%, #2D63C8 100%)`;
  }
  if (hex === "#16A34A" || hex.includes("GREEN")) {
    return `linear-gradient(135deg, #087A3D 0%, #16A34A 55%, #4ACB75 100%)`;
  }
  if (hex === "#F4B400" || hex === "#FCD34D" || hex.includes("YELLOW")) {
    return `linear-gradient(135deg, #C56F00 0%, #F4B400 55%, #FFC83D 100%)`;
  }
  if (hex === "#EC4899" || hex === "#E53935" || hex.includes("PINK") || hex.includes("RED")) {
    return `linear-gradient(135deg, #831843 0%, #EC4899 55%, #F472B6 100%)`;
  }

  const opt = BACKGROUND_COLOR_OPTIONS.find((o) => o.value === value);
  if (opt) return `linear-gradient(135deg, ${opt.start}, ${opt.end})`;
  return `linear-gradient(135deg, ${shiftHexSimple(value, -25)} 0%, ${value} 55%, ${shiftHexSimple(value, 25)} 100%)`;
};



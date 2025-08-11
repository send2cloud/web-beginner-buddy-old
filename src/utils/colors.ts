/**
 * Convert color to RGBA with reduced opacity
 */
export const convertToRGBAWithOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    // Convert hex to RGB
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } else if (color.startsWith('rgba')) {
    // Extract existing RGBA values and multiply alpha by opacity factor
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (match) {
      const [, r, g, b, a] = match;
      const newAlpha = parseFloat(a) * opacity;
      return `rgba(${r}, ${g}, ${b}, ${newAlpha})`;
    }
  } else if (color.startsWith('rgb')) {
    // Extract RGB values and add alpha
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [, r, g, b] = match;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }
  // Fallback - return original color
  return color;
};

/**
 * Darken color by reducing RGB values
 */
export const darkenColor = (color: string, amount: number = 20): string => {
  if (color.startsWith('rgba')) {
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (match) {
      const [, r, g, b, a] = match;
      const darkerR = Math.max(0, parseInt(r) - amount);
      const darkerG = Math.max(0, parseInt(g) - amount);
      const darkerB = Math.max(0, parseInt(b) - amount);
      return `rgba(${darkerR}, ${darkerG}, ${darkerB}, ${a})`;
    }
  }
  return color;
};
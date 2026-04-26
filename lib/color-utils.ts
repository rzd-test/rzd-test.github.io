// Utility functions for color manipulation and CSS filter generation

/**
 * Converts a hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

/**
 * Converts RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * Generates CSS filter string for avatar colorization based on hex color
 * Converts custom hex colors to appropriate hue-rotate and saturate values
 */
export function getAvatarFilterFromColor(colorTheme: string): string {
  // Preset color filters for known themes
  const presetFilters: { [key: string]: string } = {
    red: "hue-rotate(0deg) saturate(1.9)",
    blue: "hue-rotate(210deg) saturate(1.0)",
    orange: "hue-rotate(30deg) saturate(1.3)",
    green: "hue-rotate(120deg) saturate(1.0)",
    purple: "hue-rotate(270deg) saturate(1.1)",
    teal: "hue-rotate(180deg) saturate(1.1)",
  }

  // If it's a preset color, return the preset filter
  if (presetFilters[colorTheme]) {
    return presetFilters[colorTheme]
  }

  // If it's a hex color, calculate the filter
  if (colorTheme.startsWith("#")) {
    const rgb = hexToRgb(colorTheme)
    if (!rgb) return "none"

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

    // Base avatar color is red (#ff6666), so we rotate from there
    const baseHue = 0 // Red base
    const targetHue = hsl.h
    const hueRotation = targetHue - baseHue

    // Map saturation from 0-100% to a reasonable filter range (0.5 to 2.0)
    const saturation = Math.max(0.5, Math.min(2.0, (hsl.s / 100) * 1.5 + 0.5))

    // Map lightness from 0-100% to brightness range (0.5 to 1.5)
    // Lightness 50% = brightness 1.0 (neutral)
    // Lightness 0% = brightness 0.5 (darker)
    // Lightness 100% = brightness 1.5 (brighter)
    const brightness = Math.max(0.5, Math.min(1.5, 0.5 + hsl.l / 100))

    return `hue-rotate(${hueRotation}deg) saturate(${saturation.toFixed(2)}) brightness(${brightness.toFixed(2)})`
  }

  return "none"
}

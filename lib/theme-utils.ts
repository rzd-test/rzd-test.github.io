export function getThemeColor(colorTheme: string): string {
  // If it's already a hex color, return it directly
  if (colorTheme.startsWith("#")) {
    return colorTheme
  }

  // Otherwise, map preset color names to hex values
  const colorMap: { [key: string]: string } = {
    red: "#ef4444",
    blue: "#3b82f6",
    orange: "#f97316",
    green: "#22c55e",
    purple: "#a855f7",
    teal: "#14b8a6",
  }

  return colorMap[colorTheme] || "#f97316"
}

export function getContrastTextColor(backgroundColor: string, isDarkMode: boolean): string {
  // If it's a preset color name, convert to hex first
  const colorMap: { [key: string]: string } = {
    red: "#ef4444",
    blue: "#3b82f6",
    orange: "#f97316",
    green: "#22c55e",
    purple: "#a855f7",
    teal: "#14b8a6",
  }

  const hexColor = backgroundColor.startsWith("#") ? backgroundColor : colorMap[backgroundColor] || "#f97316"

  // Convert hex to RGB
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor)
  if (!result) return isDarkMode ? "#ffffff" : "#000000"

  const r = Number.parseInt(result[1], 16)
  const g = Number.parseInt(result[2], 16)
  const b = Number.parseInt(result[3], 16)

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // If background is dark (luminance < 0.5), use white text
  // If background is light (luminance >= 0.5), use black text
  return luminance < 0.5 ? "#ffffff" : "#000000"
}

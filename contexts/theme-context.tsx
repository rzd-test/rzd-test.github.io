"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Theme {
  background: string
  colorTheme: string
  fontFamily: string
  fontSize: string
  mode: "light" | "dark"
}

interface UserProfile {
  fullName: string
  position: string
  nickname: string
  signature: string // Added signature field for reports
}

interface ThemeContextType {
  theme: Theme
  userProfile: UserProfile
  updateTheme: (updates: Partial<Theme>) => void
  updateUserProfile: (updates: Partial<UserProfile>) => void
  toggleMode: () => void
  setColorTheme: (color: string) => void
  getTag: () => string // Added getTag function to context
}

const defaultTheme: Theme = {
  background:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sapsan-bridge-P2tdAk8LEJIgwJMoqXjcGPvLxnyjps.jpg",
  colorTheme: "#d32f2f",
  fontFamily: "sans",
  fontSize: "medium",
  mode: "dark",
}

const defaultUserProfile: UserProfile = {
  fullName: "",
  position: "",
  nickname: "",
  signature: "", // Added default signature value
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile)

  useEffect(() => {
    const savedTheme = localStorage.getItem("rzd-theme")
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme))
    }

    const savedProfile = localStorage.getItem("rzd-user-profile")
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
    }
  }, [])

  const updateTheme = (updates: Partial<Theme>) => {
    const newTheme = { ...theme, ...updates }
    setTheme(newTheme)
    localStorage.setItem("rzd-theme", JSON.stringify(newTheme))
    applyTheme(newTheme)
  }

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    const newProfile = { ...userProfile, ...updates }
    setUserProfile(newProfile)
    localStorage.setItem("rzd-user-profile", JSON.stringify(newProfile))
  }

  const toggleMode = () => {
    const newMode = theme.mode === "dark" ? "light" : "dark"
    updateTheme({ mode: newMode })
  }

  const setColorTheme = (color: string) => {
    const backgroundMap: { [key: string]: string } = {
      red: "/backgrounds/double-decker-train.jpg",
      blue: "/backgrounds/sapsan-bridge.jpg",
      orange: "/backgrounds/lastochka-petergof.jpg",
      green: "/backgrounds/steam-locomotive.png",
      purple: "/backgrounds/double-decker-train.jpg",
      teal: "/backgrounds/sapsan-bridge.jpg",
    }

    // If it's a hex color, keep current background
    if (color.startsWith("#")) {
      updateTheme({
        colorTheme: color,
      })
    } else {
      // If it's a preset color, update both color and background
      updateTheme({
        colorTheme: color,
        background: backgroundMap[color] || backgroundMap.orange,
      })
    }
  }

  const applyTheme = (currentTheme: Theme) => {
    document.body.style.backgroundImage = `url(${currentTheme.background})`
    document.body.style.backgroundSize = "cover"
    document.body.style.backgroundPosition = "center"
    document.body.style.backgroundAttachment = "fixed"

    let primaryColor = currentTheme.colorTheme

    // If it's a preset color name, get the hex value
    if (!currentTheme.colorTheme.startsWith("#")) {
      const colorMap = {
        red: { primary: "#ef4444", secondary: "#dc2626", tertiary: "#b91c1c" },
        blue: { primary: "#3b82f6", secondary: "#2563eb", tertiary: "#1d4ed8" },
        orange: { primary: "#f97316", secondary: "#ea580c", tertiary: "#c2410c" },
        green: { primary: "#22c55e", secondary: "#16a34a", tertiary: "#15803d" },
        purple: { primary: "#a855f7", secondary: "#9333ea", tertiary: "#7c3aed" },
        teal: { primary: "#14b8a6", secondary: "#0d9488", tertiary: "#0f766e" },
      }

      const colors = colorMap[currentTheme.colorTheme as keyof typeof colorMap] || colorMap.orange
      primaryColor = colors.primary
      document.documentElement.style.setProperty("--color-primary", colors.primary)
      document.documentElement.style.setProperty("--color-secondary", colors.secondary)
      document.documentElement.style.setProperty("--color-tertiary", colors.tertiary)
    } else {
      // For custom hex colors, use the color directly
      document.documentElement.style.setProperty("--color-primary", currentTheme.colorTheme)
      document.documentElement.style.setProperty("--color-secondary", currentTheme.colorTheme)
      document.documentElement.style.setProperty("--color-tertiary", currentTheme.colorTheme)
    }

    if (currentTheme.mode === "light") {
      document.documentElement.classList.remove("dark")
    } else {
      document.documentElement.classList.add("dark")
    }
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const getTag = () => {
    return getTagFromPosition(userProfile.position)
  }

  return (
    <ThemeContext.Provider
      value={{ theme, userProfile, updateTheme, updateUserProfile, toggleMode, setColorTheme, getTag }}
    >
      <div className={`${getFontClass(theme.fontFamily)} ${getFontSizeClass(theme.fontSize)} min-h-screen`}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

function getFontClass(fontFamily: string) {
  switch (fontFamily) {
    case "serif":
      return "font-serif"
    case "mono":
      return "font-mono"
    default:
      return "font-sans"
  }
}

function getFontSizeClass(fontSize: string) {
  switch (fontSize) {
    case "small":
      return "text-sm"
    case "large":
      return "text-lg"
    case "xl":
      return "text-xl"
    default:
      return "text-base"
  }
}

export function getTagFromPosition(position: string): string {
  const positionTagMap: { [key: string]: string } = {
    "Начальник Депо": "[ТЧ]",
    "Первый Заместитель Начальника Депо": "[ТЧЗ-1]",
    "Зам. Начальника Депо по кадровой работе": "[ТЧЗк]",
    "Зам. Начальника Депо по эксплуатации": "[ТЧЗэ]",
    "Начальник ЭО": "[ЦКАДР]",
    "Начальник ЦдУД": "[ДГПд]",
    "Начальник ПТО": "[ДГПт]",
    "Машинист-инструктор / Зам.Нач.ЭО": "[ТЧМИ]",
    "Машинист-инструктор / Зам.Нач.ЦдУД": "[ТЧМИ]",
    "Машинист-инструктор / Зам.Нач.ПТО": "[ТЧМИ]",
    "Старший диспетчер": "[ДНЦ-С]",
    "Поездной диспетчер": "[ДНЦ]",
    "Оператор при ДНЦ": "[ДНЦ-О]",
    "Машинист первого класса": "[ТЧМ-1КМ]",
    "Машинист второго класса": "[ТЧМ-2КМ]",
    "Машинист третьего класса": "[ТЧМ-3КМ]",
    "Помощник машиниста": "[ТЧМП]",
    "Монтёр пути": "[ПЧ]",
    "Слесарь-электрик": "[ТЧР]",
  }
  return positionTagMap[position] || ""
}

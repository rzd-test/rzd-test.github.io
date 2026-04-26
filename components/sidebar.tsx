"use client"

import { Button } from "@/components/ui/button"
import {
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Crown,
  Shield,
  UsersRound,
  Train,
  Wrench,
} from "lucide-react"
import { useState, useEffect } from "react"
import { SettingsModal } from "@/components/settings-modal"
import { useTheme } from "@/contexts/theme-context"
import { useRouter } from "next/navigation"
import type { JSX } from "react"
import Image from "next/image"
import type { UserRole } from "@/data/users"
import {
  canAccessManagement,
  canAccessReportCompiler,
  canAccessEducationalContent,
  canAccessOrders,
  canAccessReportGeneration,
  canAccessGovWave,
} from "@/data/users"
import { getThemeColor } from "@/lib/theme-utils"
import { getAvatarFilterFromColor } from "@/lib/color-utils"

interface LocalUser {
  id: string
  nickname: string
  role: UserRole
  position: string
  vkAccessToken: string
}

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  user: LocalUser
}

export function Sidebar({ activeSection, onSectionChange, isCollapsed, setIsCollapsed, user }: SidebarProps) {
  const [showSettings, setShowSettings] = useState(false)
  const { theme, toggleMode } = useTheme()
  const router = useRouter()

  const getTieColor = () => getThemeColor(theme.colorTheme)

  useEffect(() => {
    document.documentElement.style.setProperty("--scrollbar-color", getTieColor())
  }, [theme.colorTheme])

  const getIconColor = (isActive: boolean) => {
    if (isActive) {
      return "#ffffff"
    }
    if (theme.mode === "dark") {
      return "#ffffff"
    } else {
      return "#000000"
    }
  }

  const getAvatarFilter = () => {
    return getAvatarFilterFromColor(theme.colorTheme)
  }

  const getAvatarForRole = (role: UserRole) => {
    const avatarMap = {
      Руководство: "/avatars/management.png",
      Заместитель: "/avatars/senior-staff.png",
      "Старший Состав": "/avatars/senior-staff.png",
      ЦдУД: "/avatars/cdud.png",
      ПТО: "/avatars/pto.png",
    }
    return avatarMap[role] || "/avatars/senior-staff.png"
  }

  const sectionIcons: { [key: string]: (isActive: boolean) => JSX.Element } = {
    contents: (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke={getIconColor(isActive)} strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke={getIconColor(isActive)} strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke={getIconColor(isActive)} strokeWidth="2" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke={getIconColor(isActive)} strokeWidth="2" />
      </svg>
    ),
    information: (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke={getIconColor(isActive)} strokeWidth="2" />
        <path d="M12 16v-4M12 8h.01" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    lectures: (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
          stroke={getIconColor(isActive)}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
          stroke={getIconColor(isActive)}
          strokeWidth="2"
        />
        <path d="M8 7h8M8 11h6" stroke={getIconColor(isActive)} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    training: (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="12" r="2" stroke={getIconColor(isActive)} strokeWidth="2" />
        <circle cx="18" cy="12" r="2" stroke={getIconColor(isActive)} strokeWidth="2" />
        <path d="M8 12h8" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
        <path d="M6 9v6M18 9v6" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
        <rect x="11" y="10" width="2" height="4" rx="1" fill={getIconColor(isActive)} />
      </svg>
    ),
    events: (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke={getIconColor(isActive)} strokeWidth="2" />
        <path d="M3 10h18M8 2v4M16 2v4" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
        <path
          d="M8 14h2M8 18h2M12 14h2M12 18h2M16 14h2M16 18h2"
          stroke={getIconColor(isActive)}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    exams: (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
          stroke={getIconColor(isActive)}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke={getIconColor(isActive)}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    interviews: (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="7" r="4" stroke={getIconColor(isActive)} strokeWidth="2" />
        <path
          d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
          stroke={getIconColor(isActive)}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M16 11h5M18.5 8.5v5" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    "retro-train": (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="6" width="16" height="12" rx="2" stroke={getIconColor(isActive)} strokeWidth="2" />
        <path d="M4 10h16M8 6V4M16 6V4" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="18" r="1.5" fill={getIconColor(isActive)} />
        <circle cx="16" cy="18" r="1.5" fill={getIconColor(isActive)} />
        <path d="M8 14h2M14 14h2" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    duty: (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke={getIconColor(isActive)} strokeWidth="2" />
        <path d="M12 6v6l4 2" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
        <path
          d="M16 2h4v4"
          stroke={getIconColor(isActive)}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    "reports-section": (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="2" fill={getIconColor(isActive)} />
        <path
          d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"
          stroke={getIconColor(isActive)}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    "gov-wave": (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="16" height="20" rx="2" stroke={getIconColor(isActive)} strokeWidth="2" />
        <circle cx="12" cy="8" r="2" fill={getIconColor(isActive)} />
        <path d="M8 14h8M8 18h8" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
        <path
          d="M9 8c0-1.5 1-3 3-3s3 1.5 3 3"
          stroke={getIconColor(isActive)}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    reports: (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 3v18h18"
          stroke={getIconColor(isActive)}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M7 16v-6M12 16V8M17 16v-9" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    orders: (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 2v4M16 2v4" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
        <path
          d="M4 6h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
          stroke={getIconColor(isActive)}
          strokeWidth="2"
        />
        <circle cx="12" cy="14" r="3" stroke={getIconColor(isActive)} strokeWidth="2" />
        <path d="M12 11v6" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    "report-compiler": (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"
          stroke={getIconColor(isActive)}
          strokeWidth="2"
        />
        <path d="M14 2v6h6" stroke={getIconColor(isActive)} strokeWidth="2" />
        <path d="M9 13h6M9 17h4" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
        <rect x="16" y="16" width="6" height="6" rx="1" stroke={getIconColor(isActive)} strokeWidth="1.5" />
      </svg>
    ),
    admin: (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke={getIconColor(isActive)} strokeWidth="2" />
        <path
          d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
          stroke={getIconColor(isActive)}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    "report-generation": (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          stroke={getIconColor(isActive)}
          strokeWidth="2"
        />
        <path d="M14 2v6h6" stroke={getIconColor(isActive)} strokeWidth="2" />
        <path d="M10 18l-2-2 6-6 2 2z" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 16l-1 3 3-1" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    "rzd-website": (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke={getIconColor(isActive)} strokeWidth="2" />
        <path d="M8 8h8M8 12h8M8 16h5" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="16" r="1.5" fill={getIconColor(isActive)} />
      </svg>
    ),
    articles: (isActive) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke={getIconColor(isActive)} strokeWidth="2" />
        <path d="M8 8h8M8 12h8M8 16h5" stroke={getIconColor(isActive)} strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="16" r="1.5" fill={getIconColor(isActive)} />
      </svg>
    ),
  }

  const sections = []

  sections.push({ id: "contents", label: "Содержание" })
  sections.push({ id: "information", label: "Информация" })

  if (canAccessEducationalContent(user.role)) {
    sections.push(
      { id: "lectures", label: "Лекции" },
      { id: "training", label: "Тренировки" },
      { id: "events", label: "Мероприятия" },
      { id: "exams", label: "Экзамены" },
    )
  }

  sections.push({ id: "interviews", label: "Собеседования" })

  sections.push({ id: "retro-train", label: "Ретропоезд" })

  sections.push({ id: "duty", label: "Дежурство" })

  if (canAccessOrders(user.role)) {
    sections.push({ id: "orders", label: "Приказы" })
  }

  sections.push({ id: "reports-section", label: "Доклады в рацию" })

  if (canAccessGovWave(user.role)) {
    sections.push({ id: "gov-wave", label: "Гос. волна" })
  }

  if (canAccessReportGeneration(user.role)) {
    sections.push({ id: "report-generation", label: "Генерация отчётов" })
  }

  if (canAccessReportCompiler(user.role)) {
    sections.push({ id: "report-compiler", label: "Составитель докладов" })
  }

  sections.push({ id: "rzd-website", label: "Новости РЖД" })

  if (canAccessManagement(user.role)) {
    sections.push({ id: "admin", label: "Управление" })
  }

  const getSidebarBg = () => {
    if (theme.mode === "dark") {
      return "bg-black"
    } else {
      return "bg-white"
    }
  }

  const getTextColor = () => {
    return theme.mode === "dark" ? "text-white" : "text-black"
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  const getRoleBadgeIcon = (role: UserRole) => {
    const iconSize = "w-3 h-3"
    const color = getTieColor()

    switch (role) {
      case "Руководство":
        return <Crown className={iconSize} style={{ color }} />
      case "Заместитель":
        return <Shield className={iconSize} style={{ color }} />
      case "Старший Состав":
        return <UsersRound className={iconSize} style={{ color }} />
      case "ЦдУД":
        return <Train className={iconSize} style={{ color }} />
      case "ПТО":
        return <Wrench className={iconSize} style={{ color }} />
      default:
        return null
    }
  }

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen ${getSidebarBg()} border-r ${
          theme.mode === "dark" ? "border-white/10" : "border-gray-200"
        } p-4 transition-all duration-300 z-50 overflow-hidden ${isCollapsed ? "w-20" : "w-64"}`}
        style={{
          backgroundColor: theme.mode === "dark" ? "#000000" : "#ffffff",
        }}
      >
        <div className="flex flex-col h-full">
          <div className="mb-6">
            {!isCollapsed && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-full border-2"
                    style={{ borderColor: getTieColor() }}
                  >
                    <Image
                      src={getAvatarForRole(user.role) || "/placeholder.svg"}
                      alt="Avatar"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover object-center scale-110"
                      style={{
                        filter: getAvatarFilter(),
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center">
                    <h2 className="text-lg font-bold truncate" style={{ color: getTieColor() }}>
                      {user.role}
                    </h2>
                  </div>
                </div>
                <div className="w-full h-px bg-white/20 mb-2" />
                <div className="mb-2">
                  <p className={`text-xs ${theme.mode === "dark" ? "text-white/50" : "text-gray-400"} mb-1`}>
                    {user.nickname}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {getRoleBadgeIcon(user.role)}
                    <span className="text-xs truncate" style={{ color: getTieColor() }}>
                      {user.position || "Должность не указана"}
                    </span>
                  </div>
                </div>
              </>
            )}
            {isCollapsed && (
              <div
                className="w-12 h-12 flex items-center justify-center mx-auto overflow-hidden rounded-full border-2"
                style={{ borderColor: getTieColor() }}
              >
                <Image
                  src={getAvatarForRole(user.role) || "/placeholder.svg"}
                  alt="Avatar"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover object-center scale-110"
                  style={{
                    filter: getAvatarFilter(),
                  }}
                />
              </div>
            )}
          </div>

          <nav className={`space-y-1 flex-1 overflow-y-auto ${isCollapsed ? "scrollbar-hide" : "pr-2"}`}>
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                className={`w-full ${isCollapsed ? "justify-center px-2 h-10" : "justify-start h-9"} ${
                  activeSection === section.id ? "text-white" : getTextColor()
                } ${activeSection === section.id ? "" : `hover:${getTextColor()}`}`}
                style={
                  activeSection === section.id ? { backgroundColor: getTieColor(), borderColor: getTieColor() } : {}
                }
                onClick={() => onSectionChange(section.id)}
                title={isCollapsed ? section.label : undefined}
              >
                <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                  {sectionIcons[section.id](activeSection === section.id)}
                </span>
                {!isCollapsed && <span className="ml-2 text-sm truncate">{section.label}</span>}
              </Button>
            ))}
          </nav>

          <div className={`mt-auto pt-4 mb-2 ${isCollapsed ? "space-y-2" : "space-y-2"}`}>
            {!isCollapsed ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className={`flex-1 bg-transparent ${getTextColor()} hover:${getTextColor()} border-white/20 hover:border-white/40 h-9 px-2`}
                  onClick={toggleMode}
                  title={theme.mode === "dark" ? "Светлая тема" : "Тёмная тема"}
                >
                  <div className="relative w-4 h-4 flex items-center justify-center">
                    <Sun
                      className={`absolute w-4 h-4 transition-all duration-500 ${
                        theme.mode === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
                      }`}
                    />
                    <Moon
                      className={`absolute w-4 h-4 transition-all duration-500 ${
                        theme.mode === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                      }`}
                    />
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 bg-transparent ${getTextColor()} hover:${getTextColor()} border-white/20 hover:border-white/40 h-9 px-2`}
                  onClick={() => setShowSettings(true)}
                  title="Настройки"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className={`w-10 h-10 mx-auto p-0 flex items-center justify-center bg-transparent ${getTextColor()} hover:${getTextColor()} border-white/20 hover:border-white/40`}
                  onClick={toggleMode}
                  title={theme.mode === "dark" ? "Светлая тема" : "Тёмная тема"}
                >
                  <div className="relative w-4 h-4 flex items-center justify-center">
                    <Sun
                      className={`absolute w-4 h-4 transition-all duration-500 ${
                        theme.mode === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
                      }`}
                    />
                    <Moon
                      className={`absolute w-4 h-4 transition-all duration-500 ${
                        theme.mode === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                      }`}
                    />
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className={`w-10 h-10 mx-auto p-0 flex items-center justify-center bg-transparent ${getTextColor()} hover:${getTextColor()} border-white/20 hover:border-white/40`}
                  onClick={() => setShowSettings(true)}
                  title="Настройки"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </>
            )}

            {!isCollapsed ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className={`flex-1 bg-transparent ${getTextColor()} hover:${getTextColor()} border-white/20 hover:border-white/40 h-9 px-2`}
                  onClick={handleLogout}
                  title="Выйти"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 bg-transparent ${getTextColor()} hover:${getTextColor()} border-white/20 hover:border-white/40 h-9 px-2`}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  title="Свернуть"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className={`w-10 h-10 mx-auto p-0 flex items-center justify-center bg-transparent ${getTextColor()} hover:${getTextColor()} border-white/20 hover:border-white/40`}
                  onClick={handleLogout}
                  title="Выйти"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className={`w-10 h-10 mx-auto p-0 flex items-center justify-center bg-transparent ${getTextColor()} hover:${getTextColor()} border-white/20 hover:border-white/40`}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  title="Развернуть"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </>
  )
}

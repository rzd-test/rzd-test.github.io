"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { ContentSection } from "@/components/sections/content-section"
import { ThemeProvider, useTheme } from "@/contexts/theme-context"
import { useRouter } from "next/navigation"
import type { UserRole } from "@/data/users"
import { getAllUsers } from "@/data/users"
import { getThemeColor } from "@/lib/theme-utils"

interface LocalUser {
  id: string
  nickname: string
  role: UserRole
  position: string
  vkAccessToken: string
}

function MainContentInner() {
  const [activeSection, setActiveSection] = useState("contents")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<LocalUser | null>(null)
  const { theme } = useTheme()
  const router = useRouter()

  const getBackgroundImage = () => {
    return theme.background
  }

  const getTieColor = () => getThemeColor(theme.colorTheme)

  useEffect(() => {
    const checkAuth = async () => {
      const authData = localStorage.getItem("currentUser")

      if (!authData) {
        router.push("/login")
        return
      }

      try {
        const userData = JSON.parse(authData)

        // Fetch latest user data from database
        const allUsers = await getAllUsers()
        const currentUserInDb = allUsers.find((u) => u.id === userData.id)

        if (!currentUserInDb) {
          // User was deleted, log them out
          console.log("[v0] User account was deleted, logging out")
          localStorage.removeItem("currentUser")
          router.push("/login")
          return
        }

        // Update user data with latest from database
        const updatedUserData = {
          id: currentUserInDb.id,
          nickname: currentUserInDb.nickname,
          role: currentUserInDb.role,
          position: currentUserInDb.position,
          vkAccessToken: userData.vkAccessToken || "",
        }

        // Update localStorage with fresh data
        localStorage.setItem("currentUser", JSON.stringify(updatedUserData))
        setUser(updatedUserData)
      } catch (error) {
        console.error("Error parsing auth data:", error)
        router.push("/login")
      }
    }

    checkAuth()

    const refreshInterval = setInterval(async () => {
      const authData = localStorage.getItem("currentUser")
      if (authData) {
        try {
          const userData = JSON.parse(authData)
          const allUsers = await getAllUsers()
          const currentUserInDb = allUsers.find((u) => u.id === userData.id)

          if (!currentUserInDb) {
            // User was deleted
            console.log("[v0] User account was deleted during session, logging out")
            localStorage.removeItem("currentUser")
            router.push("/login")
            return
          }

          // Check if user data changed
          if (
            currentUserInDb.nickname !== userData.nickname ||
            currentUserInDb.role !== userData.role ||
            currentUserInDb.position !== userData.position
          ) {
            console.log("[v0] User data changed, updating without logout")
            const updatedUserData = {
              id: currentUserInDb.id,
              nickname: currentUserInDb.nickname,
              role: currentUserInDb.role,
              position: currentUserInDb.position,
              vkAccessToken: userData.vkAccessToken || "",
            }
            localStorage.setItem("currentUser", JSON.stringify(updatedUserData))
            setUser(updatedUserData)

            // Trigger a custom event to notify other components
            window.dispatchEvent(new Event("userDataUpdated"))
          }
        } catch (error) {
          console.error("Error checking user updates:", error)
        }
      }
    }, 5000) // Check every 5 seconds

    const handleUserUpdate = () => {
      const authData = localStorage.getItem("currentUser")
      if (authData) {
        try {
          const userData = JSON.parse(authData)
          setUser(userData)
        } catch (error) {
          console.error("Error parsing updated auth data:", error)
        }
      }
    }

    window.addEventListener("userRoleUpdated", handleUserUpdate)
    window.addEventListener("userDataUpdated", handleUserUpdate)

    return () => {
      window.removeEventListener("userRoleUpdated", handleUserUpdate)
      window.removeEventListener("userDataUpdated", handleUserUpdate)
      clearInterval(refreshInterval)
    }
  }, [router])

  useEffect(() => {
    document.documentElement.style.setProperty("--scrollbar-color", getTieColor())
  }, [theme.colorTheme])

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        user={user}
      />
      <main
        className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-64"}`}
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div
          className={`min-h-screen ${
            theme.mode === "dark" ? "bg-black/70 backdrop-blur-sm" : "bg-white/80 backdrop-blur-sm"
          }`}
        >
          <div className="p-6 space-y-4">
            <ContentSection activeSection={activeSection} userRole={user?.role} userNickname={user?.nickname} />
          </div>
        </div>
      </main>
    </div>
  )
}

export function MainContent() {
  return (
    <ThemeProvider>
      <MainContentInner />
    </ThemeProvider>
  )
}

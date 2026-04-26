"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authenticateUser } from "@/data/users"
import { useTheme } from "@/contexts/theme-context"
import Image from "next/image"

export default function LoginPage() {
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { theme } = useTheme()

  const loginColor = "#d32f2f"

  useEffect(() => {
    console.log("[v0] Checking for existing logged in user...")
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      console.log("[v0] User already logged in, redirecting to home")
      router.push("/")
    } else {
      console.log("[v0] No user logged in")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("[v0] Login attempt for nickname:", nickname)

    if (!nickname || !password) {
      console.log("[v0] Login failed: empty fields")
      setError("Заполните все поля")
      setLoading(false)
      return
    }

    const user = await authenticateUser(nickname, password)

    if (!user) {
      console.log("[v0] Login failed: authentication returned null")
      setError("Неверный никнейм или пароль")
      setLoading(false)
      return
    }

    console.log("[v0] Login successful, saving user to localStorage")
    localStorage.setItem("currentUser", JSON.stringify(user))

    setLoading(false)
    console.log("[v0] Redirecting to home page")
    router.push("/")
  }

  return (
    <div
      className={`flex min-h-screen w-full items-center justify-center p-6 relative ${
        theme.mode === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-orange-50 via-white to-red-50"
      }`}
      style={{
        backgroundImage:
          "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sapsan-bridge-P2tdAk8LEJIgwJMoqXjcGPvLxnyjps.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <Card
        className={`w-full max-w-sm shadow-2xl border-2 relative z-10 ${
          theme.mode === "dark" ? "bg-black/70 border-white/10" : "bg-white/95 border-gray-200"
        }`}
      >
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-32 h-32 flex items-center justify-center rounded-full overflow-hidden shadow-lg">
              <Image
                src="/images/design-mode/registration-logo.jpg"
                alt="РЖД Logo"
                width={128}
                height={128}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold" style={{ color: loginColor }}>
            РЖД
          </CardTitle>
          <CardDescription className={`text-base ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Методичка РЖД - Вход в систему
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname" className={theme.mode === "dark" ? "text-white" : "text-black"}>
                Никнейм
              </Label>
              <Input
                id="nickname"
                type="text"
                placeholder="Введите ваш никнейм"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className={`h-11 ${
                  theme.mode === "dark"
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-white border-gray-300 text-black"
                }`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className={theme.mode === "dark" ? "text-white" : "text-black"}>
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите ваш пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`h-11 ${
                  theme.mode === "dark"
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-white border-gray-300 text-black"
                }`}
              />
            </div>
            {error && (
              <div
                className={`text-sm p-3 rounded-lg border ${
                  theme.mode === "dark"
                    ? "text-red-200 bg-red-900/20 border-red-800"
                    : "text-red-600 bg-red-50 border-red-200"
                }`}
              >
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-11 text-white font-semibold"
              disabled={loading}
              style={{ backgroundColor: loginColor }}
            >
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

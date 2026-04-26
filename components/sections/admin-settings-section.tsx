"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ShieldOff, Eye, EyeOff, Briefcase, Tag } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sortUsersByPosition } from "@/data/positions"

interface UserData {
  id: string
  nickname: string
  isAdmin: boolean
  vkAccessToken: string
  position?: string
}

export function AdminSettingsSection() {
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const { theme } = useTheme()

  const positions = [
    {
      category: "Руководство депо",
      items: [
        "Начальник Депо",
        "Первый Заместитель Начальника Депо",
        "Зам. Начальника Депо по кадровой работе",
        "Зам. Начальника Депо по эксплуатации",
      ],
    },
    {
      category: "Руководство отделов",
      items: ["Начальник ЭО", "Начальник ЦдУД", "Начальник ПТО"],
    },
    {
      category: "Инструкторы",
      items: [
        "Машинист-инструктор / Зам.Нач.ЭО",
        "Машинист-инструктор / Зам.Нач.ЦдУД",
        "Машинист-инструктор / Зам.Нач.ПТО",
      ],
    },
    {
      category: "Диспетчерская служба",
      items: ["Старший диспетчер", "Поездной диспетчер", "Оператор при ДНЦ"],
    },
    {
      category: "Локомотивные бригады",
      items: ["Машинист 1-го класса", "Машинист 2-го класса", "Машинист 3-го класса", "Помощник машиниста"],
    },
    {
      category: "Технический персонал",
      items: ["Монтёр пути", "Слесарь-электрик"],
    },
  ]

  const getTieColor = () => {
    const colorMap: { [key: string]: string } = {
      red: "#ef4444",
      blue: "#3b82f6",
      orange: "#f97316",
      green: "#22c55e",
      purple: "#a855f7",
      teal: "#14b8a6",
    }
    return colorMap[theme.colorTheme] || "#f97316"
  }

  const getTagFromPosition = (position: string): string => {
    const tagMap: { [key: string]: string } = {
      "ГСЗФ": "[ГСЗФ]",
      "ПГСЗФ": "[ПГСЗФ]",
      "Главный следящий за РЖД": "[Ц] [РЖД]",
      "Помощник Главного Следящего": "[Ц] [РЖД]",
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
      "Машинист 1-го класса": "[ТЧМ-1КМ]",
      "Машинист 2-го класса": "[ТЧМ-2КМ]",
      "Машинист 3-го класса": "[ТЧМ-3КМ]",
      "Помощник машиниста": "[ТЧМП]",
      "Монтёр пути": "[ПЧ]",
      "Слесарь-электрик": "[ТЧР]",
    }
    return tagMap[position] || ""
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    setIsLoading(true)
    setError(null)

    try {
      const usersData = localStorage.getItem("vkUsers")
      if (usersData) {
        const parsedUsers = JSON.parse(usersData)
        setUsers(sortUsersByPosition(parsedUsers))
      } else {
        setUsers([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки пользователей")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const usersData = localStorage.getItem("vkUsers")
      if (!usersData) return

      const users = JSON.parse(usersData)
      const updatedUsers = users.map((u: UserData) => (u.id === userId ? { ...u, isAdmin: !currentStatus } : u))

      localStorage.setItem("vkUsers", JSON.stringify(updatedUsers))

      const authData = localStorage.getItem("currentUser")
      if (authData) {
        const currentUser = JSON.parse(authData)
        if (currentUser.id === userId) {
          localStorage.setItem("currentUser", JSON.stringify({ ...currentUser, isAdmin: !currentStatus }))
          window.dispatchEvent(new Event("userRoleUpdated"))
        }
      }

      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка изменения роли")
    }
  }

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({ ...prev, [userId]: !prev[userId] }))
  }

  const updateUserPosition = (userId: string, position: string) => {
    try {
      const usersData = localStorage.getItem("vkUsers")
      if (!usersData) return

      const users = JSON.parse(usersData)
      const updatedUsers = users.map((u: UserData) => (u.id === userId ? { ...u, position } : u))

      localStorage.setItem("vkUsers", JSON.stringify(updatedUsers))
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка изменения должности")
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Управление аккаунтами</h2>
        <p className="text-muted-foreground">Управление правами доступа и должностями пользователей</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">{error}</div>}

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{user.nickname}</CardTitle>
                  <CardDescription>VK ID: {user.id}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAdmin(user.id, user.isAdmin)}
                    className={user.isAdmin ? "border-2" : ""}
                    style={user.isAdmin ? { borderColor: getTieColor(), color: getTieColor() } : {}}
                  >
                    {user.isAdmin ? (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Админ
                      </>
                    ) : (
                      <>
                        <ShieldOff className="w-4 h-4 mr-2" />
                        Пользователь
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-3">
                <div className="text-sm space-y-2">
                  <p className="text-muted-foreground">
                    Роль:{" "}
                    <span style={user.isAdmin ? { color: getTieColor(), fontWeight: "600" } : {}}>
                      {user.isAdmin ? "Администратор" : "Пользователь"}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">
                      Токен: {showPasswords[user.id] ? user.vkAccessToken : "••••••••••••••••"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility(user.id)}
                      className="h-6 w-6 p-0"
                    >
                      {showPasswords[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" style={{ color: getTieColor() }} />
                    <span className="text-sm font-medium">Должность</span>
                  </div>
                  <Select value={user.position || ""} onValueChange={(value) => updateUserPosition(user.id, value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите должность..." />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((group) => (
                        <div key={group.category}>
                          <div className="px-2 py-1.5 text-xs font-semibold" style={{ color: getTieColor() }}>
                            {group.category}
                          </div>
                          {group.items.map((position) => (
                            <SelectItem key={position} value={position}>
                              {position}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>

                  {user.position && (
                    <div
                      className="flex items-center gap-2 p-2 rounded-lg border"
                      style={{
                        background: `linear-gradient(135deg, ${getTieColor()}15, ${getTieColor()}05)`,
                        borderColor: getTieColor() + "40",
                      }}
                    >
                      <Tag className="w-4 h-4" style={{ color: getTieColor() }} />
                      <span className="text-sm text-muted-foreground">Служебный тег:</span>
                      <span className="font-bold" style={{ color: getTieColor() }}>
                        {getTagFromPosition(user.position)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Пользователи не найдены. Они появятся после первого входа через ВКонтакте.
        </div>
      )}
    </div>
  )
}

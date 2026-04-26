"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getAllUsers, addUser, updateUser, deleteUser, type User } from "@/data/users"
import { useTheme } from "@/contexts/theme-context"
import { allPositions, getRoleFromPosition, sortUsersByPosition, type Position } from "@/data/positions"
import {
  Trash2,
  Edit,
  X,
  Check,
  Eye,
  EyeOff,
  Users,
  UserPlus,
  Crown,
  Shield,
  UsersRound,
  Wrench,
  Train,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { getThemeColor } from "@/lib/theme-utils"
import { getAvatarFilterFromColor } from "@/lib/color-utils"

function getCurrentUser() {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("currentUser")
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error("[v0] Error parsing current user:", e)
      return null
    }
  }
  return null
}

export function AdminSection() {
  const { theme } = useTheme()
  const [users, setUsers] = useState<User[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [newNickname, setNewNickname] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newPosition, setNewPosition] = useState<Position>("Слесарь-электрик")
  const [editNickname, setEditNickname] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [editPosition, setEditPosition] = useState<Position>("Слесарь-электрик")
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
      console.log("[v0] Admin section initializing...")
      setIsLoading(true)
      const loadedUsers = await getAllUsers()
      const sortedUsers = sortUsersByPosition(loadedUsers)
      console.log("[v0] Loaded users in admin section:", sortedUsers.length)
      setUsers(sortedUsers)

      const current = getCurrentUser()
      console.log("[v0] Current user in admin section:", current?.nickname, "Role:", current?.role)
      setCurrentUser(current)
      setIsLoading(false)
    }

    loadUsers()

    const handleUserDataUpdate = () => {
      console.log("[v0] User data updated, refreshing admin panel")
      loadUsers()
    }

    window.addEventListener("userDataUpdated", handleUserDataUpdate)

    return () => {
      window.removeEventListener("userDataUpdated", handleUserDataUpdate)
    }
  }, [])

  const canAddUser = () => {
    if (!currentUser) return false
    return currentUser.role === "Руководство" || currentUser.role === "Заместитель"
  }

  const canDeleteUser = (user: User) => {
    if (!currentUser) return false
    if (currentUser.role === "Руководство") return true
    if (currentUser.role === "Заместитель") {
      return user.role === "ПТО" || user.role === "ЦдУД"
    }
    return false
  }

  const canEditUser = (user: User) => {
    if (!currentUser) return false
    if (currentUser.role === "Руководство") return true
    if (currentUser.role === "Заместитель") {
      return user.role === "ПТО" || user.role === "ЦдУД"
    }
    if (currentUser.role === "Старший Состав") {
      return user.role === "ПТО" || user.role === "ЦдУД"
    }
    return false
  }

  const canSeePassword = (user: User) => {
    if (!currentUser) return false
    if (currentUser.role === "Руководство") return true
    if (currentUser.role === "Заместитель") {
      return user.role === "ЦдУД" || user.role === "ПТО"
    }
    return false
  }

  const canChangeRole = (user: User) => {
    if (!currentUser) return false
    if (currentUser.role === "Руководство") return true
    if (currentUser.role === "Заместитель") {
      return user.role === "ПТО" || user.role === "ЦдУД"
    }
    if (currentUser.role === "Старший Состав") {
      return user.role === "ПТО" || user.role === "ЦдУД"
    }
    return false
  }

  const getAvailablePositions = (): Position[] => {
    if (!currentUser) return []
    if (currentUser.role === "Руководство") {
      return allPositions
    }
    if (currentUser.role === "Заместитель") {
      // Can only assign ЦдУД and ПТО positions
      return allPositions.filter((pos) => {
        const role = getRoleFromPosition(pos)
        return role === "ЦдУД" || role === "ПТО"
      })
    }
    if (currentUser.role === "Старший Состав") {
      // Can only assign ЦдУД and ПТО positions
      return allPositions.filter((pos) => {
        const role = getRoleFromPosition(pos)
        return role === "ЦдУД" || role === "ПТО"
      })
    }
    return []
  }

  const handleAddUser = async () => {
    if (newNickname && newPassword && canAddUser()) {
      console.log("[v0] Admin section: Adding user", newNickname)
      await addUser(newNickname, newPassword, newPosition)
      const updatedUsers = await getAllUsers()
      const sortedUsers = sortUsersByPosition(updatedUsers)
      console.log("[v0] Users after adding:", sortedUsers.length)
      setUsers(sortedUsers)
      setNewNickname("")
      setNewPassword("")
      setNewPosition("Слесарь-электрик")
      setShowAddForm(false)
      window.dispatchEvent(new Event("userDataUpdated"))
    } else {
      console.log("[v0] Cannot add user. Can add:", canAddUser(), "Nickname:", newNickname, "Password:", !!newPassword)
    }
  }

  const handleDeleteUser = async (id: string) => {
    const user = users.find((u) => u.id === id)
    if (user && canDeleteUser(user) && confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      console.log("[v0] Deleting user:", user.nickname)
      await deleteUser(id)
      const updatedUsers = await getAllUsers()
      const sortedUsers = sortUsersByPosition(updatedUsers)
      console.log("[v0] Users after deletion:", sortedUsers.length)
      setUsers(sortedUsers)
      window.dispatchEvent(new Event("userDataUpdated"))
    }
  }

  const handleStartEdit = (user: User) => {
    if (canEditUser(user)) {
      setEditingUser(user.id)
      setEditNickname(user.nickname)
      setEditPassword(user.password)
      setEditPosition(user.position)
    }
  }

  const handleSaveEdit = async (id: string) => {
    const user = users.find((u) => u.id === id)
    if (!user) return

    console.log("[v0] Saving user edit for:", user.nickname)

    if (editNickname && editPassword) {
      if (currentUser?.role === "Старший Состав") {
        await updateUser(id, { nickname: editNickname, position: editPosition })
      } else {
        await updateUser(id, { nickname: editNickname, password: editPassword, position: editPosition })
      }
      const updatedUsers = await getAllUsers()
      const sortedUsers = sortUsersByPosition(updatedUsers)
      setUsers(sortedUsers)
      setEditingUser(null)

      if (currentUser && currentUser.id === id) {
        const allUsers = await getAllUsers()
        const updatedUser = allUsers.find((u) => u.id === id)
        if (updatedUser) {
          console.log("[v0] Updating current user in localStorage")
          localStorage.setItem("currentUser", JSON.stringify(updatedUser))
          setCurrentUser(updatedUser)
        }
      }

      window.dispatchEvent(new Event("userDataUpdated"))
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditNickname("")
    setEditPassword("")
  }

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const getAvatarFilter = () => {
    return getAvatarFilterFromColor(theme.colorTheme)
  }

  const getAvatarForRole = (role: User["role"]) => {
    const avatarMap = {
      Руководство: "/avatars/management.png",
      Заместитель: "/avatars/senior-staff.png",
      "Старший Состав": "/avatars/senior-staff.png",
      ЦдУД: "/avatars/cdud.png",
      ПТО: "/avatars/pto.png",
    }
    return avatarMap[role] || "/avatars/senior-staff.png"
  }

  const getRoleIcon = (role: User["role"], size: "sm" | "md" = "md") => {
    const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5"
    const color = "#ffffff"

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
        return <Users className={iconSize} style={{ color }} />
    }
  }

  const getUserAvatar = (role: User["role"]) => {
    return (
      <div
        className="w-10 h-10 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-full border-2"
        style={{ borderColor: getTieColor() }}
      >
        <Image
          src={getAvatarForRole(role) || "/placeholder.svg"}
          alt={role}
          width={40}
          height={40}
          className="w-full h-full object-cover object-center scale-110"
          style={{
            filter: getAvatarFilter(),
          }}
        />
      </div>
    )
  }

  const getRoleBadge = (role: User["role"]) => {
    const badgeIconSize = "w-5 h-5"
    const badgeIconColor = getTieColor()

    let badgeIcon
    switch (role) {
      case "Руководство":
        badgeIcon = <Crown className={badgeIconSize} style={{ color: badgeIconColor }} />
        break
      case "Заместитель":
        badgeIcon = <Shield className={badgeIconSize} style={{ color: badgeIconColor }} />
        break
      case "Старший Состав":
        badgeIcon = <UsersRound className={badgeIconSize} style={{ color: badgeIconColor }} />
        break
      case "ЦдУД":
        badgeIcon = <Train className={badgeIconSize} style={{ color: badgeIconColor }} />
        break
      case "ПТО":
        badgeIcon = <Wrench className={badgeIconSize} style={{ color: badgeIconColor }} />
        break
      default:
        badgeIcon = <Users className={badgeIconSize} style={{ color: badgeIconColor }} />
    }

    return (
      <div
        className="flex items-center justify-center w-7 h-7 rounded-lg shadow-sm"
        style={{ backgroundColor: getTieColor() + "20" }}
      >
        {badgeIcon}
      </div>
    )
  }

  return (
    <div className="space-y-6 opacity-95">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <div
          className="p-3 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${getTieColor()}20, ${getTieColor()}10)`,
          }}
        >
          <Users className="w-6 h-6" style={{ color: getTieColor() }} />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
            Управление аккаунтами
          </h2>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Управление правами доступа и учётными записями
          </p>
        </div>
        {canAddUser() && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-white font-semibold shadow-lg"
            style={{ backgroundColor: getTieColor() }}
            size="lg"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Добавить аккаунт
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Загрузка пользователей...
          </p>
        </div>
      ) : (
        <>
          {showAddForm && canAddUser() && (
            <Card
              className={`border-2 rounded-2xl overflow-hidden ${
                theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
              }`}
            >
              <CardHeader
                className="border-b pb-4"
                style={{
                  borderColor: getTieColor(),
                }}
              >
                <h3 className="text-xl font-bold flex items-center gap-3" style={{ color: getTieColor() }}>
                  <UserPlus className="w-5 h-5" />
                  Новый аккаунт
                </h3>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${theme.mode === "dark" ? "text-white/90" : "text-gray-700"}`}>
                    Никнейм
                  </label>
                  <Input
                    placeholder="Введите никнейм..."
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className={`h-12 ${
                      theme.mode === "dark"
                        ? "bg-white/5 border-white/10 text-white"
                        : "bg-white border-gray-300 text-black"
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${theme.mode === "dark" ? "text-white/90" : "text-gray-700"}`}>
                    Пароль
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Введите пароль..."
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`h-12 pr-12 ${
                        theme.mode === "dark"
                          ? "bg-white/5 border-white/10 text-white"
                          : "bg-white border-gray-300 text-black"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: getTieColor() }}
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${theme.mode === "dark" ? "text-white/90" : "text-gray-700"}`}>
                    Должность
                  </label>
                  <Select value={newPosition} onValueChange={(value) => setNewPosition(value as Position)}>
                    <SelectTrigger
                      className={`h-12 ${
                        theme.mode === "dark"
                          ? "bg-white/5 border-white/10 text-white"
                          : "bg-white border-gray-300 text-black"
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePositions().map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleAddUser}
                    className="flex-1 text-white font-semibold h-12"
                    style={{ backgroundColor: getTieColor() }}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Создать аккаунт
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className={`flex-1 h-12 ${theme.mode === "dark" ? "border-white/20 hover:bg-white/5" : "border-gray-300 hover:bg-gray-50"}`}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Отмена
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Нет пользователей для отображения
                </p>
              </div>
            ) : (
              users.map((user) => (
                <Card
                  key={user.id}
                  className={`border-2 rounded-xl overflow-hidden transition-all duration-200 ${
                    theme.mode === "dark"
                      ? "bg-[#0f1419]/50 border-white/10 hover:border-white/20"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <CardContent className="px-2">
                    {editingUser === user.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {getUserAvatar(getRoleFromPosition(editPosition))}
                          <Input
                            value={editNickname}
                            onChange={(e) => setEditNickname(e.target.value)}
                            className={`flex-1 h-9 ${
                              theme.mode === "dark"
                                ? "bg-white/5 border-white/10 text-white"
                                : "bg-white border-gray-300 text-black"
                            }`}
                          />
                        </div>
                        {canSeePassword(user) && (
                          <div className="relative">
                            <Input
                              type={showEditPassword ? "text" : "password"}
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              placeholder="Пароль"
                              className={`h-9 pr-12 ${
                                theme.mode === "dark"
                                  ? "bg-white/5 border-white/10 text-white"
                                  : "bg-white border-gray-300 text-black"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowEditPassword(!showEditPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              style={{ color: getTieColor() }}
                            >
                              {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        )}
                        {canChangeRole(user) && (
                          <Select value={editPosition} onValueChange={(value) => setEditPosition(value as Position)}>
                            <SelectTrigger
                              className={`h-9 ${
                                theme.mode === "dark"
                                  ? "bg-white/5 border-white/10 text-white"
                                  : "bg-white border-gray-300 text-black"
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailablePositions().map((position) => (
                                <SelectItem key={position} value={position}>
                                  {position}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSaveEdit(user.id)}
                            className="flex-1 text-white font-semibold h-9"
                            style={{ backgroundColor: getTieColor() }}
                            size="sm"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Сохранить
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                            className={`flex-1 h-9 ${theme.mode === "dark" ? "border-white/20" : "border-gray-300"}`}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {getUserAvatar(user.role)}

                        <div className="flex-1 min-w-0 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3
                                className={`text-sm font-bold truncate ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}
                              >
                                {user.nickname}
                              </h3>
                              {getRoleBadge(user.role)}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div
                                className="w-3 h-3 flex-shrink-0 flex items-center justify-center"
                                style={{ color: getTieColor() }}
                              >
                                {getRoleIcon(user.role, "sm")}
                              </div>
                              <p
                                className={`text-xs truncate ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}
                              >
                                {user.position}
                              </p>
                            </div>
                          </div>

                          {canSeePassword(user) && (
                            <div className="flex items-center gap-1.5">
                              <p
                                className={`text-xs font-mono ${theme.mode === "dark" ? "text-white/60" : "text-gray-500"}`}
                              >
                                {showPasswords[user.id] ? user.password : "••••••••"}
                              </p>
                              <button
                                onClick={() => setShowPasswords((prev) => ({ ...prev, [user.id]: !prev[user.id] }))}
                                className={`p-1 rounded transition-colors ${theme.mode === "dark" ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                                style={{ color: getTieColor() }}
                              >
                                {showPasswords[user.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-auto">
                          {canEditUser(user) && (
                            <Button
                              onClick={() => handleStartEdit(user)}
                              variant="outline"
                              size="sm"
                              className={`h-8 w-8 p-0 ${theme.mode === "dark" ? "border-white/20 hover:bg-white/5" : "border-gray-300 hover:bg-gray-50"}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {canDeleteUser(user) && (
                            <Button
                              onClick={() => handleDeleteUser(user.id)}
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-red-500/50 text-red-500 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

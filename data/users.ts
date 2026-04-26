import { type Position, getRoleFromPosition, type UserRole } from "./positions"
import { getSupabase } from "@/lib/supabase"
import { migrateLocalStorageToSupabase } from "@/lib/migrate-to-supabase"

export type { UserRole } from "./positions"

export interface User {
  id: string
  nickname: string
  password: string
  role: UserRole
  position: Position
  createdAt: string
}

let cachedUsers: User[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5000 // 5 seconds cache

function getLocalStorageUsers(): User[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem("users")
  if (!stored) {
    return []
  }

  return JSON.parse(stored)
}

function saveLocalStorageUsers(users: User[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("users", JSON.stringify(users))
}

async function initializeUsers(forceRefresh = false): Promise<User[]> {
  const now = Date.now()
  if (!forceRefresh && cachedUsers && now - lastFetchTime < CACHE_DURATION) {
    console.log("[v0] Returning cached users")
    return cachedUsers
  }

  console.log("[v0] Initializing users from Supabase...")
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching users from Supabase:", error)
      console.log("[v0] Falling back to localStorage")
      return getLocalStorageUsers()
    }

    if (!data || data.length === 0) {
      console.log("[v0] No users found in Supabase, checking if migration is needed")

      const localUsers = getLocalStorageUsers()
      if (localUsers.length > 0 && typeof window !== "undefined") {
        console.log("[v0] Attempting automatic migration from localStorage to Supabase")
        const result = await migrateLocalStorageToSupabase()
        if (result.success && result.migratedCount > 0) {
          console.log(`[v0] Successfully migrated ${result.migratedCount} users, refetching from Supabase`)
          const { data: newData } = await supabase.from("users").select("*").order("created_at", { ascending: true })
          if (newData && newData.length > 0) {
            const users = newData.map((row: any) => ({
              id: row.id,
              nickname: row.username,
              password: row.password,
              role: getRoleFromPosition(row.position as Position),
              position: row.position as Position,
              createdAt: row.created_at,
            }))
            cachedUsers = users
            lastFetchTime = Date.now()
            return users
          }
        }
      }

      return localUsers
    }

    console.log("[v0] Found users in Supabase:", data.length, "users")

    const users = data.map((row: any) => ({
      id: row.id,
      nickname: row.username,
      password: row.password,
      role: getRoleFromPosition(row.position as Position),
      position: row.position as Position,
      createdAt: row.created_at,
    }))

    cachedUsers = users
    lastFetchTime = Date.now()

    return users
  } catch (err) {
    console.error("[v0] Exception when fetching from Supabase:", err)
    console.log("[v0] Falling back to localStorage")
    return getLocalStorageUsers()
  }
}

export function invalidateUserCache() {
  cachedUsers = null
  lastFetchTime = 0
}

export async function addUser(nickname: string, password: string, position: Position): Promise<User | null> {
  console.log("[v0] Adding new user:", nickname, "with position:", position)
  const supabase = getSupabase()
  const role = getRoleFromPosition(position)

  try {
    const { data: existingUser } = await supabase.from("users").select("*").eq("username", nickname).single()

    if (existingUser) {
      console.log("[v0] User already exists:", nickname)
      return {
        id: existingUser.id,
        nickname: existingUser.username,
        password: existingUser.password,
        role: getRoleFromPosition(existingUser.position as Position),
        position: existingUser.position as Position,
        createdAt: existingUser.created_at,
      }
    }

    const { data, error } = await supabase
      .from("users")
      .insert({
        username: nickname,
        password: password,
        full_name: `[${role}] ${nickname}`,
        position: position,
        rank: getRankFromRole(role),
        avatar: getAvatarFromRole(role),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding user to Supabase:", error)
      console.log("[v0] Falling back to localStorage")

      const users = getLocalStorageUsers()
      const newUser: User = {
        id: Date.now().toString(),
        nickname,
        password,
        role,
        position,
        createdAt: new Date().toISOString(),
      }
      users.push(newUser)
      saveLocalStorageUsers(users)
      return newUser
    }

    console.log("[v0] User added successfully to Supabase")
    invalidateUserCache()

    return {
      id: data.id,
      nickname: data.username,
      password: data.password,
      role: getRoleFromPosition(data.position as Position),
      position: data.position as Position,
      createdAt: data.created_at,
    }
  } catch (err) {
    console.error("[v0] Exception when adding user:", err)
    console.log("[v0] Falling back to localStorage")

    const users = getLocalStorageUsers()
    const newUser: User = {
      id: Date.now().toString(),
      nickname,
      password,
      role,
      position,
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    saveLocalStorageUsers(users)
    return newUser
  }
}

export async function updateUser(id: string, updates: Partial<Omit<User, "id" | "createdAt">>): Promise<User | null> {
  console.log("[v0] Updating user:", id, "with updates:", updates)
  const supabase = getSupabase()

  try {
    const supabaseUpdates: any = {
      updated_at: new Date().toISOString(),
    }

    if (updates.nickname) supabaseUpdates.username = updates.nickname
    if (updates.password) supabaseUpdates.password = updates.password
    if (updates.position) {
      supabaseUpdates.position = updates.position
      const role = getRoleFromPosition(updates.position)
      supabaseUpdates.rank = getRankFromRole(role)
      supabaseUpdates.avatar = getAvatarFromRole(role)
      supabaseUpdates.full_name = `[${role}] ${updates.nickname || ""}`
    }

    const { data, error } = await supabase.from("users").update(supabaseUpdates).eq("id", id).select().single()

    if (error) {
      console.error("[v0] Error updating user in Supabase:", error)
      console.log("[v0] Falling back to localStorage")

      const users = getLocalStorageUsers()
      const userIndex = users.findIndex((u) => u.id === id)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates }
        saveLocalStorageUsers(users)
        return users[userIndex]
      }
      return null
    }

    console.log("[v0] User updated successfully in Supabase")
    invalidateUserCache()

    return {
      id: data.id,
      nickname: data.username,
      password: data.password,
      role: getRoleFromPosition(data.position as Position),
      position: data.position as Position,
      createdAt: data.created_at,
    }
  } catch (err) {
    console.error("[v0] Exception when updating user:", err)
    console.log("[v0] Falling back to localStorage")

    const users = getLocalStorageUsers()
    const userIndex = users.findIndex((u) => u.id === id)
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      saveLocalStorageUsers(users)
      return users[userIndex]
    }
    return null
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  console.log("[v0] Deleting user:", id)
  const supabase = getSupabase()

  try {
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting user from Supabase:", error)
      console.log("[v0] Falling back to localStorage")

      const users = getLocalStorageUsers()
      const filteredUsers = users.filter((u) => u.id !== id)
      saveLocalStorageUsers(filteredUsers)
      return true
    }

    console.log("[v0] User deleted successfully from Supabase")
    invalidateUserCache()
    return true
  } catch (err) {
    console.error("[v0] Exception when deleting user:", err)
    console.log("[v0] Falling back to localStorage")

    const users = getLocalStorageUsers()
    const filteredUsers = users.filter((u) => u.id !== id)
    saveLocalStorageUsers(filteredUsers)
    return true
  }
}

export async function findUserByNickname(nickname: string): Promise<User | undefined> {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase.from("users").select("*").eq("username", nickname).single()

    if (error || !data) {
      console.log("[v0] User not found in Supabase, checking localStorage")
      const users = getLocalStorageUsers()
      return users.find((u) => u.nickname === nickname)
    }

    return {
      id: data.id,
      nickname: data.username,
      password: data.password,
      role: getRoleFromPosition(data.position as Position),
      position: data.position as Position,
      createdAt: data.created_at,
    }
  } catch (err) {
    console.error("[v0] Exception when finding user:", err)
    const users = getLocalStorageUsers()
    return users.find((u) => u.nickname === nickname)
  }
}

export async function authenticateUser(nickname: string, password: string): Promise<User | null> {
  console.log("[v0] Attempting to authenticate user:", nickname)
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", nickname)
      .eq("password", password)
      .single()

    if (error || !data) {
      console.log("[v0] Authentication failed in Supabase, checking localStorage")
      const users = getLocalStorageUsers()
      const user = users.find((u) => u.nickname === nickname && u.password === password)

      if (!user) {
        console.log("[v0] Authentication failed in localStorage too")
        return null
      }

      console.log("[v0] Authentication successful in localStorage")
      return user
    }

    console.log("[v0] Authentication successful in Supabase")
    return {
      id: data.id,
      nickname: data.username,
      password: data.password,
      role: getRoleFromPosition(data.position as Position),
      position: data.position as Position,
      createdAt: data.created_at,
    }
  } catch (err) {
    console.error("[v0] Exception when authenticating:", err)
    console.log("[v0] Falling back to localStorage authentication")
    const users = getLocalStorageUsers()
    const user = users.find((u) => u.nickname === nickname && u.password === password)

    if (!user) {
      console.log("[v0] Authentication failed")
      return null
    }

    console.log("[v0] Authentication successful in localStorage")
    return user
  }
}

export async function getAllUsers(forceRefresh = false): Promise<User[]> {
  return await initializeUsers(forceRefresh)
}

function getRankFromRole(role: UserRole): number {
  const rankMap: Record<UserRole, number> = {
    Руководство: 9,
    Заместитель: 8,
    "Старший Состав": 7,
    ЦдУД: 5,
    ПТО: 3,
  }
  return rankMap[role] || 1
}

function getAvatarFromRole(role: UserRole): string {
  const avatarMap: Record<UserRole, string> = {
    Руководство: "/avatars/management.png",
    Заместитель: "/avatars/management.png",
    "Старший Состав": "/avatars/senior-staff.png",
    ЦдУД: "/avatars/cdud.png",
    ПТО: "/avatars/pto.png",
  }
  return avatarMap[role] || "/avatars/cdud.png"
}

export function canManageAllRoles(role: UserRole): boolean {
  return role === "Руководство"
}

export function canManageCdUDAndPTO(role: UserRole): boolean {
  return role === "Руководство" || role === "Заместитель"
}

export function canChangeBetweenCdUDAndPTO(role: UserRole): boolean {
  return role === "Руководство" || role === "Заместитель" || role === "Старший Состав"
}

export function canSeePasswords(role: UserRole): boolean {
  return role === "Руководство" || role === "Заместитель"
}

export function canAccessManagement(role: UserRole): boolean {
  return role !== "ПТО" && role !== "ЦдУД"
}

export function canAccessInterviews(role: UserRole): boolean {
  return true
}

export function canAccessMaintenance(role: UserRole): boolean {
  return role === "ЦдУД" || role === "ПТО"
}

export function canAccessReportGeneration(role: UserRole): boolean {
  return true
}

export function canSeeLeadershipReport(role: UserRole): boolean {
  return role === "Руководство"
}

export function canSeeReprimandReport(role: UserRole): boolean {
  return true
}

export function canSeeCDUDReport(role: UserRole): boolean {
  return role === "ЦдУД"
}

export function canSeePTOReport(role: UserRole): boolean {
  return role === "ПТО"
}

export function canSeeSeniorStaffReport(role: UserRole): boolean {
  return role === "Старший Состав"
}

export function canAccessReportCompiler(role: UserRole): boolean {
  return role !== "ПТО"
}

export function canAccessEducationalContent(role: UserRole): boolean {
  return role !== "ПТО" && role !== "ЦдУД"
}

export function canAccessOrders(role: UserRole): boolean {
  return role !== "ПТО" && role !== "ЦдУД"
}

export function canAccessGovWave(role: UserRole): boolean {
  return role === "Руководство" || role === "Заместитель"
}

export function canAccessGoogleSheets(role: UserRole): boolean {
  return role === "Руководство" || role === "Заместитель" || role === "Старший Состав"
}

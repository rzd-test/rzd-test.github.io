import { createBrowserClient } from "@supabase/ssr"
import type { Position } from "@/data/positions"
import { getRoleFromPosition } from "@/data/positions"

interface LocalStorageUser {
  id: string
  nickname: string
  password: string
  position: Position
  createdAt: string
}

function getRankFromRole(role: string): number {
  const rankMap: Record<string, number> = {
    Руководство: 9,
    Заместитель: 8,
    "Старший Состав": 7,
    ЦдУД: 5,
    ПТО: 3,
  }
  return rankMap[role] || 1
}

function getAvatarFromRole(role: string): string {
  const avatarMap: Record<string, string> = {
    Руководство: "/avatars/management.png",
    Заместитель: "/avatars/management.png",
    "Старший Состав": "/avatars/senior-staff.png",
    ЦдУД: "/avatars/cdud.png",
    ПТО: "/avatars/pto.png",
  }
  return avatarMap[role] || "/avatars/cdud.png"
}

export async function migrateLocalStorageToSupabase(): Promise<{
  success: boolean
  migratedCount: number
  error?: string
}> {
  console.log("[v0] Starting migration from localStorage to Supabase...")

  // Get users from localStorage
  const localStorageUsers = localStorage.getItem("users")
  if (!localStorageUsers) {
    console.log("[v0] No users found in localStorage")
    return { success: true, migratedCount: 0 }
  }

  const users: LocalStorageUser[] = JSON.parse(localStorageUsers)
  console.log(`[v0] Found ${users.length} users in localStorage`)

  // Create Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  try {
    // Check if users already exist in Supabase
    const { data: existingUsers, error: fetchError } = await supabase.from("users").select("username")

    if (fetchError) {
      console.error("[v0] Error fetching existing users:", fetchError)
      return { success: false, migratedCount: 0, error: fetchError.message }
    }

    const existingNicknames = new Set(existingUsers?.map((u) => u.username) || [])
    console.log(`[v0] Found ${existingNicknames.size} users already in Supabase`)

    // Migrate users that don't exist in Supabase yet
    let migratedCount = 0
    for (const user of users) {
      if (existingNicknames.has(user.nickname)) {
        console.log(`[v0] User ${user.nickname} already exists in Supabase, skipping`)
        continue
      }

      const role = getRoleFromPosition(user.position)
      const { error } = await supabase.from("users").insert({
        username: user.nickname,
        password: user.password,
        full_name: `[${role}] ${user.nickname}`,
        position: user.position,
        rank: getRankFromRole(role),
        avatar: getAvatarFromRole(role),
      })

      if (error) {
        console.error(`[v0] Error migrating user ${user.nickname}:`, error)
      } else {
        console.log(`[v0] Successfully migrated user ${user.nickname}`)
        migratedCount++
      }
    }

    console.log(`[v0] Migration complete! Migrated ${migratedCount} users to Supabase`)
    return { success: true, migratedCount }
  } catch (err) {
    console.error("[v0] Exception during migration:", err)
    return { success: false, migratedCount: 0, error: String(err) }
  }
}

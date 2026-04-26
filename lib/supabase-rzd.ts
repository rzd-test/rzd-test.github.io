// Supabase client for RZD website data management
import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseRZD = createBrowserClient(supabaseUrl, supabaseAnonKey)

export interface Article {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  is_published: boolean
  author_name: string
  author_id: string
  category?: string
  allowed_roles: string[]
  image_url?: string[] // Changed from string to string[] to support multiple images
}

// API functions for articles
export async function getArticles(): Promise<Article[]> {
  const { data, error } = await supabaseRZD
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching articles:", error)
    return []
  }

  return data || []
}

export async function createArticle(
  article: Omit<Article, "id" | "created_at" | "updated_at">,
): Promise<Article | null> {
  const { data, error } = await supabaseRZD.from("articles").insert([article]).select().single()

  if (error) {
    console.error("[v0] Error creating article:", error)
    return null
  }

  return data
}

export async function updateArticle(id: string, updates: Partial<Article>): Promise<Article | null> {
  const { data, error } = await supabaseRZD
    .from("articles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating article:", error)
    return null
  }

  return data
}

export async function deleteArticle(id: string): Promise<boolean> {
  const { error } = await supabaseRZD.from("articles").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting article:", error)
    return false
  }

  return true
}

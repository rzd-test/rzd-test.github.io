import { createBrowserClient } from "@supabase/ssr"

let client: any = null

export function getSupabase() {
  if (client) return client

  const url = process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY!

  client = createBrowserClient(url, key)
  return client
}

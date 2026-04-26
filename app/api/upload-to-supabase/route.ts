import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4 MB
const BUCKET_NAME = "uploads"

async function ensureBucketExists(supabase: ReturnType<typeof createClient>) {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("[v0] Ошибка при проверке buckets:", listError)
      return false
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME)

    if (!bucketExists) {
      console.log("[v0] Bucket не найден, создаём новый:", BUCKET_NAME)

      // Create public bucket
      const { data, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      })

      if (createError) {
        console.error("[v0] Ошибка при создании bucket:", createError)
        return false
      }

      console.log("[v0] Bucket успешно создан:", BUCKET_NAME)
    } else {
      console.log("[v0] Bucket уже существует:", BUCKET_NAME)
    }

    return true
  } catch (error) {
    console.error("[v0] Ошибка в ensureBucketExists:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const nickname = formData.get("nickname") as string
    const activityType = formData.get("activityType") as string
    const title = formData.get("title") as string

    console.log("[v0] Получен запрос на загрузку изображения:", {
      fileName: file?.name,
      fileSize: file ? `${(file.size / 1024 / 1024).toFixed(2)} МБ` : "N/A",
      nickname,
      activityType,
      title,
    })

    if (!file) {
      return NextResponse.json({ error: "Файл не предоставлен" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Файл должен быть изображением" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Файл слишком большой",
          details: `Файл "${file.name}" превышает максимальный размер 4 МБ (размер: ${(file.size / 1024 / 1024).toFixed(2)} МБ)`,
        },
        { status: 413 },
      )
    }

    if (!nickname || !activityType || !title) {
      return NextResponse.json(
        { error: "Не указаны обязательные поля: никнейм, тип активности или название" },
        { status: 400 },
      )
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const bucketReady = await ensureBucketExists(supabase)
    if (!bucketReady) {
      return NextResponse.json(
        {
          error: "Не удалось подготовить хранилище",
          details: "Bucket не может быть создан или проверен",
        },
        { status: 500 },
      )
    }

    const sanitizeFolderName = (name: string) => {
      // Remove square brackets and other special characters
      let sanitized = name.replace(/[[\]<>:"|?*/\\]/g, "")
      // Replace spaces with underscores
      sanitized = sanitized.replace(/\s+/g, "_")
      // Remove or replace non-ASCII characters (including Cyrillic)
      sanitized = sanitized.replace(/[^\x00-\x7F]/g, "")
      // Remove any remaining invalid characters, keep only alphanumeric, underscore, hyphen, dot
      sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "")
      // Remove leading/trailing underscores or hyphens
      sanitized = sanitized.replace(/^[_-]+|[_-]+$/g, "")
      // If empty after sanitization, use a default
      return sanitized || "user"
    }

    const folderPath = `articles/${sanitizeFolderName(nickname)}/${sanitizeFolderName(activityType)}`
    const fileName = `${Date.now()}-${sanitizeFolderName(file.name)}`
    const filePath = `${folderPath}/${fileName}`

    console.log("[v0] Загрузка файла в Supabase Storage:", filePath)

    const fileBuffer = await file.arrayBuffer()
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: true,
    })

    if (error) {
      console.error("[v0] Ошибка загрузки в Supabase Storage:", error)
      return NextResponse.json(
        {
          error: "Не удалось загрузить файл",
          details: error.message,
        },
        { status: 500 },
      )
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    console.log("[v0] Файл успешно загружен, публичный URL:", publicUrl)

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Ошибка загрузки в Supabase Storage:", error)
    return NextResponse.json(
      {
        error: "Ошибка при загрузке файла",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

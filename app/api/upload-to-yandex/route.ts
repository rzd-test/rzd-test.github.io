import { type NextRequest, NextResponse } from "next/server"

const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4 MB
const MAX_TOTAL_SIZE = 4 * 1024 * 1024 // 4 MB total

async function ensureFolderExists(folderPath: string, token: string): Promise<boolean> {
  try {
    console.log("[v0] Проверка существования папки:", folderPath)

    const checkResponse = await fetch(
      `https://cloud-api.yandex.net/v1/disk/resources?path=${encodeURIComponent(folderPath)}`,
      {
        method: "GET",
        headers: {
          Authorization: `OAuth ${token}`,
        },
        cache: "no-store",
      },
    )

    if (checkResponse.ok) {
      console.log("[v0] Папка уже существует:", folderPath)
      return true
    }

    if (checkResponse.status === 404) {
      console.log("[v0] Папка не найдена, создаём:", folderPath)
      const createResponse = await fetch(
        `https://cloud-api.yandex.net/v1/disk/resources?path=${encodeURIComponent(folderPath)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `OAuth ${token}`,
          },
          cache: "no-store",
        },
      )

      if (createResponse.ok) {
        console.log("[v0] Папка успешно создана:", folderPath)
        return true
      } else {
        const errorData = await createResponse.json().catch(() => ({}))
        console.error("[v0] Ошибка создания папки:", createResponse.status, errorData)
        return false
      }
    }

    const errorData = await checkResponse.json().catch(() => ({}))
    console.error("[v0] Неожиданный статус при проверке папки:", checkResponse.status, errorData)
    return false
  } catch (error) {
    console.error("[v0] Ошибка проверки/создания папки:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("file") as File[]
    const nickname = formData.get("nickname") as string
    const activityType = formData.get("activityType") as string
    const title = formData.get("title") as string

    console.log("[v0] Получен запрос на загрузку:", {
      filesCount: files.length,
      fileNames: files.map((f) => f.name),
      fileSizes: files.map((f) => `${(f.size / 1024 / 1024).toFixed(2)} МБ`),
      nickname,
      activityType,
      title,
    })

    if (files.length === 0) {
      return NextResponse.json({ error: "Файлы не предоставлены" }, { status: 400 })
    }

    let totalSize = 0
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: "Файл слишком большой",
            details: `Файл "${file.name}" превышает максимальный размер 4 МБ (размер: ${(file.size / 1024 / 1024).toFixed(2)} МБ)`,
          },
          { status: 413 },
        )
      }
      totalSize += file.size
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        {
          error: "Общий размер файлов слишком большой",
          details: `Общий размер файлов превышает 4 МБ (размер: ${(totalSize / 1024 / 1024).toFixed(2)} МБ). Пожалуйста, загрузите файлы меньшего размера или по отдельности.`,
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

    console.log(
      "[v0] Начало загрузки файлов на Яндекс Диск:",
      files.length,
      "Общий размер:",
      (totalSize / 1024 / 1024).toFixed(2),
      "МБ",
    )

    const YANDEX_OAUTH_TOKEN = process.env.YANDEX_OAUTH_TOKEN

    if (!YANDEX_OAUTH_TOKEN) {
      console.error("[v0] Yandex OAuth token not configured")
      return NextResponse.json({ error: "Яндекс Диск не настроен. Обратитесь к администратору." }, { status: 500 })
    }

    const sanitizeFolderName = (name: string) => {
      return name.replace(/[<>:"|?*/\\[\]]/g, "_")
    }

    const baseFolderPath = "/РЖД_Отчеты"

    console.log("[v0] Проверка базовой папки:", baseFolderPath)
    const folderExists = await ensureFolderExists(baseFolderPath, YANDEX_OAUTH_TOKEN)

    if (!folderExists) {
      console.error("[v0] Не удалось создать базовую папку:", baseFolderPath)
      return NextResponse.json({ error: "Не удалось создать базовую папку на Яндекс Диске" }, { status: 500 })
    }

    const batchFolderName = sanitizeFolderName(`${nickname}: ${activityType} - ${title}`)
    const batchFolderPath = `${baseFolderPath}/${batchFolderName}`

    console.log("[v0] Создание папки для загрузки:", batchFolderPath)

    const batchFolderExists = await ensureFolderExists(batchFolderPath, YANDEX_OAUTH_TOKEN)

    if (!batchFolderExists) {
      console.error("[v0] Не удалось создать папку для загрузки:", batchFolderPath)
      return NextResponse.json(
        {
          error: "Не удалось создать папку для загрузки",
          details: `Путь: ${batchFolderPath}`,
        },
        { status: 500 },
      )
    }

    const uploadPromises = files.map(async (file, index) => {
      const fileName = file.name
      const filePath = `${batchFolderPath}/${fileName}`

      try {
        console.log(`[v0] Загрузка файла ${index + 1}/${files.length}: ${fileName}`)

        const uploadUrlResponse = await fetch(
          `https://cloud-api.yandex.net/v1/disk/resources/upload?path=${encodeURIComponent(filePath)}&overwrite=true`,
          {
            method: "GET",
            headers: {
              Authorization: `OAuth ${YANDEX_OAUTH_TOKEN}`,
            },
          },
        )

        if (!uploadUrlResponse.ok) {
          const errorData = await uploadUrlResponse.json().catch(() => ({}))
          console.error(`[v0] Ошибка получения URL для загрузки файла ${fileName}:`, errorData)
          return { success: false, fileName, error: "Не удалось получить URL для загрузки" }
        }

        const { href: uploadUrl } = await uploadUrlResponse.json()

        const fileBuffer = await file.arrayBuffer()
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: fileBuffer,
          headers: {
            "Content-Type": file.type,
          },
        })

        if (!uploadResponse.ok) {
          console.error(`[v0] Ошибка загрузки файла ${fileName}:`, uploadResponse.status)
          return { success: false, fileName, error: `Ошибка загрузки (${uploadResponse.status})` }
        }

        console.log(`[v0] Файл успешно загружен: ${fileName}`)
        return { success: true, fileName }
      } catch (error) {
        console.error(`[v0] Исключение при загрузке файла ${fileName}:`, error)
        return { success: false, fileName, error: String(error) }
      }
    })

    const uploadResults = await Promise.all(uploadPromises)
    const successCount = uploadResults.filter((result) => result.success).length
    const failedFiles = uploadResults.filter((result) => !result.success)

    console.log("[v0] Результаты загрузки:", {
      успешно: successCount,
      всего: files.length,
      ошибки: failedFiles.map((f) => ({ файл: f.fileName, ошибка: f.error })),
    })

    if (successCount === 0) {
      return NextResponse.json(
        {
          error: "Не удалось загрузить ни один файл",
          details: failedFiles.map((f) => `${f.fileName}: ${f.error}`).join("; "),
        },
        { status: 500 },
      )
    }

    console.log("[v0] Загружено файлов:", successCount, "из", files.length)

    const publishResponse = await fetch(
      `https://cloud-api.yandex.net/v1/disk/resources/publish?path=${encodeURIComponent(batchFolderPath)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `OAuth ${YANDEX_OAUTH_TOKEN}`,
        },
      },
    )

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json().catch(() => ({}))
      console.error("[v0] Ошибка публикации папки:", errorData)
      return NextResponse.json({ error: "Не удалось опубликовать папку" }, { status: 500 })
    }

    console.log("[v0] Папка опубликована")

    const resourceResponse = await fetch(
      `https://cloud-api.yandex.net/v1/disk/resources?path=${encodeURIComponent(batchFolderPath)}`,
      {
        method: "GET",
        headers: {
          Authorization: `OAuth ${YANDEX_OAUTH_TOKEN}`,
        },
      },
    )

    if (!resourceResponse.ok) {
      const errorData = await resourceResponse.json().catch(() => ({}))
      console.error("[v0] Ошибка получения информации о папке:", errorData)
      return NextResponse.json({ error: "Не удалось получить публичную ссылку" }, { status: 500 })
    }

    const resourceData = await resourceResponse.json()
    const folderUrl = resourceData.public_url

    if (!folderUrl) {
      return NextResponse.json({ error: "Не удалось получить публичную ссылку на папку" }, { status: 500 })
    }

    console.log("[v0] Публичная ссылка на папку (альбом) получена:", folderUrl)

    return NextResponse.json({
      url: folderUrl,
      filesUploaded: successCount,
      totalFiles: files.length,
      ...(failedFiles.length > 0 && {
        partialSuccess: true,
        failedFiles: failedFiles.map((f) => f.fileName),
      }),
    })
  } catch (error) {
    console.error("[v0] Ошибка загрузки на Яндекс Диск:", error)
    return NextResponse.json(
      {
        error: "Ошибка при загрузке файлов на Яндекс Диск",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

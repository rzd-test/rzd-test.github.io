"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit, Check, Globe, Upload, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/contexts/theme-context"
import type { UserRole } from "@/data/users"
import { getArticles, createArticle, updateArticle, deleteArticle, type Article } from "@/lib/supabase-rzd"
import { useToast } from "@/hooks/use-toast"
import { getThemeColor } from "@/lib/theme-utils"

interface RZDWebsiteSectionProps {
  userRole: UserRole
  userNickname?: string
}

export function RZDWebsiteSection({ userRole, userNickname }: RZDWebsiteSectionProps) {
  const { theme } = useTheme()
  const { toast } = useToast()
  const [articles, setArticles] = useState<Article[]>([])
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [showArticleForm, setShowArticleForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])

  const allRoles: UserRole[] = ["Руководство", "Заместитель", "Старший Состав", "ЦдУД", "ПТО"]

  const getTieColor = () => getThemeColor(theme.colorTheme)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const articlesData = await getArticles()

      const filteredArticles =
        userRole === "Руководство"
          ? articlesData
          : articlesData.filter((article) => article.allowed_roles && article.allowed_roles.includes(userRole))

      setArticles(filteredArticles)
    } catch (error) {
      console.error("[v0] Error loading articles:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статьи",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const canManageArticles = userRole === "Руководство"

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
    if (files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files])
    } else {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите изображения",
        variant: "destructive",
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"))
      if (imageFiles.length > 0) {
        setSelectedImages((prev) => [...prev, ...imageFiles])
      } else {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, выберите изображения",
          variant: "destructive",
        })
      }
    }
    e.target.value = ""
  }

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("nickname", userNickname || "Unknown")
      formData.append("activityType", "Статья")
      formData.append("title", `Изображение_${Date.now()}`)

      const response = await fetch("/api/upload-to-supabase", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] Image upload failed:", errorData)
        throw new Error(errorData.error || "Не удалось загрузить изображение")
      }

      const result = await response.json()
      return result.url
    } catch (error) {
      console.error("[v0] Upload error:", error)
      return null
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeUploadedImage = (index: number) => {
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveArticle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const content = formData.get("content") as string

    if (selectedRoles.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите хотя бы одну роль для просмотра",
        variant: "destructive",
      })
      return
    }

    let imageUrls = [...uploadedImageUrls]
    if (selectedImages.length > 0) {
      setIsUploading(true)
      for (const image of selectedImages) {
        const url = await uploadImageToSupabase(image)
        if (url) {
          imageUrls.push(url)
        }
      }
      setIsUploading(false)
    }

    if (editingArticle?.image_url) {
      imageUrls = [...(editingArticle.image_url || []), ...imageUrls]
    }

    const authData = localStorage.getItem("currentUser")
    let userId = ""
    let authorName = userNickname || "Неизвестный"

    if (authData) {
      try {
        const userData = JSON.parse(authData)
        userId = userData.id || ""
        authorName = userData.nickname || userNickname || "Неизвестный"
      } catch (error) {
        console.error("[v0] Error parsing user data:", error)
      }
    }

    setIsLoading(true)
    try {
      if (editingArticle) {
        const updateData: any = {
          title,
          content,
          allowed_roles: selectedRoles,
        }
        if (imageUrls.length > 0) {
          updateData.image_url = imageUrls
        }

        const updated = await updateArticle(editingArticle.id, updateData)
        if (updated) {
          await loadData()
          toast({ title: "Успешно", description: "Статья обновлена" })
        }
      } else {
        const articleData: any = {
          title,
          content,
          author_name: authorName,
          author_id: userId,
          is_published: true,
          allowed_roles: selectedRoles,
        }
        if (imageUrls.length > 0) {
          articleData.image_url = imageUrls
        }

        const newArticle = await createArticle(articleData)
        if (newArticle) {
          await loadData()
          toast({ title: "Успешно", description: "Статья создана" })
        }
      }
      setShowArticleForm(false)
      setEditingArticle(null)
      setSelectedRoles(allRoles)
      setSelectedImages([])
      setUploadedImageUrls([])
    } catch (error) {
      console.error("[v0] Error saving article:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить статью",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRole = (role: UserRole) => {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  const renderRoleCheckbox = (role: UserRole) => {
    const isSelected = selectedRoles.includes(role)
    return (
      <button
        type="button"
        onClick={() => toggleRole(role)}
        className={`group relative w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
          isSelected
            ? theme.mode === "dark"
              ? "bg-white/10 shadow-lg"
              : "bg-black/10 shadow-lg"
            : theme.mode === "dark"
              ? "hover:bg-white/5"
              : "hover:bg-black/5"
        }`}
        style={
          isSelected
            ? {
                borderLeft: `4px solid ${getTieColor()}`,
                paddingLeft: "calc(1rem - 4px)",
              }
            : {}
        }
      >
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isSelected
              ? "border-transparent scale-110"
              : theme.mode === "dark"
                ? "border-white/30 group-hover:border-white/50"
                : "border-gray-300 group-hover:border-gray-400"
          }`}
          style={isSelected ? { backgroundColor: getTieColor() } : {}}
        >
          {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </div>
        <span
          className={`text-base font-medium transition-colors ${
            isSelected
              ? theme.mode === "dark"
                ? "text-white"
                : "text-black"
              : theme.mode === "dark"
                ? "text-white/70 group-hover:text-white"
                : "text-black/70 group-hover:text-black"
          }`}
        >
          {role}
        </span>
      </button>
    )
  }

  const handleDeleteArticle = async (articleId: string) => {
    setIsLoading(true)
    try {
      const deleted = await deleteArticle(articleId)
      if (deleted) {
        await loadData()
        toast({ title: "Успешно", description: "Статья удалена" })
      }
    } catch (error) {
      console.error("[v0] Error deleting article:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить статью",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 opacity-95">
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <div
          className="p-3 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${getTieColor()}20, ${getTieColor()}10)`,
          }}
        >
          <Globe className="w-6 h-6" style={{ color: getTieColor() }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
            Новости РЖД
          </h2>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Все новости фракции РЖД
          </p>
        </div>
      </div>

      <Card
        className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
      >
        {canManageArticles && (
          <CardHeader className="border-b pb-6" style={{ borderColor: getTieColor() }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3" style={{ color: getTieColor() }}>
                  <Edit className="w-6 h-6" />
                  Управление статьями
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Создание и редактирование статей для сотрудников
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingArticle(null)
                  setSelectedRoles(allRoles)
                  setShowArticleForm(true)
                  setSelectedImages([])
                  setUploadedImageUrls([])
                }}
                className="text-white text-lg font-bold h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: getTieColor(),
                  boxShadow: `0 4px 20px ${getTieColor()}40`,
                }}
                disabled={isLoading}
              >
                <Plus className="w-5 h-5 mr-2" />
                Добавить статью
              </Button>
            </div>
          </CardHeader>
        )}

        <CardContent className="pt-8">
          {canManageArticles && showArticleForm && (
            <form
              onSubmit={handleSaveArticle}
              className="space-y-6 mb-8 p-6 rounded-xl"
              style={{
                backgroundColor: theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">
                  Заголовок
                </Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingArticle?.title}
                  required
                  placeholder="Введите заголовок статьи..."
                  className={`h-12 text-base ${
                    theme.mode === "dark"
                      ? "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      : "bg-white border-gray-300 text-black placeholder:text-gray-400"
                  }`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-medium">
                  Содержание
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={editingArticle?.content}
                  required
                  placeholder="Введите текст статьи..."
                  rows={8}
                  className={`text-base ${
                    theme.mode === "dark"
                      ? "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      : "bg-white border-gray-300 text-black placeholder:text-gray-400"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Изображения (необязательно)</Label>
                <div
                  className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg border text-center"
                  style={{
                    background: `linear-gradient(135deg, ${getTieColor()}10, ${getTieColor()}05)`,
                    borderColor: getTieColor() + "30",
                  }}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div
                    className="p-4 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: getTieColor() + (isDragging ? "30" : "15"),
                    }}
                  >
                    <Upload className="w-8 h-8 transition-colors" style={{ color: getTieColor() }} />
                  </div>

                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      {isDragging ? "Отпустите изображения для загрузки" : "Перетащите изображения сюда"}
                    </p>
                    <p className="text-sm text-muted-foreground">или</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("articleImageInput")?.click()}
                      className="border-2"
                      style={{
                        borderColor: getTieColor() + "50",
                        color: getTieColor(),
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Выбрать файлы
                    </Button>
                    <input
                      id="articleImageInput"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Поддерживаются: PNG, JPG, JPEG. Максимальный размер: 4 МБ на файл
                  </p>
                </div>

                {(selectedImages.length > 0 || (editingArticle?.image_url && editingArticle.image_url.length > 0)) && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {editingArticle?.image_url?.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Existing ${index + 1}`}
                          className="w-full max-h-48 h-auto object-contain rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            if (editingArticle) {
                              setEditingArticle({
                                ...editingArticle,
                                image_url: editingArticle.image_url?.filter((_, i) => i !== index),
                              })
                            }
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {selectedImages.map((file, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <img
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full max-h-48 h-auto object-contain rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Кто может просматривать</Label>
                <div className={`space-y-3 p-4 rounded-xl ${theme.mode === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                  {allRoles.map((role) => renderRoleCheckbox(role))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="text-white text-lg font-bold h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    backgroundColor: getTieColor(),
                    boxShadow: `0 4px 20px ${getTieColor()}40`,
                  }}
                  disabled={isLoading || isUploading}
                >
                  {isUploading ? "Загрузка..." : editingArticle ? "Сохранить изменения" : "Создать статью"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-6 text-base bg-transparent"
                  onClick={() => {
                    setShowArticleForm(false)
                    setEditingArticle(null)
                    setSelectedRoles(allRoles)
                    setSelectedImages([])
                    setUploadedImageUrls([])
                  }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {isLoading && articles.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-lg">Загрузка...</p>
            ) : articles.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-lg">
                {canManageArticles ? "Статьи отсутствуют" : "Нет доступных статей для вашей роли"}
              </p>
            ) : (
              articles.map((article) => (
                <div
                  key={article.id}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    theme.mode === "dark"
                      ? "bg-gradient-to-r from-[#0f1419]/80 to-[#0f1419]/60 border-white/10 hover:border-white/30"
                      : "bg-gradient-to-r from-white/80 to-gray-50/60 border-gray-200 hover:border-gray-300"
                  }`}
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor: getTieColor(),
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {article.image_url && article.image_url.length > 0 && (
                        <div
                          className={`mb-4 ${article.image_url.length === 1 ? "flex justify-center" : "grid grid-cols-2 md:grid-cols-3 gap-3"}`}
                        >
                          {article.image_url.map((url, index) => (
                            <img
                              key={index}
                              src={url || "/placeholder.svg"}
                              alt={`${article.title} - изображение ${index + 1}`}
                              className={`rounded-lg ${article.image_url!.length === 1 ? "max-w-md w-auto h-auto" : "w-full max-h-64 h-auto object-contain"}`}
                            />
                          ))}
                        </div>
                      )}
                      <h3
                        className={`font-bold text-xl mb-3 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}
                      >
                        {article.title}
                      </h3>
                      <p
                        className={`text-base mb-3 leading-relaxed whitespace-pre-wrap ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}
                      >
                        {article.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Дата: {new Date(article.created_at).toLocaleDateString("ru-RU")}</span>
                      </div>
                    </div>
                    {canManageArticles && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-10 w-10 p-0 bg-transparent"
                          onClick={() => {
                            setEditingArticle(article)
                            setSelectedRoles(article.allowed_roles || [])
                            setShowArticleForm(true)
                            setSelectedImages([])
                            setUploadedImageUrls([])
                          }}
                          disabled={isLoading}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-10 w-10 p-0"
                          onClick={() => handleDeleteArticle(article.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

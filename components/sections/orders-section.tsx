"use client"
import { contentData } from "@/data/content"
import { Copy, Check, FileCheck } from "lucide-react"
import { useState } from "react"
import { useTheme } from "@/contexts/theme-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getThemeColor } from "@/lib/theme-utils"

export function OrdersSection() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<
    "disciplinary" | "dismissal" | "hiring" | "vacation" | "promotion" | "events" | "bonuses"
  >("disciplinary")
  const [mode, setMode] = useState<"manual" | "fields">("manual")
  const [formData, setFormData] = useState<{ [key: string]: string }>({})
  const { theme } = useTheme()

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(id)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const extractPlaceholders = (template: string): string[] => {
    const matches = template.match(/\[([^\]]+)\]/g)
    return matches ? matches.map((m) => m.slice(1, -1)) : []
  }

  const fillTemplate = (template: string, data: { [key: string]: string }): string => {
    let filled = template
    Object.entries(data).forEach(([key, value]) => {
      filled = filled.replace(new RegExp(`\\[${key}\\]`, "g"), value || `[${key}]`)
    })
    return filled
  }

  const renderCategory = (orders: string[], categoryKey: string) => {
    return (
      <div className="space-y-4">
        {orders.map((order, index) => {
          const itemId = `${categoryKey}-${index}`
          const placeholders = extractPlaceholders(order)
          const filledOrder = mode === "fields" ? fillTemplate(order, formData) : order

          return (
            <div
              key={itemId}
              className={`border-2 rounded-2xl overflow-hidden p-6 ${
                theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="w-5 h-5" style={{ color: getTieColor() }} />
                <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  Приказ {index + 1}
                </span>
              </div>

              {mode === "fields" && placeholders.length > 0 && (
                <div className="mb-4 p-4 rounded-xl bg-muted/50 space-y-3">
                  <p className="text-sm font-medium mb-2">Заполните поля:</p>
                  {placeholders.map((placeholder) => (
                    <div key={placeholder} className="space-y-1">
                      <Label htmlFor={`${itemId}-${placeholder}`} className="text-xs">
                        {placeholder}
                      </Label>
                      <Input
                        id={`${itemId}-${placeholder}`}
                        value={formData[placeholder] || ""}
                        onChange={(e) => setFormData({ ...formData, [placeholder]: e.target.value })}
                        placeholder={`Введите ${placeholder.toLowerCase()}`}
                        className="h-9"
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => copyToClipboard(filledOrder, itemId)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
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
                  <p
                    className={`text-sm flex-1 whitespace-pre-wrap ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                  >
                    {filledOrder}
                  </p>
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{
                      backgroundColor: getTieColor() + "20",
                    }}
                  >
                    {copiedIndex === itemId ? (
                      <Check className="w-4 h-4" style={{ color: getTieColor() }} />
                    ) : (
                      <Copy
                        className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity"
                        style={{ color: getTieColor() }}
                      />
                    )}
                  </div>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  const categories = [
    { id: "disciplinary", label: "Дисциплина" },
    { id: "dismissal", label: "Увольнение" },
    { id: "hiring", label: "Приём" },
    { id: "vacation", label: "Отпуск" },
    { id: "promotion", label: "Повышение" },
    { id: "events", label: "Мероприятия" },
    { id: "bonuses", label: "Премии" },
  ] as const

  return (
    <div className="space-y-6 opacity-95">
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <div
          className="p-3 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${getTieColor()}20, ${getTieColor()}10)`,
          }}
        >
          <FileCheck className="w-6 h-6" style={{ color: getTieColor() }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
            Приказы
          </h2>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Шаблоны приказов для различных ситуаций
          </p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
              selectedCategory === category.id
                ? "text-white shadow-lg"
                : theme.mode === "dark"
                  ? "bg-[#0f1419]/50 border-white/10 text-white/70 hover:border-white/30"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
            style={
              selectedCategory === category.id ? { backgroundColor: getTieColor(), borderColor: getTieColor() } : {}
            }
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">{renderCategory(contentData.orders[selectedCategory], selectedCategory)}</div>
    </div>
  )
}

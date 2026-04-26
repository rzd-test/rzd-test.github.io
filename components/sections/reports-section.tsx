"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { contentData } from "@/data/content"
import { Copy, Check, ChevronRight, FileText } from "lucide-react"
import { useState } from "react"
import { useTheme } from "@/contexts/theme-context"

export function ReportsSection() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({})
  const [selectedCategory, setSelectedCategory] = useState<"main" | "additional">("main")
  const { theme } = useTheme()

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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(id)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  const renderContent = (content: string[], reportId: string) => {
    return content.map((line, index) => {
      const lineId = `${reportId}-${index}`

      return (
        <button
          key={index}
          onClick={() => copyToClipboard(line, lineId)}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 group mb-3 ${
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
            <p className={`text-sm flex-1 ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}>{line}</p>
            <div
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: getTieColor() + "20",
              }}
            >
              {copiedIndex === lineId ? (
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
      )
    })
  }

  const renderCategory = (items: any[]) => {
    return (
      <div className="space-y-4">
        {items.map((report) => (
          <Card
            key={report.id}
            className={`border-2 rounded-2xl overflow-hidden ${
              theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
            }`}
          >
            <CardHeader
              className="border-b pb-4 cursor-pointer"
              style={{
                borderColor: getTieColor(),
              }}
              onClick={() => toggleItem(report.id)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-3" style={{ color: getTieColor() }}>
                  <FileText className="w-5 h-5" />
                  {report.title}
                </h3>
                <ChevronRight
                  className={`h-5 w-5 transition-transform duration-300 ${expandedItems[report.id] ? "rotate-90" : ""}`}
                  style={{ color: getTieColor() }}
                />
              </div>
            </CardHeader>

            {expandedItems[report.id] && (
              <CardContent className="pt-6 max-h-[500px] overflow-y-auto">
                {renderContent(report.content, report.id)}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    )
  }

  const mainReports = contentData.reports.slice(0, 2)
  const additionalReports = contentData.reports.slice(2)

  return (
    <div className="space-y-6 opacity-95">
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: getTieColor() }}>
          <FileText className="w-8 h-8" />
          Доклады
        </h2>
        <p className={theme.mode === "dark" ? "text-white/70" : "text-gray-600"}>
          Шаблоны докладов для различных ситуаций
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setSelectedCategory("main")}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
            selectedCategory === "main"
              ? "text-white shadow-lg"
              : theme.mode === "dark"
                ? "bg-[#0f1419]/50 border-white/10 text-white/70 hover:border-white/30"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
          style={selectedCategory === "main" ? { backgroundColor: getTieColor(), borderColor: getTieColor() } : {}}
        >
          Основные доклады
        </button>
        <button
          onClick={() => setSelectedCategory("additional")}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
            selectedCategory === "additional"
              ? "text-white shadow-lg"
              : theme.mode === "dark"
                ? "bg-[#0f1419]/50 border-white/10 text-white/70 hover:border-white/30"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
          style={
            selectedCategory === "additional" ? { backgroundColor: getTieColor(), borderColor: getTieColor() } : {}
          }
        >
          Дополнительные доклады
        </button>
      </div>

      <div className="space-y-4">
        {selectedCategory === "main" && renderCategory(mainReports)}
        {selectedCategory === "additional" && renderCategory(additionalReports)}
      </div>
    </div>
  )
}

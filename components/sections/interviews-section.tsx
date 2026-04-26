"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { contentData } from "@/data/content"
import { Copy, Check, Briefcase } from "lucide-react"
import { useState } from "react"
import { useTheme } from "@/contexts/theme-context"
import { getThemeColor } from "@/lib/theme-utils"

export function InterviewsSection() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const { theme } = useTheme()

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(id)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const renderContent = (content: string[], interviewId: string) => {
    return content.map((line, index) => {
      const lineId = `${interviewId}-${index}`

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

  return (
    <div className="space-y-6 opacity-95">
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <div
          className="p-3 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${getTieColor()}20, ${getTieColor()}10)`,
          }}
        >
          <Briefcase className="w-6 h-6" style={{ color: getTieColor() }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
            Собеседования
          </h2>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Этапы проведения собеседования
          </p>
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {contentData.interviews.map((interview) => (
          <AccordionItem
            key={interview.id}
            value={interview.id}
            className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5" style={{ color: getTieColor() }} />
                <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  {interview.number}. {interview.title}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">{renderContent(interview.content, interview.id)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { Settings, Check } from "lucide-react"
import { ColorPicker } from "@/components/ui/color-picker"
import { getThemeColor } from "@/lib/theme-utils"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, updateTheme } = useTheme()

  const getTieColor = () => getThemeColor(theme.colorTheme)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
            <Settings className="w-5 h-5" />
            Настройки
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          <div className="space-y-3">
            <Label className={`text-base ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Фон приложения
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "/backgrounds/sapsan-bridge.jpg", label: "Железнодорожный Мост" },
                { value: "/backgrounds/moskow.png", label: "Железные Дороги Москвы" },
                { value: "/backgrounds/parovoz-petergof.png", label: "Паровозы в Петергофе" },
                { value: "/backgrounds/gruz-train.jpg", label: "Грузовой поезд" },
                { value: "/backgrounds/sapsan-zima.png", label: "Зимний Сапсан" },
                { value: "/backgrounds/pass.png", label: "Пассажирский ЭП2к" },
              ].map((bg) => (
                <button
                  key={bg.value}
                  onClick={() => updateTheme({ background: bg.value })}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all w-full ${
                    theme.background === bg.value ? "ring-2 ring-offset-2" : "border-white/20 hover:border-white/40"
                  }`}
                  style={
                    theme.background === bg.value ? { borderColor: getTieColor(), ringColor: getTieColor() + "50" } : {}
                  }
                >
                  <div className="h-32 w-full bg-cover bg-center" style={{ backgroundImage: `url(${bg.value})` }} />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-medium text-xs px-2 text-center">{bg.label}</span>
                  </div>
                  {theme.background === bg.value && (
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                      <Check className="w-3 h-3" style={{ color: getTieColor() }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className={`text-base ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>Шрифт</Label>
            <Select value={theme.fontFamily} onValueChange={(value) => updateTheme({ fontFamily: value })}>
              <SelectTrigger
                className={`${theme.mode === "dark" ? "bg-white/5 border-white/20 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sans">Sans Serif (по умолчанию)</SelectItem>
                <SelectItem value="serif">Serif</SelectItem>
                <SelectItem value="mono">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pb-4">
            <Label className={`text-base ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Цветовая тема
            </Label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                {
                  value: "red",
                  label: "Красная",
                  gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)",
                },
                {
                  value: "orange",
                  label: "Оранжевая",
                  gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)",
                },
                {
                  value: "green",
                  label: "Зелёная",
                  gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
                },
                {
                  value: "teal",
                  label: "Бирюзовая",
                  gradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%)",
                },
                {
                  value: "blue",
                  label: "Синяя",
                  gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)",
                },
                {
                  value: "purple",
                  label: "Фиолетовая",
                  gradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7e22ce 100%)",
                },
              ].map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateTheme({ colorTheme: color.value })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    theme.colorTheme === color.value
                      ? "border-white/60 bg-white/10 shadow-lg scale-105"
                      : "border-white/20 hover:border-white/40 bg-white/5 hover:scale-102"
                  }`}
                  title={color.label}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-lg border-2 transition-all shadow-lg overflow-hidden flex items-center justify-center ${
                        theme.colorTheme === color.value ? "border-white scale-110 shadow-xl" : "border-white/30"
                      }`}
                      style={{ background: color.gradient }}
                    >
                      {theme.colorTheme === color.value && <Check className="w-6 h-6 text-white drop-shadow-lg" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <ColorPicker
                value={getTieColor()}
                onChange={(color) => updateTheme({ colorTheme: color })}
                label="Или выберите свой цвет"
              />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 pt-4 pb-2 border-t border-white/10 flex justify-center">
          <Button
            onClick={() => onOpenChange(false)}
            className="text-white font-semibold px-8 shadow-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: getTieColor() }}
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/contexts/theme-context"
import { Palette, ImageIcon, Check, User } from "lucide-react"

export function SettingsSection() {
  const { theme, userProfile, setColorTheme, updateUserProfile, getTag } = useTheme()

  const positions = [
    {
      category: "Руководство депо",
      items: [
        "Начальник Депо",
        "Первый Заместитель Начальника Депо",
        "Зам. Начальника Депо по кадровой работе",
        "Зам. Начальника Депо по эксплуатации",
      ],
    },
    {
      category: "Руководство отделов",
      items: ["Начальник ЭО", "Начальник ЦдУД", "Начальник ПТО"],
    },
    {
      category: "Инструкторы",
      items: [
        "Машинист-инструктор / Зам.Нач.ЭО",
        "Машинист-инструктор / Зам.Нач.ЦдУД",
        "Машинист-инструктор / Зам.Нач.ПТО",
      ],
    },
    {
      category: "Диспетчерская служба",
      items: ["Старший диспетчер", "Поездной диспетчер", "Оператор при ДНЦ"],
    },
    {
      category: "Локомотивные бригады",
      items: ["Машинист 1-го класса", "Машинист 2-го класса", "Машинист 3-го класса", "Помощник машиниста"],
    },
    {
      category: "Технический персонал",
      items: ["Монтёр пути", "Слесарь-электрик"],
    },
  ]

  const colorOptions = [
    { value: "red", label: "Красная", color: "#ef4444" },
    { value: "orange", label: "Оранжевая", color: "#f97316" },
    { value: "green", label: "Зелёная", color: "#22c55e" },
    { value: "teal", label: "Бирюзовая", color: "#14b8a6" },
    { value: "blue", label: "Синяя", color: "#3b82f6" },
    { value: "purple", label: "Фиолетовая", color: "#a855f7" },
  ]

  const backgroundOptions = [
    { value: "red", label: "Двухэтажный поезд", preview: "/backgrounds/double-decker-train.jpg" },
    { value: "blue", label: "Сапсан на мосту", preview: "/backgrounds/sapsan-bridge.jpg" },
    { value: "orange", label: "Ласточка у Петергофа", preview: "/backgrounds/lastochka-petergof.jpg" },
    { value: "green", label: "Паровоз на Скуратово", preview: "/backgrounds/steam-locomotive.png" },
  ]

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

  return (
    <div className="space-y-8 p-6 opacity-95">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <div
          className="p-3 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${getTieColor()}20, ${getTieColor()}10)`,
          }}
        >
          <Palette className="w-6 h-6" style={{ color: getTieColor() }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
            Настройки
          </h2>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Персонализация интерфейса
          </p>
        </div>
      </div>

      {/* Personal Data Card */}
      <Card
        className={`border-2 rounded-2xl p-6 ${
          theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: getTieColor() + "30" }}>
            <User className="w-5 h-5" style={{ color: getTieColor() }} />
            <h3 className="text-xl font-semibold">Личные данные</h3>
          </div>

          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <User className="w-4 h-4" style={{ color: getTieColor() }} />
                Имя и Фамилия
              </Label>
              <Input
                value={userProfile.fullName}
                onChange={(e) => updateUserProfile({ fullName: e.target.value })}
                placeholder="Введите имя и фамилию..."
                className={`h-12 text-base ${
                  theme.mode === "dark"
                    ? "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    : "bg-white border-gray-300 text-black placeholder:text-gray-400"
                }`}
              />
            </div>

            {/* Signature Input */}
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <User className="w-4 h-4" style={{ color: getTieColor() }} />
                Подпись для отчётов
              </Label>
              <Input
                value={userProfile.signature}
                onChange={(e) => updateUserProfile({ signature: e.target.value })}
                placeholder="Введите вашу подпись..."
                className={`h-12 text-base ${
                  theme.mode === "dark"
                    ? "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    : "bg-white border-gray-300 text-black placeholder:text-gray-400"
                }`}
              />
            </div>

            <div
              className="flex items-start gap-3 p-4 rounded-lg border"
              style={{
                background: `linear-gradient(135deg, ${getTieColor()}10, ${getTieColor()}05)`,
                borderColor: getTieColor() + "30",
              }}
            >
              <User className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: getTieColor() }} />
              <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                Должность и служебный тег настраиваются для каждого аккаунта отдельно в разделе "Управление".
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Color Theme Card */}
      <Card
        className={`border-2 rounded-2xl p-6 ${
          theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: getTieColor() + "30" }}>
            <Palette className="w-5 h-5" style={{ color: getTieColor() }} />
            <h3 className="text-xl font-semibold">Цветовая тема</h3>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setColorTheme(option.value)}
                className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                  theme.colorTheme === option.value
                    ? "border-opacity-100 shadow-lg scale-105"
                    : theme.mode === "dark"
                      ? "border-white/10 hover:border-white/30 hover:scale-102"
                      : "border-gray-200 hover:border-gray-300 hover:scale-102"
                }`}
                style={{
                  borderColor: theme.colorTheme === option.value ? option.color : undefined,
                  background:
                    theme.colorTheme === option.value
                      ? `linear-gradient(135deg, ${option.color}15, ${option.color}05)`
                      : undefined,
                }}
                title={option.label}
              >
                <div
                  className="w-16 h-16 rounded-full shadow-md transition-transform group-hover:scale-110 overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: option.color }}
                >
                  {theme.colorTheme === option.value && <Check className="w-8 h-8 text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Background Image Card */}
      <Card
        className={`border-2 rounded-2xl p-6 ${
          theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: getTieColor() + "30" }}>
            <ImageIcon className="w-5 h-5" style={{ color: getTieColor() }} />
            <h3 className="text-xl font-semibold">Фоновое изображение</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {backgroundOptions.map((option) => {
              const isSelected = theme.colorTheme === option.value
              return (
                <Card
                  key={option.value}
                  className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    isSelected ? "shadow-2xl scale-105" : "hover:scale-102 opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    borderColor: isSelected ? getTieColor() : undefined,
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={option.preview || "/placeholder.svg"}
                      alt={option.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div
                      className="absolute inset-0 transition-opacity"
                      style={{
                        background: isSelected
                          ? `linear-gradient(to top, ${getTieColor()}dd, ${getTieColor()}00)`
                          : "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold text-base drop-shadow-lg">{option.label}</span>
                        {isSelected && (
                          <div className="bg-white rounded-full p-1.5 shadow-lg">
                            <Check className="w-4 h-4" style={{ color: getTieColor() }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          <div
            className="flex items-start gap-3 p-4 rounded-lg border"
            style={{
              background: `linear-gradient(135deg, ${getTieColor()}10, ${getTieColor()}05)`,
              borderColor: getTieColor() + "30",
            }}
          >
            <ImageIcon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: getTieColor() }} />
            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              Фоновое изображение автоматически изменяется при выборе цветовой темы. Каждому цвету соответствует своё
              изображение.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

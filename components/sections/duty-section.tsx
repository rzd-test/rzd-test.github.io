"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MapPin, Flag, ImageIcon, Clock } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getThemeColor } from "@/lib/theme-utils"

export function DutySection() {
  const { theme } = useTheme()
  const [selectedCrossingIndex, setSelectedCrossingIndex] = useState<number>(0)
  const [showCrossingViewer, setShowCrossingViewer] = useState(false)

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const crossings = [
    "Магистральное шоссе",
    "ЖТУ",
    "Жуковский таксопарк",
    "ЖБК",
    "Депо ТЧЭ-3",
    "Глав СТО г. Невского",
    "Золотой дождик",
    "Мирнинская ГЭС",
  ]

  const stations = ["Мирный", "Невский", "Приволжск"]

  const stationPhotos = [
    {
      name: "Мирный",
      exterior:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mirny-exterior-jg4wlIFar7drEmccF4kwE2gfFnW6oG.png",
      platform:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mirny-platform-HE30SnQ3F3JPNpQI2KfmDqBoL7GBAu.jpg",
    },
    {
      name: "Невский",
      exterior:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nevsky-exterior-Uy7BX7lKBR4hVViD8ehrrzuahqDaxt.png",
      platform:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nevsky-platform-Z8x7L2SIwGbptmmel1jIrYoCvRxzUe.jpg",
    },
    {
      name: "Приволжск",
      exterior:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/privolzhsk-exterior-2nDnCRxYCTdd7COgb3EyWPcOoyFsqa.png",
      platform:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/privolzhsk-platform-IJMmO9HzySdLPZXoaHlHjFEr1Pum81.jpg",
    },
  ]

  const crossingPhotos = [
    {
      name: "Депо ТЧЭ-3",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D0%94%D0%B5%D0%BF%D0%BE%20%D0%A2%D0%A7%D0%AD-3-HBOzy0cLDbUzb9i2qUreIFw9P6CVrp.png",
    },
    {
      name: "Глав. СТО г. Невского",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D0%93%D0%BB%D0%B0%D0%B2.%20%D0%A1%D0%A2%D0%9E%20%D0%B3.%20%D0%9D%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE-YzaSEqVxtiVHvOBLtunjMs2Y5wC0Y8.png",
    },
    {
      name: "Золотой дождик",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D0%97%D0%BE%D0%BB%D0%BE%D1%82%D0%BE%D0%B9%20%D0%B4%D0%BE%D0%B6%D0%B4%D0%B8%D0%BA-pYTf4QlR53lK9vbSeg7ui4QANhYa6k.png",
    },
    {
      name: "Жуковский таксопарк",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D0%96%D1%83%D0%BA%D0%BE%D0%B2%D1%81%D0%BA%D0%B8%D0%B9%20%D1%82%D0%B0%D0%BA%D1%81%D0%BE%D0%BF%D0%B0%D1%80%D0%BA-ZCtopiLLUjz6F576WqPVi1Xvrooph7.png",
    },
    {
      name: "ЖТУ",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D0%96%D0%A2%D0%A3-CYMY6bfjEc6IXbQfMUx95ysy1RkNFV.png",
    },
    {
      name: "Завод ЖБК",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D0%97%D0%B0%D0%B2%D0%BE%D0%B4%20%D0%96%D0%91%D0%9A-1TaAErt6pQqfDCDlmeCpfE9r9i6SpP.png",
    },
    {
      name: "Мирнинская ГЭС",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D0%9C%D0%B8%D1%80%D0%BD%D0%B8%D0%BD%D1%81%D0%BA%D0%B0%D1%8F%20%D0%93%D0%AD%D0%A1-itEQ8SfZppcPvTlD6jZ8Pg0ihE7VQF.png",
    },
    {
      name: "Магистральное шоссе",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D0%9C%D0%B0%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%B5%20%D1%88%D0%BE%D1%81%D1%81%D0%B5-XSPhoueGDElJ0kl6McNZzAOwpr3DRa.png",
    },
  ]

  const signalInstallationPhotos = [
    {
      name: "Жёлтый флаг на лестнице",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/flag-szgiI3z426hiKjT2g0qLOVo33z9duN.png",
      description: "Правильная установка жёлтого сигнального флага на лестнице возле будки дежурного",
      color: "#eab308",
    },
    {
      name: "Жёлтый квадратный щит",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yellow-shield-XXCrjIURS4PEpUfieACKvZvuhF69Y9.png",
      description: "Установка жёлтого квадратного щита на полосатой стойке у железнодорожных путей",
      color: "#eab308",
    },
    {
      name: "Красный прямоугольный щит",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/red-shield-GQEUVHZ5PKGuU3alHilcdnEBGCDjD0.png",
      description: "Установка красного прямоугольного щита для немедленной остановки",
      color: "#ef4444",
    },
    {
      name: "Конец опасного участка",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/danger-end-5kpY9Y2Lk2k7odkktsVSymxkZe4fvJ.png",
      description: "Круглый чёрно-белый знак с красной лампой, обозначающий конец опасного участка",
      color: "#ffffff",
    },
    {
      name: "Зелёный квадратный щит",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/green-shield-NjgNmNC99iijdUJwgACWKwYVRSVhst.png",
      description: "Установка зелёного щита для разрешения повышения скорости после проследования опасного участка",
      color: "#22c55e",
    },
    {
      name: "Начало опасного участка",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/danger-start-nmCbIp5SIk5Tq96bRFIXdq5BP96xYV.png",
      description: "Круглый чёрно-белый знак с красной лампой, обозначающий начало опасного участка",
      color: "#ffffff",
    },
  ]

  const signals = [
    {
      name: "Красный сигнальный флаг",
      description: "Немедленно остановиться! Движение запрещено!",
      color: "#ef4444",
    },
    {
      name: "Жёлтый развёрнутый сигнальный флаг",
      description: "Разрешается продолжить движение с установленной в предупреждении скоростью (не более 25 км/ч)",
      color: "#eab308",
    },
    {
      name: "Жёлтый свёрнутый сигнальный флаг",
      description: "Разрешается движение по перегону с установленной скоростью",
      color: "#eab308",
    },
    {
      name: "Жёлтый квадратный щит",
      description: "Разрешает проследование опасного места с уменьшенной скоростью и готовностью остановиться",
      color: "#eab308",
    },
    {
      name: "Зелёный квадратный щит",
      description: "Разрешает повысить скорость до установленной после проследования щита всем составом",
      color: "#22c55e",
    },
    {
      name: "Красный прямоугольный щит",
      description: "Немедленно остановиться! Запрещено проезжать сигнал!",
      color: "#ef4444",
    },
  ]

  return (
    <div className="space-y-6 opacity-95">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <div
          className="p-3 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${getTieColor()}20, ${getTieColor()}10)`,
          }}
        >
          <Clock className="w-6 h-6" style={{ color: getTieColor() }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
            Дежурство
          </h2>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Правила дежурства на переездах и станциях
          </p>
        </div>
      </div>

      {/* Rules for Crossings */}
      <Card
        className={`border-2 rounded-2xl overflow-hidden ${
          theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <CardHeader
          className="border-b pb-4"
          style={{
            borderColor: getTieColor(),
          }}
        >
          <h3 className="text-xl font-bold flex items-center gap-3" style={{ color: getTieColor() }}>
            <MapPin className="w-5 h-5" />
            Правила нахождения на Ж/Д переезде
          </h3>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div
            className={`p-4 rounded-xl border ${
              theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
            }`}
          >
            <ul className={`space-y-2 text-sm ${theme.mode === "dark" ? "text-white/80" : "text-gray-700"}`}>
              <li>
                • Для поездки использовать только служебный автомобиль "ЗИЛ-131", при его отсутствии "УАЗ-3309 Буханка"
              </li>
              <li>• Занимать уже занятый пост запрещено. Необходимо занять любой другой свободный пост</li>
              <li>• Разрешается присутствовать на постах вдвоём (один в транспорте, второй в будке)</li>
              <li>• О состоянии поста докладывать в рацию каждые 10 минут</li>
              <li>• При ДТП немедленно доложить в рацию, предупредив машинистов и Старший Состав</li>
              <li>• Дежурный по переезду (ДПП) обязан сообщать о проследовании поезда через переезд</li>
              <li>• ДПП обязан иметь при себе весь необходимый сигнальный инвентарь</li>
              <li>• ТЭГ в рацию у ДПП всегда будет [ДПП] независимо от ранга и должности</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Список Ж/Д переездов:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {crossings.map((crossing, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${theme.mode === "dark" ? "bg-white/5" : "bg-gray-50"}`}
                  style={{ borderLeftColor: getTieColor() }}
                >
                  <p className={`text-sm ${theme.mode === "dark" ? "text-white/80" : "text-gray-700"}`}>{crossing}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className={`border-2 rounded-2xl overflow-hidden ${
          theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <CardHeader
          className="border-b pb-4"
          style={{
            borderColor: getTieColor(),
          }}
        >
          <h3 className="text-xl font-bold flex items-center gap-3" style={{ color: getTieColor() }}>
            <ImageIcon className="w-5 h-5" />
            Карта и фотографии переездов
          </h3>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <h4 className={`font-bold text-lg ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Карта переездов и станций
            </h4>
            <div
              className={`rounded-xl overflow-hidden border-2 max-w-2xl mx-auto ${
                theme.mode === "dark" ? "border-white/10" : "border-gray-200"
              }`}
            >
              <img
                src="/images/design-mode/karta-pereezd.jpg"
                alt="Карта железнодорожных переездов и станций"
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-bold text-lg ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                Фотографии переездов
              </h4>
            </div>

            {showCrossingViewer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="relative max-w-4xl w-full">
                  <button
                    onClick={() => setShowCrossingViewer(false)}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white z-10"
                  >
                    ✕
                  </button>
                  <div className="bg-white dark:bg-[#0f1419] rounded-xl overflow-hidden">
                    <img
                      src={crossingPhotos[selectedCrossingIndex].url || "/placeholder.svg"}
                      alt={crossingPhotos[selectedCrossingIndex].name}
                      className="w-full h-auto"
                    />
                    <div className="p-4 text-center">
                      <p className="font-bold text-lg mb-4">{crossingPhotos[selectedCrossingIndex].name}</p>
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          onClick={() =>
                            setSelectedCrossingIndex((prev) => (prev > 0 ? prev - 1 : crossingPhotos.length - 1))
                          }
                          variant="outline"
                          disabled={crossingPhotos.length <= 1}
                        >
                          ← Предыдущий
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {selectedCrossingIndex + 1} / {crossingPhotos.length}
                        </span>
                        <Button
                          onClick={() =>
                            setSelectedCrossingIndex((prev) => (prev < crossingPhotos.length - 1 ? prev + 1 : 0))
                          }
                          variant="outline"
                          disabled={crossingPhotos.length <= 1}
                        >
                          Следующий →
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crossingPhotos.map((crossing, index) => (
                <div
                  key={index}
                  className={`rounded-xl overflow-hidden border-2 ${
                    theme.mode === "dark" ? "border-white/10" : "border-gray-200"
                  }`}
                >
                  <img
                    src={crossing.url || "/placeholder.svg"}
                    alt={`Переезд '${crossing.name}'`}
                    className="w-full h-auto"
                  />
                  <div
                    className={`p-3 text-center text-sm font-medium ${
                      theme.mode === "dark" ? "bg-white/5 text-white/80" : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {crossing.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules for Stations */}
      <Card
        className={`border-2 rounded-2xl overflow-hidden ${
          theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <CardHeader
          className="border-b pb-4"
          style={{
            borderColor: getTieColor(),
          }}
        >
          <h3 className="text-xl font-bold flex items-center gap-3" style={{ color: getTieColor() }}>
            <MapPin className="w-5 h-5" />
            Правила нахождения на станции
          </h3>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div
            className={`p-4 rounded-xl border ${
              theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
            }`}
          >
            <ul className={`space-y-2 text-sm ${theme.mode === "dark" ? "text-white/80" : "text-gray-700"}`}>
              <li>• Основная обязанность - сопровождение и оказание помощи пассажирам на станциях</li>
              <li>• Для поездки использовать только служебный автомобиль "ЗИЛ-131" или "УАЗ-3309 Буханка"</li>
              <li>• Занимать уже занятую станцию запрещено</li>
              <li>• О состоянии станции докладывать в рацию каждые 10 минут</li>
              <li>• На станции могут дежурить сотрудники с рангом не ниже Помощника машиниста (3+)</li>
              <li>• Дежурный по вокзалу (ДПВ) обязан иметь при себе весь необходимый сигнальный инвентарь</li>
              <li>• ТЭГ в рацию у Дежурного по вокзалу всегда будет [ДПВ] независимо от ранга и должности</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>Станции:</h4>
            <div className="grid grid-cols-3 gap-2">
              {stations.map((station, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${theme.mode === "dark" ? "bg-white/5" : "bg-gray-50"}`}
                  style={{ borderLeftColor: getTieColor() }}
                >
                  <p className={`text-sm font-semibold ${theme.mode === "dark" ? "text-white/80" : "text-gray-700"}`}>
                    {station}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Station Photos Gallery */}
      <Card
        className={`border-2 rounded-2xl overflow-hidden ${
          theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <CardHeader
          className="border-b pb-4"
          style={{
            borderColor: getTieColor(),
          }}
        >
          <h3 className="text-xl font-bold flex items-center gap-3" style={{ color: getTieColor() }}>
            <ImageIcon className="w-5 h-5" />
            Фотографии станций и платформ
          </h3>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          {stationPhotos.map((station, index) => (
            <div key={index} className="space-y-4">
              <h4 className={`font-bold text-lg ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                Станция {station.name}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`rounded-xl overflow-hidden border-2 ${
                    theme.mode === "dark" ? "border-white/10" : "border-gray-200"
                  }`}
                >
                  <img
                    src={station.exterior || "/placeholder.svg"}
                    alt={`Вокзал станции ${station.name}`}
                    className="w-full h-auto"
                  />
                  <div
                    className={`p-3 text-center text-sm font-medium ${
                      theme.mode === "dark" ? "bg-white/5 text-white/80" : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    Вокзал
                  </div>
                </div>

                <div
                  className={`rounded-xl overflow-hidden border-2 ${
                    theme.mode === "dark" ? "border-white/10" : "border-gray-200"
                  }`}
                >
                  <img
                    src={station.platform || "/placeholder.svg"}
                    alt={`Платформа станции ${station.name}`}
                    className="w-full h-auto"
                  />
                  <div
                    className={`p-3 text-center text-sm font-medium ${
                      theme.mode === "dark" ? "bg-white/5 text-white/80" : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    Платформа
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Signal Equipment */}
      <Card
        className={`border-2 rounded-2xl overflow-hidden ${
          theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <CardHeader
          className="border-b pb-4"
          style={{
            borderColor: getTieColor(),
          }}
        >
          <h3 className="text-xl font-bold flex items-center gap-3" style={{ color: getTieColor() }}>
            <Flag className="w-5 h-5" />
            Правила использования сигнального инвентаря
          </h3>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            {signals.map((signal, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-l-4 ${
                  theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
                }`}
                style={{ borderLeftColor: signal.color }}
              >
                <h4 className={`font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  {signal.name}
                </h4>
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  {signal.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Signal Installation Photos */}
      <Card
        className={`border-2 rounded-2xl overflow-hidden ${
          theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <CardHeader
          className="border-b pb-4"
          style={{
            borderColor: getTieColor(),
          }}
        >
          <h3 className="text-xl font-bold flex items-center gap-3" style={{ color: getTieColor() }}>
            <ImageIcon className="w-5 h-5" />
            Правила установки сигнального инвентаря
          </h3>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {signalInstallationPhotos.map((photo, index) => (
              <div
                key={index}
                className={`rounded-xl overflow-hidden border-2 ${
                  theme.mode === "dark" ? "border-white/10" : "border-gray-200"
                }`}
                style={{
                  borderColor: photo.color,
                  background:
                    theme.mode === "dark"
                      ? `linear-gradient(to bottom, ${photo.color}15, transparent)`
                      : `linear-gradient(to bottom, ${photo.color}10, white)`,
                }}
              >
                <img src={photo.url || "/placeholder.svg"} alt={photo.name} className="w-full h-auto" />
                <div
                  className={`p-3`}
                  style={{
                    backgroundColor: theme.mode === "dark" ? `${photo.color}20` : `${photo.color}15`,
                  }}
                >
                  <h5 className={`text-sm font-bold mb-1 ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}>
                    {photo.name}
                  </h5>
                  <p className={`text-xs ${theme.mode === "dark" ? "text-white/60" : "text-gray-600"}`}>
                    {photo.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div
            className={`mt-6 p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
          >
            <h4 className={`font-bold mb-3 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Общие правила установки:
            </h4>
            <ul className={`space-y-2 text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              <li>• Высота установки должна обеспечивать хорошую видимость для машинистов</li>
              <li>• Флаги нужно держать в руке, ноги на ширине плеч, руку с флагом вытянуть</li>
              <li>• Щиты должны быть расположены перпендикулярно направлению движения</li>
              <li>• Расстояние от края пути до сигнала должно быть не менее 2 метров</li>
              <li>
                • Знаки начала и конца опасного участка устанавливаются парами на расстоянии, определяемом
                протяжённостью опасного участка
              </li>
              <li>• Красные лампы на знаках опасности должны быть видны в тёмное время суток</li>
              <li>• Сигнальные щиты должны быть чистыми и хорошо различимыми в любую погоду</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

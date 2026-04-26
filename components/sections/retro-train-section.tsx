"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Train, Users, Clock, MapPin, Gauge, Calendar, Radio, Copy, Check } from "lucide-react"
import { contentData } from "@/data/content"
import { useState } from "react"
import { useTheme } from "@/contexts/theme-context"
import Image from "next/image"
import { getThemeColor } from "@/lib/theme-utils"

export function RetroTrainSection() {
  const { theme } = useTheme()
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(id)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const renderContent = (content: string[], retroId: string) => {
    return content.map((line, index) => {
      const lineId = `${retroId}-${index}`

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
          <Train className="w-6 h-6" style={{ color: getTieColor() }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
            Ретропоезд «Провинция»
          </h2>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Информация о ретропоезде, составе бригады и правилах эксплуатации
          </p>
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {/* Общие правила */}
        <AccordionItem
          value="rules"
          className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" style={{ color: getTieColor() }} />
              <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                Общие правила проведения рейсов
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border-2 ${theme.mode === "dark" ? "bg-gradient-to-r from-[#0f1419]/80 to-[#0f1419]/60 border-white/10" : "bg-gradient-to-r from-white/80 to-gray-50/60 border-gray-200"}`}
                style={{ borderLeftWidth: "4px", borderLeftColor: getTieColor() }}
              >
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: getTieColor() }} />
                  <div>
                    <p className={`font-medium mb-1 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                      График работы
                    </p>
                    <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      Рейсы ретропоезда проводятся только по выходным дням (суббота и воскресенье)
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border-2 ${theme.mode === "dark" ? "bg-gradient-to-r from-[#0f1419]/80 to-[#0f1419]/60 border-white/10" : "bg-gradient-to-r from-white/80 to-gray-50/60 border-gray-200"}`}
                style={{ borderLeftWidth: "4px", borderLeftColor: getTieColor() }}
              >
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: getTieColor() }} />
                  <div>
                    <p className={`font-medium mb-1 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                      Требования к бригаде
                    </p>
                    <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      Рейс проводится только при наличии полной поездной бригады
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border-2 ${theme.mode === "dark" ? "bg-gradient-to-r from-[#0f1419]/80 to-[#0f1419]/60 border-white/10" : "bg-gradient-to-r from-white/80 to-gray-50/60 border-gray-200"}`}
                style={{ borderLeftWidth: "4px", borderLeftColor: getTieColor() }}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: getTieColor() }} />
                  <div>
                    <p className={`font-medium mb-1 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                      Маршруты
                    </p>
                    <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      Доступны маршруты №901 и №903 строго в направлении Мирный → Приволжск
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Подвижной состав */}
        <AccordionItem
          value="rolling-stock"
          className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Train className="w-5 h-5" style={{ color: getTieColor() }} />
              <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                Подвижной состав
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <div
                  className="inline-block px-3 py-1 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: getTieColor() }}
                >
                  Локомотив
                </div>
                <h3 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  Паровоз ЛВ-0182
                </h3>
                <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: getTieColor() + "30" }}>
                  <Image
                    src="/images/design-mode/locomotive.png"
                    alt="Паровоз ЛВ-0182"
                    width={800}
                    height={450}
                    className="w-full h-auto"
                  />
                </div>
                <div
                  className={`p-4 rounded-xl ${theme.mode === "dark" ? "bg-[#0f1419]/80" : "bg-gray-50"}`}
                  style={{ borderLeft: `4px solid ${getTieColor()}` }}
                >
                  <p className={`text-sm mb-2 ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}>
                    <span className="font-semibold">Модель:</span> ЛВ-0182
                  </p>
                  <p className={`text-sm mb-2 ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}>
                    <span className="font-semibold">Год выпуска:</span> 1945
                  </p>
                  <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Советский паровоз серии ЛВ (Лебедянский Ворошиловец), выпущенный в послевоенное время. Один из
                    немногих сохранившихся экземпляров, используемый для туристических и экскурсионных рейсов.
                  </p>
                </div>
              </div>

              <div
                className="h-px"
                style={{ background: `linear-gradient(to right, transparent, ${getTieColor()}40, transparent)` }}
              />

              <div className="space-y-3">
                <div
                  className="inline-block px-3 py-1 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: getTieColor() }}
                >
                  Вагоны
                </div>
                <h3 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  Пассажирский состав
                </h3>
                <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: getTieColor() + "30" }}>
                  <Image
                    src="/images/design-mode/passenger-car.png"
                    alt="Пассажирский вагон"
                    width={800}
                    height={450}
                    className="w-full h-auto"
                  />
                </div>
                <div
                  className={`p-4 rounded-xl ${theme.mode === "dark" ? "bg-[#0f1419]/80" : "bg-gray-50"}`}
                  style={{ borderLeft: `4px solid ${getTieColor()}` }}
                >
                  <p className={`text-sm mb-3 ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}>
                    <span className="font-semibold">Состав поезда:</span>
                  </p>
                  <ul className={`space-y-2 text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    <li className="flex items-start gap-2">
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getTieColor() }}
                      />
                      <span>
                        <span className="font-medium">1 вагон с углём</span> — для обеспечения работы паровоза на всём
                        протяжении маршрута
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getTieColor() }}
                      />
                      <span>
                        <span className="font-medium">2 пассажирских вагона модели 061 30117</span> — классические
                        советские вагоны с комфортабельными купе, отреставрированные для туристических поездок
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Состав бригады */}
        <AccordionItem
          value="crew"
          className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" style={{ color: getTieColor() }} />
              <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                Состав поездной бригады
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              {/* Обязательный состав */}
              <div className="space-y-3">
                <div
                  className="inline-block px-3 py-1 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: getTieColor() }}
                >
                  Обязательный состав
                </div>
                <div className="grid gap-3">
                  <div
                    className={`p-4 rounded-xl border-2 ${theme.mode === "dark" ? "bg-[#0f1419]/60 border-white/10" : "bg-white border-gray-200"}`}
                  >
                    <h4 className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                      Машинист
                    </h4>
                    <ul className={`space-y-1 text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      <li>• Управление паровозом</li>
                      <li>• Контроль технического состояния локомотива</li>
                      <li>• Соблюдение скоростного режима</li>
                    </ul>
                  </div>
                  <div
                    className={`p-4 rounded-xl border-2 ${theme.mode === "dark" ? "bg-[#0f1419]/60 border-white/10" : "bg-white border-gray-200"}`}
                  >
                    <h4 className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                      Помощник машиниста
                    </h4>
                    <ul className={`space-y-1 text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      <li>• Помощь в управлении паровозом</li>
                      <li>• Контроль показателей приборов</li>
                      <li>• Поддержание работы котла</li>
                    </ul>
                  </div>
                  <div
                    className={`p-4 rounded-xl border-2 ${theme.mode === "dark" ? "bg-[#0f1419]/60 border-white/10" : "bg-white border-gray-200"}`}
                  >
                    <h4 className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                      Проводник-экскурсовод
                    </h4>
                    <ul className={`space-y-1 text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      <li>• Проведение экскурсий для пассажиров</li>
                      <li>• Обеспечение комфорта пассажиров</li>
                      <li>• Контроль порядка в вагонах</li>
                    </ul>
                  </div>
                  <div
                    className={`p-4 rounded-xl border-2 ${theme.mode === "dark" ? "bg-[#0f1419]/60 border-white/10" : "bg-white border-gray-200"}`}
                  >
                    <h4 className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                      Начальник поезда
                    </h4>
                    <ul className={`space-y-1 text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      <li>• Общее руководство рейсом</li>
                      <li>• Координация работы бригады</li>
                      <li>• Обеспечение безопасности</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div
                className="h-px"
                style={{ background: `linear-gradient(to right, transparent, ${getTieColor()}40, transparent)` }}
              />

              {/* Дополнительный состав */}
              <div className="space-y-3">
                <div
                  className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${theme.mode === "dark" ? "bg-white/10 text-white" : "bg-gray-200 text-gray-900"}`}
                  style={{ borderLeft: `3px solid ${getTieColor()}` }}
                >
                  Дополнительный состав
                </div>
                <div className="grid gap-3">
                  <div
                    className={`p-3 rounded-xl border ${theme.mode === "dark" ? "bg-[#0f1419]/40 border-white/5" : "bg-gray-50 border-gray-200"}`}
                  >
                    <h4
                      className={`font-medium text-sm mb-1 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}
                    >
                      Сотрудник ПТО
                    </h4>
                    <p className={`text-sm ${theme.mode === "dark" ? "text-white/60" : "text-gray-600"}`}>
                      Техническое обслуживание в пути
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-xl border ${theme.mode === "dark" ? "bg-[#0f1419]/40 border-white/5" : "bg-gray-50 border-gray-200"}`}
                  >
                    <h4
                      className={`font-medium text-sm mb-1 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}
                    >
                      Второй проводник
                    </h4>
                    <p className={`text-sm ${theme.mode === "dark" ? "text-white/60" : "text-gray-600"}`}>
                      Дополнительное обслуживание пассажиров
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-xl border ${theme.mode === "dark" ? "bg-[#0f1419]/40 border-white/5" : "bg-gray-50 border-gray-200"}`}
                  >
                    <h4
                      className={`font-medium text-sm mb-1 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}
                    >
                      Диспетчер
                    </h4>
                    <p className={`text-sm ${theme.mode === "dark" ? "text-white/60" : "text-gray-600"}`}>
                      Координация движения
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="schedule"
          className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5" style={{ color: getTieColor() }} />
              <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                Расписание движения
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4">
              <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                Время отправления и прибытия на станции маршрута Мирный — Приволжск
              </p>

              {/* Таблица расписания */}
              <div className="overflow-x-auto">
                <table
                  className={`w-full border-2 rounded-xl overflow-hidden ${theme.mode === "dark" ? "border-white/10" : "border-gray-200"}`}
                >
                  <thead>
                    <tr style={{ backgroundColor: getTieColor() }}>
                      <th className="px-4 py-3 text-left text-white font-semibold text-sm" rowSpan={2}>
                        №
                      </th>
                      <th className="px-4 py-3 text-center text-white font-semibold text-sm">Депо</th>
                      <th className="px-4 py-3 text-center text-white font-semibold text-sm" colSpan={2}>
                        Мирный
                      </th>
                      <th className="px-4 py-3 text-center text-white font-semibold text-sm" colSpan={2}>
                        Невский
                      </th>
                      <th className="px-4 py-3 text-center text-white font-semibold text-sm" colSpan={2}>
                        Приволжск
                      </th>
                      <th className="px-4 py-3 text-center text-white font-semibold text-sm">Депо</th>
                    </tr>
                    <tr className={theme.mode === "dark" ? "bg-[#0f1419]/60" : "bg-gray-50"}>
                      <th
                        className={`px-4 py-2 text-center text-xs font-medium ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}
                      >
                        Отправление
                      </th>
                      <th
                        className={`px-4 py-2 text-center text-xs font-medium ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}
                      >
                        Прибытие
                      </th>
                      <th
                        className={`px-4 py-2 text-center text-xs font-medium ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}
                      >
                        Отправление
                      </th>
                      <th
                        className={`px-4 py-2 text-center text-xs font-medium ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}
                      >
                        Прибытие
                      </th>
                      <th
                        className={`px-4 py-2 text-center text-xs font-medium ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}
                      >
                        Отправление
                      </th>
                      <th
                        className={`px-4 py-2 text-center text-xs font-medium ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}
                      >
                        Прибытие
                      </th>
                      <th
                        className={`px-4 py-2 text-center text-xs font-medium ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}
                      >
                        Отправление
                      </th>
                      <th
                        className={`px-4 py-2 text-center text-xs font-medium ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}
                      >
                        Прибытие
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      className={`border-t ${theme.mode === "dark" ? "border-white/10 bg-[#0f1419]/40" : "border-gray-200 bg-white"}`}
                    >
                      <td
                        className={`px-4 py-3 font-semibold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}
                      >
                        901
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        18:00
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        18:02
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        18:05
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        18:13
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        18:16
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        18:22
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        18:25
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        18:30
                      </td>
                    </tr>
                    <tr
                      className={`border-t ${theme.mode === "dark" ? "border-white/10 bg-[#0f1419]/40" : "border-gray-200 bg-white"}`}
                    >
                      <td
                        className={`px-4 py-3 font-semibold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}
                      >
                        903
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        19:00
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        19:02
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        19:05
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        19:13
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        19:16
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        19:22
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        19:25
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}
                      >
                        19:30
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Информационные карточки */}
              <div className="grid md:grid-cols-2 gap-3 mt-4">
                <div
                  className={`p-4 rounded-xl border-2 ${theme.mode === "dark" ? "bg-[#0f1419]/60 border-white/10" : "bg-white border-gray-200"}`}
                  style={{ borderLeftWidth: "4px", borderLeftColor: getTieColor() }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                        Маршрут №901
                      </p>
                      <p className={`text-sm ${theme.mode === "dark" ? "text-white/60" : "text-gray-600"}`}>
                        Мирный → Невский → Приволжск
                      </p>
                    </div>
                    <div
                      className="px-3 py-1 rounded-lg text-sm font-semibold text-white"
                      style={{ backgroundColor: getTieColor() }}
                    >
                      18:00
                    </div>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-xl border-2 ${theme.mode === "dark" ? "bg-[#0f1419]/60 border-white/10" : "bg-white border-gray-200"}`}
                  style={{ borderLeftWidth: "4px", borderLeftColor: getTieColor() }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                        Маршрут №903
                      </p>
                      <p className={`text-sm ${theme.mode === "dark" ? "text-white/60" : "text-gray-600"}`}>
                        Мирный → Невский → Приволжск
                      </p>
                    </div>
                    <div
                      className="px-3 py-1 rounded-lg text-sm font-semibold text-white"
                      style={{ backgroundColor: getTieColor() }}
                    >
                      19:00
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Скоростной регламент */}
        <AccordionItem
          value="speed"
          className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Gauge className="w-5 h-5" style={{ color: getTieColor() }} />
              <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                Скоростной регламент
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4">
              <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                Ограничения скорости на различных участках маршрута
              </p>

              <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: getTieColor() + "30" }}>
                <Image
                  src="/images/design-mode/speed-regulations.jpg"
                  alt="Скоростной регламент"
                  width={800}
                  height={800}
                  className="w-full h-auto"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div
                  className={`p-4 rounded-xl border-2 text-center ${
                    theme.mode === "dark"
                      ? "bg-[#0f1419]/60 border-[#b00000]/30"
                      : "bg-[#b00000]/10 border-[#b00000]/20"
                  }`}
                >
                  <p className="text-3xl font-bold text-[#b00000] mb-1">20</p>
                  <p className={`text-xs ${theme.mode === "dark" ? "text-white/60" : "text-gray-600"}`}>км/ч</p>
                  <p className={`text-xs mt-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-700"}`}>Депо</p>
                </div>
                <div
                  className={`p-4 rounded-xl border-2 text-center ${theme.mode === "dark" ? "bg-[#0f1419]/60 border-red-500/30" : "bg-red-50 border-red-200"}`}
                >
                  <p className="text-3xl font-bold text-red-500 mb-1">40</p>
                  <p className={`text-xs ${theme.mode === "dark" ? "text-white/60" : "text-gray-600"}`}>км/ч</p>
                  <p className={`text-xs mt-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-700"}`}>Станции</p>
                </div>
                <div
                  className={`p-4 rounded-xl border-2 text-center ${theme.mode === "dark" ? "bg-[#0f1419]/60 border-orange-500/30" : "bg-orange-50 border-orange-200"}`}
                >
                  <p className="text-3xl font-bold text-orange-500 mb-1">60</p>
                  <p className={`text-xs ${theme.mode === "dark" ? "text-white/60" : "text-gray-600"}`}>км/ч</p>
                  <p className={`text-xs mt-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-700"}`}>
                    Пригород
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl border-2 text-center ${theme.mode === "dark" ? "bg-[#0f1419]/60 border-yellow-500/30" : "bg-yellow-50 border-yellow-200"}`}
                >
                  <p className="text-3xl font-bold text-yellow-500 mb-1">80</p>
                  <p className={`text-xs ${theme.mode === "dark" ? "text-white/60" : "text-gray-600"}`}>км/ч</p>
                  <p className={`text-xs mt-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-700"}`}>
                    Основной
                  </p>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl ${theme.mode === "dark" ? "bg-[#0f1419]/80" : "bg-gray-50"}`}
                style={{ borderLeft: `4px solid ${getTieColor()}` }}
              >
                <p className={`text-sm font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  Важно:
                </p>
                <ul className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  <li>• Строго соблюдайте скоростные ограничения на каждом участке</li>
                  <li>• Максимальная скорость на открытых участках: 80 км/ч</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {contentData.retro.map((retro) => (
          <AccordionItem
            key={retro.id}
            value={retro.id}
            className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5" style={{ color: getTieColor() }} />
                <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  {retro.number}. {retro.title}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">{renderContent(retro.content, retro.id)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

"use client"

import type React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Radio, Copy, Check } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import type { UserRole } from "@/data/users"
import { useState, useEffect } from "react"
import { getThemeColor } from "@/lib/theme-utils"

interface RadioReportsSectionProps {
  userRole?: UserRole
}

export function RadioReportsSection({ userRole }: RadioReportsSectionProps) {
  const { theme } = useTheme()
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const [userTag, setUserTag] = useState("[ТЭГ]")
  const [fillMode, setFillMode] = useState(false)
  const [filledReports, setFilledReports] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const authData = localStorage.getItem("currentUser")
    if (authData) {
      try {
        const userData = JSON.parse(authData)
        const nickname = userData.nickname || ""
        const match = nickname.match(/^\[([^\]]+)\]/)
        if (match) {
          setUserTag(`[${match[1]}]`)
        }
      } catch (error) {
        console.error("Error extracting user tag:", error)
      }
    }
  }, [])

  const replaceTag = (text: string) => {
    return text.replace(/\[ТЭГ\]/g, userTag)
  }

  const handleFillInput = (copyId: string, value: string) => {
    setFilledReports((prev) => ({ ...prev, [copyId]: value }))
  }

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const copyToClipboard = (text: string, index: string) => {
    let processedText = replaceTag(text)
    if (fillMode && filledReports[index]) {
      processedText = processedText.replace(/\*[^*]+\*/g, () => {
        return filledReports[index] || ""
      })
    }
    navigator.clipboard.writeText(processedText)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const canSeeReport = (reportRank: string): boolean => {
    if (!userRole) return true

    if (reportRank === "duty") return true

    if (reportRank === "accident") return userRole !== "ПТО"

    if (reportRank === "senior") {
      return userRole === "Старший Состав" || userRole === "Заместитель" || userRole === "Руководство"
    }

    const rankNumber = Number.parseInt(reportRank.replace("rank", ""))

    if (userRole === "ПТО") {
      return rankNumber >= 1 && rankNumber <= 2
    } else if (userRole === "ЦдУД") {
      return rankNumber >= 3 && rankNumber <= 5
    } else if (userRole === "Старший Состав") {
      return rankNumber >= 6 && rankNumber <= 7
    } else if (userRole === "Заместитель") {
      return rankNumber === 8
    } else if (userRole === "Руководство") {
      return rankNumber === 9
    }

    return false
  }

  const tableOfContents = [
    { id: "radio-tags", label: "Тэги рации по рангам", visible: true },
    { id: "common-reports", label: "Общие доклады", visible: true },
    { id: "rank1", label: "1 ранг - Слесарь-электрик", visible: canSeeReport("rank1") },
    { id: "rank2", label: "2 ранг - Монтёр пути", visible: canSeeReport("rank2") },
    { id: "rank3to5", label: "3-5 ранг - Локомотивная бригада", visible: canSeeReport("rank3") },
    { id: "duty", label: "Дежурство на переездах и станциях", visible: canSeeReport("duty") },
    { id: "accident", label: "ДТП", visible: canSeeReport("accident") },
    { id: "senior", label: "Старший состав", visible: canSeeReport("senior") },
  ]

  const radioTags = {
    rank1: { tag: "[ТЧР]", name: "Слесарь-электрик (На дежурстве всегда один)" },
    rank2: { tag: "[ПЧ]", name: "Монтёр пути" },
    rank3: [{ tag: "[ТЧМП]", name: "Помощник машиниста" }],
    rank4: [
      { tag: "[ТЧМ-3КМ]", name: "Машинист третьего класса" },
      { tag: "[ТЧМ-2КМ]", name: "Машинист второго класса" },
      { tag: "[ТЧМ-1КМ]", name: "Машинист первого класса" },
    ],
    rank5: [
      { tag: "[ДНЦ-О]", name: "Оператор при поездном диспетчере" },
      { tag: "[ДНЦ]", name: "Поездной диспетчер" },
      { tag: "[ДНЦ-С]", name: "Старший поездной диспетчер" },
    ],
    rank6: [
      { tag: "[ТЧМИ]", name: "Машинист-инструктор" },
      { tag: "[ТЧМИ]", name: "Зам. Нач. ЭО" },
      { tag: "[ТЧМИ]", name: "Зам. Нач. ПТО" },
      { tag: "[ТЧМИ]", name: "Зам. Нач. ЦдУД" },
    ],
    rank7: [
      { tag: "[ЦКАДР]", name: "Нач. ЭО" },
      { tag: "[ДГПт]", name: "Нач. ПТО" },
      { tag: "[ДГПд]", name: "Нач. ЦдУД" },
    ],
    rank8: [
      { tag: "[ТЧЗд]", name: "Зам. нач. депо по эксплуатации" },
      { tag: "[ТЧЗк]", name: "Зам. нач. депо по кадровой работе" },
      { tag: "[ТЧЗ-1]", name: "Первый зам. нач. депо" },
    ],
    rank9: [
      { tag: "[ТЧ]", name: "Начальник депо" },
      { tag: "[Ц] [РЖД]", name: "Генеральный директор" },
      { tag: "[Ц] [РЖД]", name: "Зам. Генерального Директора" },
    ],
  }

  const commonReports = [
    {
      title: "Заступление и сдача смены",
      description: "Доклады при начале и окончании рабочего дня",
      reports: [
        { text: "r [ТЭГ] Заступил на смену.", desc: "При начале рабочего дня" },
        { text: "r [ТЭГ] Сдал смену.", desc: "При окончании рабочего дня" },
      ],
    },
    {
      title: "Перерывы (обязательно)",
      description: "Доклады об уходе на перерыв обязательны",
      reports: [
        { text: "r [ТЭГ] Взял перерыв.", desc: "Перед перерывом" },
        { text: "r [ТЭГ] Вернулся с перерыва.", desc: "После перерыва" },
      ],
    },
    {
      title: "Технические неполадки",
      description: "Для отката сообщения в /r рации",
      reports: [{ text: "r [ТЭГ] Тех. неполадки.", desc: "Откат сообщения в рации" }],
    },
  ]

  const rankReports = {
    rank1: {
      title: "1 ранг - Слесарь-электрик [ТЧР]",
      sections: [
        {
          subtitle: "Ремонт в депо ТЧЭ-1 'Мирный'",
          reports: [
            {
              text: "r [ТЧР] Приступил к ремонту подвижных составов в депо ТЧЭ-1 'Мирный'",
              desc: "Начало ремонта в депо г. Мирный",
            },
            {
              text: "r [ТЧР] Закончил ремонт подвижных составов в депо ТЧЭ-1 'Мирный'",
              desc: "Окончание ремонта в депо г. Мирный",
            },
          ],
        },
        {
          subtitle: "Ремонт в депо ТЧЭ-3 'Невский-Сортировочный'",
          reports: [
            {
              text: "r [ТЧР] Отправляюсь в депо ТЧЭ-3 'Невский-Сортировочный'",
              desc: "Отправление к меткам в депо г. Невский",
            },
            {
              text: "r [ТЧР] Приступил к ремонту подвижных составов в депо ТЧЭ-3 'Невский-Сортировочный'",
              desc: "Начало ремонта в депо г. Невский",
            },
            {
              text: "r [ТЧР] Закончил ремонт подвижных составов в депо ТЧЭ-3 'Невский-Сортировочный'",
              desc: "Окончание ремонта в депо г. Невский",
            },
            {
              text: "r [ТЧР] Отправляюсь в депо ТЧЭ-1 'Мирный'",
              desc: "Возвращение к меткам в депо г. Мирный",
            },
          ],
        },
        {
          subtitle: "Использование служебного транспорта",
          reports: [
            {
              text: "r [ТЧР] Занял ЗИЛ для отправки в депо ТЧЭ-3 'Невский-Сортировочный' города Невский.",
              desc: "При необходимости поездки в Невский",
            },
            {
              text: "r [ТЧР] Занятый ранее ЗИЛ возвращён на парковку РЖД.",
              desc: "После возвращения",
            },
          ],
        },
      ],
    },
    rank2: {
      title: "2 ранг - Монтёр пути [ПЧ]",
      sections: [
        {
          subtitle: "Начало и окончание работ",
          reports: [
            {
              text: "r [ПЧ] Занял ЗИЛ для проведения ремонтных работ на ж/д полотне.",
              desc: "Перед началом работы",
            },
            {
              text: "r [ПЧ] Закончил работу на перегоне. Возвращаюсь на базу.",
              desc: "По завершению работы",
            },
          ],
        },
        {
          subtitle: "Доклады по перегонам",
          reports: [
            {
              text: "r [ПЧ] Приступил к ремонтным работам на перегоне ТЧЭ-1 - Ст. Мирный!",
              desc: "От Депо до ст. Мирного",
            },
            {
              text: "r [ПЧ] Приступил к ремонтным работам на перегоне Ст. Мирный - Ст. Невский!",
              desc: "После прохождения ст. Мирный",
            },
            {
              text: "r [ПЧ] Приступил к ремонтным работам на перегоне Ст. Невский - Ст. Приволжск!",
              desc: "После прохождения ст. Невский",
            },
            {
              text: "r [ПЧ] Приступил к ремонтным работам на перегоне Ст. Приволжск - Депо ТЧЭ-1!",
              desc: "После прохождения ст. Приволжск",
            },
          ],
        },
        {
          subtitle: "Доклады по местоположению (примеры)",
          reports: [
            { text: "r [ПЧ] Внимание! Ведутся ремонтные работы в районе АТП г. Мирный!", desc: "" },
            { text: "r [ПЧ] Внимание! Ведутся ремонтные работы в районе СТО г. Мирный!", desc: "" },
            { text: "r [ПЧ] Внимание! Ведутся ремонтные работы в районе ЖД моста со стороны ст. Мирный!", desc: "" },
            { text: "r [ПЧ] Внимание! Ведутся ремонтные работы в районе Дворцового моста!", desc: "" },
            { text: "r [ПЧ] Внимание! Ведутся ремонтные работы в районе ГЭС!", desc: "" },
            { text: "r [ПЧ] Внимание! Ведутся ремонтные работы в районе Ст. Невский!", desc: "" },
            { text: "r [ПЧ] Внимание! Ведутся ремонтные работы в районе Деревни Азино!", desc: "" },
            { text: "r [ПЧ] Внимание! Ведутся ремонтные работы в районе Ст. Приволжск!", desc: "" },
          ],
        },
      ],
    },
    rank3to5: {
      title: "3-5 ранг - Локомотивная бригада и диспетчеры",
      sections: [
        {
          subtitle: "Автономное следование (без диспетчера)",
          reports: [
            {
              text: "r [*Позывной поезда*] - [ПЧ] Отправляюсь со ст. *название* на перегон до ст. *название*. Освободите путь!",
              desc: "Доклад машиниста монтёру пути",
            },
            { text: "r [ПЧ] - [*Позывной поезд*] Путь свободен!", desc: "Ответ монтёра пути" },
            {
              text: "r [ПЧ] - [*Позывной поезд*] Поезд проследовал перегон без замечаний.",
              desc: "После проследования",
            },
          ],
        },
        {
          subtitle: "Сопровождение диспетчером",
          reports: [
            {
              text: "tr 1/2/3/4 На перегоне *название* - *название* ведутся ремонтные работы, будьте бдительны.",
              desc: "Доклад диспетчера машинисту",
            },
            {
              text: "cr Принял информацию, что на перегоне *название* - *название* ведутся ремонтные работы.",
              desc: "Подтверждение машиниста",
            },
            {
              text: "r [ДНЦ] - [ПЧ] Со ст. *название* отправляется поезд на перегон до ст. *название*. Освободите путь!",
              desc: "Доклад диспетчера монтёру",
            },
            { text: "r [ПЧ] - [ДНЦ] Путь свободен!", desc: "Ответ монтёра" },
            {
              text: "r [ПЧ] - [ДНЦ] Поезд проследовал перегон без замечаний.",
              desc: "После проследования",
            },
          ],
        },
      ],
    },
  }

  const dutyReports = {
    title: "Дежурство на переездах и станциях",
    sections: [
      {
        subtitle: "Дежурство на переезде [ДПП]",
        reports: [
          { text: "r [ДПП] Занял ЗИЛ для отправки на место несения дежурства.", desc: "Перед выездом" },
          { text: "r [ДПП] Заступил на дежурство на переезде *название*.", desc: "Начало дежурства" },
          { text: "r [ДПП] Продолжаю дежурство на переезде *название*.", desc: "Каждые 10 минут" },
          {
            text: "r [ДПП] Поезд проследовал переезд *название* без замечаний.",
            desc: "После проследования поезда",
          },
          {
            text: "r [ДПП] Запрещается движение подвижных составов на переезде *название*. Причина: *причина*.",
            desc: "При помехах",
          },
          {
            text: "r [ДПП] Разрешается движение подвижных составов на переезде *название*.",
            desc: "После устранения помех",
          },
          { text: "r [ДПП] Переезд *название* сдал.", desc: "Окончание дежурства" },
          { text: "r [ДПП] Вернул ЗИЛ на парковку РЖД.", desc: "После возвращения" },
        ],
      },
      {
        subtitle: "Дежурство на станции [ДПВ]",
        reports: [
          { text: "r [ДПВ] Занял ЗИЛ для отправки на место несения дежурства.", desc: "Перед выездом" },
          {
            text: "r [ДПВ] Прибыл на вокзал *Мирного/Невского/Приволжска* для дежурства.",
            desc: "Начало дежурства",
          },
          {
            text: "r [ДПВ] Продолжаю дежурство на вокзале *Мирного/Невского/Приволжска*.",
            desc: "Каждые 10 минут",
          },
          {
            text: "r [ДПВ] Покинул вокзал *Мирного/Невского/Приволжска*.",
            desc: "Окончание дежурства",
          },
          { text: "r [ДПВ] Вернул ЗИЛ на парковку РЖД.", desc: "После возвращения" },
        ],
      },
    ],
  }

  const accidentReports = {
    title: "Дорожно-транспортное происшествие (ДТП)",
    sections: [
      {
        subtitle: "При автономном следовании",
        reports: [
          {
            text: "r [*Позывной поезда*] Внимание произошло ДТП *местоположение*. Остановите составы в этом направлении!",
            desc: "При ДТП",
          },
          {
            text: "r [*Позывной поезда*] Виновник ДТП скрылся. Продолжаю движение.",
            desc: "Если виновник скрылся",
          },
        ],
      },
      {
        subtitle: "При сопровождении диспетчером",
        reports: [
          { text: "cr Диспетчер!", desc: "Вызов диспетчера" },
          { text: "tr 1/2/3/4 ДНЦ *Фамилия*, сушаю.", desc: "Ответ диспетчера" },
          {
            text: "cr Произошло ДТП *местоположение* по (нечётному / чётному / обоим) направлению(-ям).",
            desc: "Сообщение о ДТП",
          },
          {
            text: "tr 1/2/3/4 Понятно, произошло ДТП *местоположение* по (нечётному / чётному / обоим) направлению(-ям).",
            desc: "Подтверждение диспетчера",
          },
          {
            text: "r [ДНЦ] Внимание! Произошло ДТП *местоположение*. Запрещается движение по (нечётному / чётному / обоим) направлению(-ям).",
            desc: "Объявление в рацию",
          },
          { text: "cr Виновник ДТП скрылся, состав готов к отправлению.", desc: "Если виновник скрылся" },
          { text: "tr 1/2/3/4 Понятно, виновник ДТП скрылся. Разрешаю движение.", desc: "Разрешение диспетчера" },
          { text: "cr Принято! Выполняю.", desc: "Подтверждение машиниста" },
          {
            text: "r [ДНЦ] Разрешается движение подвижных составов на *местоположение*.",
            desc: "Объявление в рацию",
          },
        ],
      },
    ],
  }

  const seniorStaffReports = {
    title: "Доклады для сотрудников старшего состава",
    sections: [
      {
        subtitle: "При ДТП - вызов служб",
        reports: [
          {
            text: "d [РЖД] [ГИБДД] Требуется экипаж на переезд *название* | Причина: ДТП.",
            desc: "Вызов ГИБДД",
          },
          {
            text: "d [РЖД] [МЗ] Требуется карета СМП на переезд *название* | Причина: ДТП. Оказание помощи пострадавшим.",
            desc: "Вызов скорой помощи",
          },
        ],
      },
      {
        subtitle: "Внутренние переговоры с локомотивной бригадой",
        reports: [
          {
            text: "r [ТЭГ] Произошло ДТП на переезде *название*. Всем составам, следующих в данном направлении, немедленно остановиться.",
            desc: "Остановка движения",
          },
          {
            text: "r [ТЭГ] Принято. Выезжаю на место происшествия на переезд *название*.",
            desc: "Выезд на место",
          },
          {
            text: 'r [ТЭГ] [*Позывной поезда*] Двигаемся вперед до моей команды "Стоп".',
            desc: "Управление движением",
          },
          { text: "r [ТЭГ] [*Позывной поезда*] Стоп!", desc: "Остановка состава" },
          {
            text: "r [ТЭГ] [*Позывной поезда*] ДТП устранено. Продолжайте движение.",
            desc: "Разрешение движения составу",
          },
          {
            text: "r [ТЭГ] ДТП устранено. Движение через переезд *название* разрешено.",
            desc: "Общее объявление",
          },
        ],
      },
      {
        subtitle: "Другие ситуации",
        reports: [
          {
            text: "d [РЖД] [ГУВД] Требуется экипаж *место происшествия* | Причина: *причина*",
            desc: "Вызов полиции",
          },
          {
            text: "d [РЖД] [МЗ] Требуется карета СМП на *место происшествия* | Причина: *причина*",
            desc: "Вызов скорой",
          },
        ],
      },
    ],
  }

  const renderReportItem = (report: { text: string; desc?: string }, copyId: string, colorClass: string) => {
    const isCopied = copiedIndex === copyId
    return (
      <button
        onClick={() => copyToClipboard(report.text, copyId)}
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
          <div className="flex-1">
            <code className={`block mb-1 font-mono text-sm ${colorClass}`}>{replaceTag(report.text)}</code>
            {report.desc && (
              <p className={`text-xs ${theme.mode === "dark" ? "text-white/60" : "text-gray-500"}`}>{report.desc}</p>
            )}
          </div>

          {/* Right icon - copy button */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: getTieColor() + "20",
            }}
          >
            {copiedIndex === copyId ? (
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
  }

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
          <Radio className="w-6 h-6" style={{ color: getTieColor() }} />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
            Доклады в рацию
          </h2>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Полный справочник докладов и команд для радиосвязи
          </p>
        </div>
      </div>

      <Card
        className={`border-2 rounded-2xl overflow-hidden ${
          theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <CardHeader className="border-b pb-4" style={{ borderColor: getTieColor() }}>
          <h3 className="text-xl font-bold" style={{ color: getTieColor() }}>
            Оглавление
          </h3>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/60" : "text-gray-500"}`}>
            Быстрая навигация по разделам
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tableOfContents
              .filter((item) => item.visible)
              .map((item, index) => (
                <a
                  key={index}
                  href={`#${item.id}`}
                  onClick={(e) => handleSmoothScroll(e, item.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                    theme.mode === "dark"
                      ? "bg-white/5 border-white/10 hover:border-white/30"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor: getTieColor(),
                  }}
                >
                  <span className={`font-medium ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}>
                    {item.label}
                  </span>
                </a>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Radio Tags Reference */}
      <Card
        id="radio-tags"
        className={`border-2 rounded-2xl overflow-hidden scroll-mt-6 ${
          theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <CardHeader className="border-b pb-4" style={{ borderColor: getTieColor() }}>
          <h3 className="text-xl font-bold" style={{ color: getTieColor() }}>
            Тэги рации по рангам
          </h3>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/60" : "text-gray-500"}`}>
            Используйте эти тэги вместо [ТЭГ] в докладах
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(radioTags).map(([rank, data]) => (
              <div
                key={rank}
                className={`p-4 rounded-xl border ${
                  theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
                }`}
              >
                <h4 className={`font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  {rank.replace("rank", "Ранг ")}
                </h4>
                {Array.isArray(data) ? (
                  <div className="space-y-1">
                    {data.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <code
                          className={`text-xs font-mono ${theme.mode === "dark" ? "text-blue-400" : "text-blue-600"}`}
                        >
                          {item.tag}
                        </code>
                        <span className={`text-xs ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <code className={`text-xs font-mono ${theme.mode === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                      {data.tag}
                    </code>
                    <span className={`text-xs ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      {data.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {/* Common Reports */}
        <Card
          id="common-reports"
          className={`border-2 rounded-2xl overflow-hidden scroll-mt-6 ${
            theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
          }`}
        >
          <CardHeader className="border-b pb-4" style={{ borderColor: getTieColor() }}>
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5" style={{ color: getTieColor() }} />
              <h3 className="text-xl font-bold" style={{ color: getTieColor() }}>
                Общие доклады (для всех рангов)
              </h3>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {commonReports.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-3">
                  <div>
                    <h4 className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                      {section.title}
                    </h4>
                    <p className={`text-xs ${theme.mode === "dark" ? "text-white/60" : "text-gray-500"}`}>
                      {section.description}
                    </p>
                  </div>
                  <div className="space-y-0">
                    {section.reports.map((report, reportIndex) => {
                      const copyId = `common-${sectionIndex}-${reportIndex}`
                      const colorClass = theme.mode === "dark" ? "text-green-400" : "text-green-600"
                      return <div key={reportIndex}>{renderReportItem(report, copyId, colorClass)}</div>
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rank Reports */}
        {Object.entries(rankReports).map(([rankKey, rankData]) => {
          let rankForCheck = rankKey
          if (rankKey === "rank3to5") rankForCheck = "rank3"

          if (!canSeeReport(rankForCheck)) return null

          return (
            <Card
              key={rankKey}
              id={rankKey}
              className={`border-2 rounded-2xl overflow-hidden scroll-mt-6 ${
                theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
              }`}
            >
              <CardHeader className="border-b pb-4" style={{ borderColor: getTieColor() }}>
                <div className="flex items-center gap-3">
                  <Radio className="w-5 h-5" style={{ color: getTieColor() }} />
                  <h3 className="text-xl font-bold" style={{ color: getTieColor() }}>
                    {rankData.title}
                  </h3>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {rankData.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="space-y-3">
                      <h4 className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                        {section.subtitle}
                      </h4>
                      <div className="space-y-0">
                        {section.reports.map((report, reportIndex) => {
                          const copyId = `${rankKey}-${sectionIndex}-${reportIndex}`
                          const colorClass = theme.mode === "dark" ? "text-blue-400" : "text-blue-600"
                          return <div key={reportIndex}>{renderReportItem(report, copyId, colorClass)}</div>
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Duty Reports */}
        {canSeeReport("duty") && (
          <Card
            id="duty"
            className={`border-2 rounded-2xl overflow-hidden scroll-mt-6 ${
              theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
            }`}
          >
            <CardHeader className="border-b pb-4" style={{ borderColor: getTieColor() }}>
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5" style={{ color: getTieColor() }} />
                <h3 className="text-xl font-bold" style={{ color: getTieColor() }}>
                  {dutyReports.title}
                </h3>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {dutyReports.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="space-y-3">
                    <h4 className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                      {section.subtitle}
                    </h4>
                    <div className="space-y-0">
                      {section.reports.map((report, reportIndex) => {
                        const copyId = `duty-${sectionIndex}-${reportIndex}`
                        const colorClass = theme.mode === "dark" ? "text-yellow-400" : "text-yellow-600"
                        return <div key={reportIndex}>{renderReportItem(report, copyId, colorClass)}</div>
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accident Reports */}
        {canSeeReport("accident") && (
          <Card
            id="accident"
            className={`border-2 rounded-2xl overflow-hidden scroll-mt-6 ${
              theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
            }`}
          >
            <CardHeader className="border-b pb-4" style={{ borderColor: getTieColor() }}>
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5" style={{ color: getTieColor() }} />
                <h3 className="text-xl font-bold" style={{ color: getTieColor() }}>
                  {accidentReports.title}
                </h3>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {accidentReports.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="space-y-3">
                    <h4 className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                      {section.subtitle}
                    </h4>
                    <div className="space-y-0">
                      {section.reports.map((report, reportIndex) => {
                        const copyId = `accident-${sectionIndex}-${reportIndex}`
                        const colorClass = theme.mode === "dark" ? "text-red-400" : "text-red-600"
                        return <div key={reportIndex}>{renderReportItem(report, copyId, colorClass)}</div>
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Senior Staff Reports */}
        {canSeeReport("senior") && (
          <Card
            id="senior"
            className={`border-2 rounded-2xl overflow-hidden scroll-mt-6 ${
              theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
            }`}
          >
            <CardHeader className="border-b pb-4" style={{ borderColor: getTieColor() }}>
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5" style={{ color: getTieColor() }} />
                <h3 className="text-xl font-bold" style={{ color: getTieColor() }}>
                  {seniorStaffReports.title}
                </h3>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {seniorStaffReports.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="space-y-3">
                    <h4 className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                      {section.subtitle}
                    </h4>
                    <div className="space-y-0">
                      {section.reports.map((report, reportIndex) => {
                        const copyId = `senior-${sectionIndex}-${reportIndex}`
                        const colorClass = theme.mode === "dark" ? "text-purple-400" : "text-purple-600"
                        return <div key={reportIndex}>{renderReportItem(report, copyId, colorClass)}</div>
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

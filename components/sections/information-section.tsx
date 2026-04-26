"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Info,
  Users,
  Wrench,
  Train,
  Radio,
  FileText,
  Shield,
  Calendar,
  Building,
  Briefcase,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import type { UserRole } from "@/data/users"
import { getThemeColor } from "@/lib/theme-utils"

interface InformationSectionProps {
  userRole?: UserRole
}

function ExpandableImage({ src, alt, label }: { src: string; alt: string; label?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { theme } = useTheme()

  return (
    <div className="space-y-3">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="outline"
        className={`w-full justify-between ${theme.mode === "dark" ? "border-white/20 hover:bg-white/5" : "border-gray-300 hover:bg-gray-50"}`}
      >
        <span>{label || alt}</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>
      {isExpanded && (
        <div
          className="rounded-xl overflow-hidden border-2"
          style={{ borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
        >
          <Image src={src || "/placeholder.svg"} alt={alt} width={1200} height={800} className="w-full h-auto" />
        </div>
      )}
    </div>
  )
}

export function InformationSection({ userRole }: InformationSectionProps) {
  const { theme } = useTheme()
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrollingUp, setIsScrollingUp] = useState(false)
  const tocRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<HTMLDivElement>(null) // Changed from contentRef to tocRef

  const getTieColor = () => getThemeColor(theme.colorTheme)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollingUp = currentScrollY < lastScrollY

      setIsScrollingUp(scrollingUp)

      // If user scrolls up significantly and is past the TOC, return to TOC
      if (scrollingUp && currentScrollY > 500 && lastScrollY - currentScrollY > 50) {
        tocRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const getSectionsForRole = () => {
    const allSections = [
      {
        id: "leadership",
        label: "Руководство и старший состав",
        icon: Users,
        roles: ["Руководство", "Заместитель", "Старший Состав"],
      },
      {
        id: "duties",
        label: "Обязанности сотрудников",
        icon: Briefcase,
        roles: ["ПТО", "ЦдУД", "Старший Состав", "Заместитель", "Руководство"],
      },
      {
        id: "vehicles",
        label: "Служебный транспорт",
        icon: Train,
        roles: ["ПТО", "ЦдУД", "Старший Состав", "Заместитель", "Руководство"],
      },
      {
        id: "rolling-stock",
        label: "Подвижной состав",
        icon: Train,
        roles: ["ЦдУД", "Старший Состав", "Заместитель", "Руководство"],
      },
      // {
      //   id: "tags",
      //   label: "ТЕГи и звания",
      //   icon: Shield,
      //   roles: ["ПТО", "ЦдУД", "Старший Состав", "Заместитель", "Руководство"],
      // },
      // {
      //   id: "duty-locations",
      //   label: "Переезды и станции для дежурств",
      //   icon: MapPin,
      //   roles: ["ПТО", "ЦдУД", "Старший Состав", "Заместитель", "Руководство"],
      // },
      {
        id: "commands",
        label: "Основные команды",
        icon: Radio,
        roles: ["ПТО", "ЦдУД", "Старший Состав", "Заместитель", "Руководство"],
      },
      {
        id: "id-card",
        label: "Удостоверение сотрудников",
        icon: FileText,
        roles: ["ПТО", "ЦдУД", "Старший Состав", "Заместитель", "Руководство"],
      },
      {
        id: "schedule",
        label: "График работы",
        icon: Calendar,
        roles: ["ПТО", "ЦдУД", "Старший Состав", "Заместитель", "Руководство"],
      },
      {
        id: "offices",
        label: "Распределение кабинетов",
        icon: Building,
        roles: ["Старший Состав", "Заместитель", "Руководство"],
      },
      // {
      //   id: "roleplay",
      //   label: "Role Play действия",
      //   icon: Wrench,
      //   roles: ["ПТО", "ЦдУД", "Старший Состав", "Заместитель", "Руководство"],
      // },
    ]

    if (!userRole) return allSections

    return allSections.filter((section) => section.roles.includes(userRole))
  }

  const sections = getSectionsForRole()

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
          <Info className="w-6 h-6" style={{ color: getTieColor() }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
            Информация
          </h2>
        </div>
      </div>

      {/* TOC Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              className={`p-4 rounded-xl border-2 transition-all hover:scale-105 text-left ${
                theme.mode === "dark"
                  ? "bg-[#0f1419]/50 border-white/10 hover:border-white/30"
                  : "bg-white border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${getTieColor()}20, ${getTieColor()}10)`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: getTieColor() }} />
                </div>
                <span className={`font-semibold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  {section.label}
                </span>
              </div>
            </button>
          )
        })}
      </div> */}

      <Accordion type="single" collapsible className="space-y-4">
        {sections.find((s) => s.id === "leadership") && (
          <AccordionItem
            value="leadership"
            className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" style={{ color: getTieColor() }} />
                <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  Руководство и старший состав
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <LeadershipSection getTieColor={getTieColor} theme={theme} />
            </AccordionContent>
          </AccordionItem>
        )}

        {sections.find((s) => s.id === "duties") && (
          <AccordionItem
            value="duties"
            className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5" style={{ color: getTieColor() }} />
                <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  Обязанности сотрудников
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <DutiesSection getTieColor={getTieColor} theme={theme} userRole={userRole} />
            </AccordionContent>
          </AccordionItem>
        )}

        {sections.find((s) => s.id === "vehicles") && (
          <AccordionItem
            value="vehicles"
            className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Train className="w-5 h-5" style={{ color: getTieColor() }} />
                <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  Служебный транспорт
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <VehiclesSection getTieColor={getTieColor} theme={theme} userRole={userRole} />
            </AccordionContent>
          </AccordionItem>
        )}

        {sections.find((s) => s.id === "rolling-stock") && (
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
              <RollingStockSection getTieColor={getTieColor} theme={theme} />
            </AccordionContent>
          </AccordionItem>
        )}

        {sections.find((s) => s.id === "retro-train") && (
          <AccordionItem
            value="retro-train"
            className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Train className="w-5 h-5" style={{ color: getTieColor() }} />
                <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  Ретропоезд
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <RetroTrainSection getTieColor={getTieColor} theme={theme} />
            </AccordionContent>
          </AccordionItem>
        )}

        {sections.find((s) => s.id === "commands") && (
          <AccordionItem
            value="commands"
            className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5" style={{ color: getTieColor() }} />
                <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  Основные команды
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <CommandsSection getTieColor={getTieColor} theme={theme} userRole={userRole} />
            </AccordionContent>
          </AccordionItem>
        )}

        {sections.find((s) => s.id === "id-card") && (
          <AccordionItem
            value="id-card"
            className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" style={{ color: getTieColor() }} />
                <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  Удостоверение сотрудников
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <IdCardSection getTieColor={getTieColor} theme={theme} />
            </AccordionContent>
          </AccordionItem>
        )}

        {sections.find((s) => s.id === "schedule") && (
          <AccordionItem
            value="schedule"
            className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" style={{ color: getTieColor() }} />
                <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  График работы
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <ScheduleSection getTieColor={getTieColor} theme={theme} />
            </AccordionContent>
          </AccordionItem>
        )}

        {sections.find((s) => s.id === "offices") && (
          <AccordionItem
            value="offices"
            className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5" style={{ color: getTieColor() }} />
                <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  Распределение кабинетов
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <OfficesSection getTieColor={getTieColor} theme={theme} />
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {/* All Sections - Filtered by role */}
      {/* <div className="space-y-12">
        {sections.find((s) => s.id === "leadership") && <LeadershipSection getTieColor={getTieColor} theme={theme} />}
        {sections.find((s) => s.id === "duties") && (
          <DutiesSection getTieColor={getTieColor} theme={theme} userRole={userRole} />
        )}
        {sections.find((s) => s.id === "vehicles") && (
          <VehiclesSection getTieColor={getTieColor} theme={theme} userRole={userRole} />
        )}
        {sections.find((s) => s.id === "rolling-stock") && (
          <RollingStockSection getTieColor={getTieColor} theme={theme} />
        )}
        {sections.find((s) => s.id === "tags") && (
          <TagsSection getTieColor={getTieColor} theme={theme} userRole={userRole} />
        )}
        {sections.find((s) => s.id === "duty-locations") && (
          <DutyLocationsSection getTieColor={getTieColor} theme={theme} />
        )}
        {sections.find((s) => s.id === "commands") && (
          <CommandsSection getTieColor={getTieColor} theme={theme} userRole={userRole} />
        )}
        {sections.find((s) => s.id === "id-card") && <IdCardSection getTieColor={getTieColor} theme={theme} />}
        {sections.find((s) => s.id === "schedule") && <ScheduleSection getTieColor={getTieColor} theme={theme} />}
        {sections.find((s) => s.id === "offices") && <OfficesSection getTieColor={getTieColor} theme={theme} />}
        {sections.find((s) => s.id === "roleplay") && <RoleplaySection getTieColor={getTieColor} theme={theme} />}
      </div> */}
    </div>
  )
}

function LeadershipSection({ getTieColor, theme }: any) {
  return (
    <div id="leadership" className="space-y-6 scroll-mt-6">
      {" "}
      {/* Added id and scroll-mt-6 */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <Users className="w-6 h-6" style={{ color: getTieColor() }} />
        <h2 className="text-2xl font-bold" style={{ color: getTieColor() }}>
          Раздел I. Руководящий и старший состав организации
        </h2>
      </div>
      <Card
        className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
      >
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Высшее руководство
            </h3>
            <div className="space-y-3">
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Генеральный Директор ОАО "РЖД" - <span className="text-orange-500">Maksim_Kuliy</span>
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Заместитель Генерального Директора - <span className="text-orange-500">Butius_Markov</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Руководство депо
            </h3>
            <div className="space-y-3">
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Начальник Депо - <span className="text-orange-500">Egor_Washington</span>
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Первый Заместитель Начальника Депо - <span className="text-orange-500">Lee_Luthor</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Заместители начальника депо
            </h3>
            <div className="space-y-3">
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Заместитель начальника депо по кадровой работе - <span className="text-orange-500">Вакантно</span>
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Заместитель начальника депо по эксплуатации - <span className="text-orange-500">Damir_Shooters</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Начальники отделов
            </h3>
            <div className="space-y-3">
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Начальник ЭО* - <span className="text-orange-500">Вакантно</span>
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Начальник ЦдУД* - <span className="text-orange-500">Вакантно</span>
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Начальник ПТО* - <span className="text-orange-500">Вакантно</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Заместители начальников отделов
            </h3>
            <div className="space-y-3">
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Заместитель начальника ЭО - <span className="text-orange-500">Matvey_Winchester</span>
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Заместитель начальника ЦдУД - <span className="text-orange-500">Aleksander_Shumov</span>
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Заместитель начальника ПТО - <span className="text-orange-500">Roman_Manarskiy</span>
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border-l-4 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
            style={{ borderLeftColor: getTieColor() }}
          >
            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              * ЦдУД - Центральная дирекция Управлением Движения
              <br />* ПТО - Производственно-технический отдел
              <br />* ЭО - Экзаменационный отдел
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DutiesSection({ getTieColor, theme, userRole }: any) {
  const showPTO = !userRole || userRole === "ПТО"
  const showCdUD = !userRole || userRole === "ЦдУД"
  const showSenior = !userRole || userRole === "Старший Состав"
  const showDeputy = !userRole || userRole === "Заместитель"
  const showLeadership = !userRole || userRole === "Руководство"

  return (
    <div id="duties" className="space-y-6 scroll-mt-6">
      {" "}
      {/* Added id and scroll-mt-6 */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <Briefcase className="w-6 h-6" style={{ color: getTieColor() }} />
        <h2 className="text-2xl font-bold" style={{ color: getTieColor() }}>
          Раздел II. Основные обязанности сотрудников
        </h2>
      </div>
      <div className="space-y-6">
        {/* ПТО Department (Ranks 1-2) */}
        {showPTO && (
          <div className="space-y-4">
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: getTieColor() + "20", borderLeft: `4px solid ${getTieColor()}` }}
            >
              <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                ПТО - Производственно-технический отдел (1-2 ранг)
              </h3>
            </div>

            {/* Rank 1 */}
            <Card
              className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
            >
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div
                    className="px-3 py-1 rounded-lg"
                    style={{ backgroundColor: getTieColor() + "20", color: getTieColor() }}
                  >
                    <span className="font-bold">1 ранг</span>
                  </div>
                  <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Слесарь-электрик
                  </h3>
                </div>
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/50" : "text-gray-500"}`}>
                  Необходимый игровой уровень: 2
                </p>
                <div
                  className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Основная обязанность:
                  </p>
                  <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Ремонт и техобслуживание подвижного состава в депо. Маркеры для починки могут находиться в депо
                    города Мирный или в депо города Невский. Добираться до меток нужно самостоятельно на ЗИЛе или
                    поезде. Для передвижения на поезде сотруднику следует обратится в кассу вокзала за бесплатным
                    билетом. Строго запрещено (расценивается прогулом) добираться до места назначения на ином виде
                    транспорта за исключением служебного ТС.
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Дополнительная обязанность:
                  </p>
                  <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Может быть назначен сигналистом в ремонтную бригаду. Обязанности - произвести расстановку переносных
                    сигналов на месте проведения работ, по приказу начальника бригады подавать сигналы с помощью
                    специальных флагов.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rank 2 */}
            <Card
              className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
            >
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div
                    className="px-3 py-1 rounded-lg"
                    style={{ backgroundColor: getTieColor() + "20", color: getTieColor() }}
                  >
                    <span className="font-bold">2 ранг</span>
                  </div>
                  <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Монтер пути
                  </h3>
                </div>
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/50" : "text-gray-500"}`}>
                  Необходимый игровой уровень: 3
                </p>
                <div
                  className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Основная обязанность:
                  </p>
                  <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Ремонт железнодорожных путей. Если у него есть водительское удостоверение категории C, то он может
                    взять на парковке у здания РЖД специальный транспорт - служебный ЗИЛ, который позволит быстро и
                    комфортно добираться до места работы. Кроме того, использование специального транспорта позволит ему
                    находиться в паре с другим сотрудником второго ранга. Важно отметить, что использование других видов
                    транспорта (за исключением служебного ТС) для передвижения к месту работы не допускается и будет
                    расценено как прогул.
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Дополнительная обязанность:
                  </p>
                  <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Может быть назначен сигналистом или монтёром пути в ремонтную бригаду.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ЦдУД Department (Ranks 3-5) */}
        {showCdUD && (
          <div className="space-y-4">
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: getTieColor() + "20", borderLeft: `4px solid ${getTieColor()}` }}
            >
              <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                ЦдУД - Центральная дирекция Управлением Движения (3-5 ранг)
              </h3>
            </div>

            {/* Rank 3 */}
            <Card
              className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
            >
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div
                    className="px-3 py-1 rounded-lg"
                    style={{ backgroundColor: getTieColor() + "20", color: getTieColor() }}
                  >
                    <span className="font-bold">3 ранг</span>
                  </div>
                  <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Помощник машиниста
                  </h3>
                </div>
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/50" : "text-gray-500"}`}>
                  Необходимый игровой уровень: 4
                </p>
                <div
                  className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Основная обязанность:
                  </p>
                  <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Прохождение обучения на машиниста. Обучение включает в себя изучение регламента переговоров,
                    практика в качества помощника машиниста в паре с машинистом. Во время практики все доклады в рацию
                    отправляет помощник.
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Дополнительная обязанность:
                  </p>
                  <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Может быть назначен сигналистом в ремонтную бригаду.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rank 4 */}
            <Card
              className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
            >
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div
                    className="px-3 py-1 rounded-lg"
                    style={{ backgroundColor: getTieColor() + "20", color: getTieColor() }}
                  >
                    <span className="font-bold">4 ранг</span>
                  </div>
                  <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Машинист
                  </h3>
                </div>
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/50" : "text-gray-500"}`}>
                  Необходимый игровой уровень: 4
                </p>
                <div
                  className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Основная обязанность:
                  </p>
                  <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Управление подвижным составом, перевозка пассажиров. Чтобы приступить к работе, на рабочем посту
                    должен находиться хотя бы один диспетчер. Машинист занимает водительское место в любом из свободных
                    подвижных составов, которые находятся в железнодорожном депо за зданием РЖД, включает свет в салоне
                    [К] и прожектор [L], делает запрос диспетру [/cr] для разрешения отправления, дожидается разрешения
                    на данную процедуру и только потом начинает движение по маршруту. В случае отсутствия поездного
                    диспетчера, машинист может следовать автономно, с соблюдением всех правил. Машинист обязан следить
                    за сообщениями от диспетчера для возможных сообщений об экстренных остановках. В случае пропуска
                    остановки, машинист обязан немедленно доложить об этом диспетчеру, а также остановиться и
                    отправиться по расписанию. Строго запрещён возврат на станцию задним ходом!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rank 5 */}
            <Card
              className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
            >
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div
                    className="px-3 py-1 rounded-lg"
                    style={{ backgroundColor: getTieColor() + "20", color: getTieColor() }}
                  >
                    <span className="font-bold">5 ранг</span>
                  </div>
                  <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Поездной диспетчер
                  </h3>
                </div>
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/50" : "text-gray-500"}`}>
                  Необходимый игровой уровень: 5
                </p>
                <div
                  className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Основная обязанность:
                  </p>
                  <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Контроль за движением поездов. До того, как разрешить отправку подвижного состава, необходимо
                    убедиться, что составы движутся в разных направлениях. Например, если готовы к выезду два поезда, то
                    один из них должен отправляться в сторону вокзала г. Мирный, а другой - в сторону г. Приволжск. Если
                    машинист пропустил станцию, диспетчер обязан контролировать остановку поезда и дальнейшее
                    отправление по расписанию. Таким образом, диспетчер должен тщательно следить за движением поездов и
                    принимать меры для их правильной организации.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Senior Staff (Ranks 6-7) */}
        {showSenior && (
          <div className="space-y-4">
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: getTieColor() + "20", borderLeft: `4px solid ${getTieColor()}` }}
            >
              <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                Старший состав (6-7 ранг)
              </h3>
            </div>

            <Card
              className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
            >
              <CardContent className="pt-6 space-y-4">
                <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Старший состав включает заместителей начальников отделов (6 ранг) и начальников отделов (7 ранг).
                  Основные обязанности включают управление отделами, контроль работы сотрудников, проведение обучения и
                  аттестации, координацию работы между отделами.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Deputy (Rank 8) */}
        {showDeputy && (
          <div className="space-y-4">
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: getTieColor() + "20", borderLeft: `4px solid ${getTieColor()}` }}
            >
              <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                Заместитель (8 ранг)
              </h3>
            </div>

            <Card
              className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
            >
              <CardContent className="pt-6 space-y-4">
                <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Заместители начальника депо отвечают за различные направления работы организации: кадровую работу,
                  эксплуатацию, общее управление. Координируют работу всех отделов, принимают стратегические решения,
                  представляют организацию во внешних взаимодействиях.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leadership (Rank 9) */}
        {showLeadership && (
          <div className="space-y-4">
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: getTieColor() + "20", borderLeft: `4px solid ${getTieColor()}` }}
            >
              <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                Руководство (9 ранг)
              </h3>
            </div>

            <Card
              className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
            >
              <CardContent className="pt-6 space-y-4">
                <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Высшее руководство организации: Генеральный директор и Заместитель Генерального Директора, Начальник
                  депо. Определяют стратегию развития организации, принимают ключевые решения, представляют организацию
                  на высшем уровне, координируют работу всех подразделений.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function VehiclesSection({ getTieColor, theme, userRole }: any) {
  const canSeePatriot =
    !userRole || userRole === "Старший Состав" || userRole === "Заместитель" || userRole === "Руководство"
  const canSeePAZ =
    !userRole || userRole === "Старший Состав" || userRole === "Заместитель" || userRole === "Руководство"

  return (
    <div id="vehicles" className="space-y-6 scroll-mt-6">
      {" "}
      {/* Added id and scroll-mt-6 */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <Train className="w-6 h-6" style={{ color: getTieColor() }} />
        <h2 className="text-2xl font-bold" style={{ color: getTieColor() }}>
          Раздел III. Служебный транспорт
        </h2>
      </div>
      <div className="space-y-4">
        {/* ZIL-131 */}
        <Card
          className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
        >
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <div
                  className="rounded-xl overflow-hidden border-2"
                  style={{ borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                >
                  <Image
                    src="/images/design-mode/zil.png"
                    alt="ЗИЛ-131"
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="md:w-1/2 space-y-4">
                <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  ЗИЛ-131
                </h3>
                <div
                  className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Основные технические характеристики:
                  </p>
                  <ul className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    <li>- Разгон до максимальной скорости - 10,7 сек.</li>
                    <li>- Макс. скорость - 81 км/ч.</li>
                    <li>- Вместительность - 2 места.</li>
                    <li>- В автопарке - 2 единицы.</li>
                  </ul>
                </div>
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Строго с соблюдением целей и правил использования.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UAZ-3309 */}
        <Card
          className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
        >
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <div
                  className="rounded-xl overflow-hidden border-2"
                  style={{ borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                >
                  <Image
                    src="/images/design-mode/buh.png"
                    alt='УАЗ-3309 "Буханка"'
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="md:w-1/2 space-y-4">
                <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  УАЗ-3309 "Буханка"
                </h3>
                <div
                  className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Основные технические характеристики:
                  </p>
                  <ul className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    <li>- Разгон до максимальной скорости - 16,81 сек.</li>
                    <li>- Макс. скорость - 129 км/ч.</li>
                    <li>- Вместительность - 4 места.</li>
                    <li>- В автопарке - 2 единицы.</li>
                  </ul>
                </div>
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  Строго с соблюдением целей и правил использования.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UAZ-3163 */}
        {canSeePatriot && (
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <div
                    className="rounded-xl overflow-hidden border-2"
                    style={{ borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                  >
                    <Image
                      src="/images/design-mode/patr.png"
                      alt='УАЗ-3163 "Патриот"'
                      width={1200}
                      height={800}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div className="md:w-1/2 space-y-4">
                  <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    УАЗ-3163 "Патриот"
                  </h3>
                  <div
                    className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                  >
                    <p className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                      Основные технические характеристики:
                    </p>
                    <ul className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      <li>- Разгон до максимальной скорости - 15,18 сек.</li>
                      <li>- Макс. скорость - 150 км/ч.</li>
                      <li>- Вместительность - 4 места.</li>
                      <li>- В автопарке - 1 единица.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PAZ */}
        {canSeePAZ && (
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <div
                    className="rounded-xl overflow-hidden border-2"
                    style={{ borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                  >
                    <Image
                      src="/images/design-mode/paz.png"
                      alt='ПАЗ-320405-04 "Вектор Next"'
                      width={1200}
                      height={800}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div className="md:w-1/2 space-y-4">
                  <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    ПАЗ-320405-04 "Вектор Next"
                  </h3>
                  <div
                    className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                  >
                    <p className={`font-semibold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                      Основные технические характеристики:
                    </p>
                    <ul className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      <li>- Разгон до максимальной скорости - 16,96 сек.</li>
                      <li>- Макс. скорость - 133 км/ч.</li>
                      <li>- Вместительность - 24 места.</li>
                      <li>- В автопарке - 1 единица.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function RollingStockSection({ getTieColor, theme }: any) {
  return (
    <div id="rolling-stock" className="space-y-6 scroll-mt-6">
      {" "}
      {/* Added id and scroll-mt-6 */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <Train className="w-6 h-6" style={{ color: getTieColor() }} />
        <h2 className="text-2xl font-bold" style={{ color: getTieColor() }}>
          Раздел IV. Единицы подвижного состава
        </h2>
      </div>
      <div className="space-y-6">
        {/* Locomotive Fleet */}
        <div className="space-y-4">
          <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
            Локомотивное хозяйство:
          </h3>

          {/* TEP70BS */}
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <div
                    className="rounded-xl overflow-hidden border-2"
                    style={{ borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                  >
                    <Image
                      src="/images/design-mode/tep.png"
                      alt="Тепловоз ТЭП70БС"
                      width={1200}
                      height={800}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div className="md:w-1/2 space-y-4">
                  <h4 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Тепловоз ТЭП70БС
                  </h4>
                  <div
                    className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                  >
                    <ul className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      <li>- Конструкционная скорость - 120 км/ч</li>
                      <li>- Мощность по дизелю - 4000 л.с.</li>
                      <li>- Габарит по ГОСТ 923883 - 1Т</li>
                      <li>- Осевая формула - 3о-3о.</li>
                      <li>- Служебная масса - 135 т.</li>
                      <li>- Сила тяги длительного режима - 17 тс.</li>
                      <li>- Тип электрической передачи - переменно-постоянного тока.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EP1 */}
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <div
                    className="rounded-xl overflow-hidden border-2"
                    style={{ borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                  >
                    <Image
                      src="/images/design-mode/ep.png"
                      alt="Электровоз ЭП1"
                      width={1200}
                      height={800}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div className="md:w-1/2 space-y-4">
                  <h4 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Электровоз ЭП1
                  </h4>
                  <div
                    className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                  >
                    <ul className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      <li>- Конструкционная скорость - 140 км/ч</li>
                      <li>- Мощность - 4700 л.с.</li>
                      <li>- Габарит по ГОСТ 923883 - 1Т</li>
                      <li>- Осевая формула - 20-20-20.</li>
                      <li>- Служебная масса - 132 т.</li>
                      <li>- Сила тяги длительного режима - 21,4 тс.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LV */}
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <div
                    className="rounded-xl overflow-hidden border-2"
                    style={{ borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                  >
                    <Image
                      src="/images/design-mode/lv.png"
                      alt="Паровоз ЛВ"
                      width={1200}
                      height={800}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div className="md:w-1/2 space-y-4">
                  <h4 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Паровоз ЛВ
                  </h4>
                  <div
                    className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                  >
                    <ul className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      <li>- Конструкционная скорость - 80 км/ч</li>
                      <li>- Мощность - 2600 л.с.</li>
                      <li>- Габарит по ГОСТ 923883 - 1Т</li>
                      <li>- Осевая формула - 1-5-1.</li>
                      <li>- Служебная масса - 121,5 т.</li>
                      <li>- Сила тяги длительного режима - 21,8 тс.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wagon Fleet */}
        <div className="space-y-4">
          <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
            Вагонное хозяйство:
          </h3>

          {/* Platzkart */}
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <div
                    className="rounded-xl overflow-hidden border-2"
                    style={{ borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                  >
                    <Image
                      src="/images/design-mode/plaz.png"
                      alt="Плацкартный вагон модели 61-4516"
                      width={1200}
                      height={800}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div className="md:w-1/2 space-y-4">
                  <h4 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Плацкартный вагон модели 61-4516
                  </h4>
                  <div
                    className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                  >
                    <ul className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      <li>- Конструкционная скорость - 160 км/ч</li>
                      <li>- Масса тары - 56,9 т.</li>
                      <li>- Количество пассажирских мест - 54 спальных места</li>
                      <li>- Количество мест для проводников - 2 спальных места</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coupe */}
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <div
                    className="rounded-xl overflow-hidden border-2"
                    style={{ borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                  >
                    <Image
                      src="/images/design-mode/kupe.png"
                      alt="Купейный вагон модели 61-4529"
                      width={1200}
                      height={800}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div className="md:w-1/2 space-y-4">
                  <h4 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Купейный вагон модели 61-4529
                  </h4>
                  <div
                    className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                  >
                    <ul className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      <li>- Конструкционная скорость - 160 км/ч</li>
                      <li>- Масса тары - 64,1 т.</li>
                      <li>- Количество пассажирских мест - 36 спальных места</li>
                      <li>- Количество мест для проводников - 1 спальное место</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seated */}
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <div
                    className="rounded-xl overflow-hidden border-2"
                    style={{ borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                  >
                    <Image
                      src="/images/design-mode/sid.png"
                      alt="Сидячий вагон модели 61-4458"
                      width={1200}
                      height={800}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div className="md:w-1/2 space-y-4">
                  <h4 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Сидячий вагон модели 61-4458
                  </h4>
                  <div
                    className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                  >
                    <ul className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                      <li>- Конструкционная скорость - 160 км/ч</li>
                      <li>- Масса тары - 56,8 т.</li>
                      <li>- Количество пассажирских мест - 60 сидячих мест</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TagsSection({ getTieColor, theme, userRole }: any) {
  const showRanks = (ranks: number[]) => {
    if (!userRole) return true

    if (userRole === "ПТО") return ranks.some((r) => r >= 1 && r <= 2)
    if (userRole === "ЦдУД") return ranks.some((r) => r >= 3 && r <= 5)
    if (userRole === "Старший Состав") return ranks.some((r) => r >= 6 && r <= 7)
    if (userRole === "Заместитель") return ranks.includes(8)
    if (userRole === "Руководство") return ranks.includes(9)

    return true
  }

  return (
    <div id="tags" className="space-y-6 scroll-mt-6">
      {" "}
      {/* Added id and scroll-mt-6 */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <Shield className="w-6 h-6" style={{ color: getTieColor() }} />
        <h2 className="text-2xl font-bold" style={{ color: getTieColor() }}>
          Раздел V. ТЕГи и звания сотрудников
        </h2>
      </div>
      <Card
        className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
      >
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            {showRanks([1]) && (
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>1 ранг:</p>
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  [ТЧР] Слесарь-электрик (1)
                </p>
              </div>
            )}

            {showRanks([2]) && (
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>2 ранг:</p>
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  [ПЧ] Монтёр пути (2)
                </p>
              </div>
            )}

            {showRanks([3]) && (
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>3 ранг:</p>
                <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  [ТЧМП] Помощник машиниста (3)
                </p>
              </div>
            )}

            {showRanks([4]) && (
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>4 ранг:</p>
                <div className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  <p>[ТЧМ] Машинист</p>
                  <p>[ТЧМ-3КМ] Машинист третьего класса</p>
                  <p>[ТЧМ-2КМ] Машинист второго класса</p>
                  <p>[ТЧМ-1КМ] Машинист первого класса</p>
                </div>
              </div>
            )}

            {showRanks([5]) && (
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>5 ранг:</p>
                <div className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  <p>[ДНЦ-О] Оператор при поездном диспетчере</p>
                  <p>[ДНЦ] Поездной диспетчер</p>
                  <p>[ДНЦ-С] Старший поездной диспетчер</p>
                </div>
              </div>
            )}

            {showRanks([6]) && (
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>6 ранг:</p>
                <div className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  <p>[ТЧМИ] Машинист-инструктор</p>
                  <p>[ТЧМИ] Заместитель Начальника Экзаменационного Отдела (Зам.Нач.ЭО)</p>
                  <p>[ТЧМИ] Заместитель Начальника Производственно-Технического Отдела (Зам.Нач.ПТО)</p>
                  <p>[ТЧМИ] Заместитель Начальника Центральной дирекции Управлением Движения (Зам.Нач.ЦдУД)</p>
                </div>
              </div>
            )}

            {showRanks([7]) && (
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>7 ранг:</p>
                <div className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  <p>[ДГП] Дорожный диспетчер</p>
                  <p>[ЦКАДР] Начальник Экзаменационного Отдела (Нач.ЭО)</p>
                  <p>[ДГПт] Начальник Производственно-Технического Отдела (Нач.ПТО)</p>
                  <p>[ДГПд] Начальник Центральной дирекции Управлением Движения</p>
                </div>
              </div>
            )}

            {showRanks([8]) && (
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>8 ранг:</p>
                <div className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  <p>[ТЧЗ] Заместитель начальника депо</p>
                  <p>[ТЧЗэ] Заместитель начальника депо по эксплуатации</p>
                  <p>[ТЧЗк] Заместитель начальника депо по кадровой работе</p>
                  <p>[ТЧЗ-1] Первый заместитель начальника депо</p>
                </div>
              </div>
            )}

            {showRanks([9]) && (
              <div
                className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>9 ранг:</p>
                <div className={`text-sm space-y-1 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                  <p>[ТЧ] Начальник депо</p>
                  <p>[Ц] Генеральный директор</p>
                  <p>[Ц] Заместитель Генерального Директора</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DutyLocationsSection({ getTieColor, theme }: any) {
  return (
    <div id="duty-locations" className="space-y-6 scroll-mt-6">
      {" "}
      {/* Added id and scroll-mt-6 */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <MapPin className="w-6 h-6" style={{ color: getTieColor() }} />
        <h2 className="text-2xl font-bold" style={{ color: getTieColor() }}>
          Раздел VI. Список переездов и станций для дежурств
        </h2>
      </div>
      <Card
        className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
      >
        <CardContent className="pt-6">
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Детальная информация о дежурстве на переездах и станциях доступна в соответствующем разделе.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function CommandsSection({ getTieColor, theme, userRole }: any) {
  const showSeniorCommands =
    !userRole || userRole === "Старший Состав" || userRole === "Заместитель" || userRole === "Руководство"

  return (
    <div id="commands" className="space-y-6 scroll-mt-6">
      {" "}
      {/* Added id and scroll-mt-6 */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <Radio className="w-6 h-6" style={{ color: getTieColor() }} />
        <h2 className="text-2xl font-bold" style={{ color: getTieColor() }}>
          Раздел VII. Основные команды для работы
        </h2>
      </div>
      <div className="space-y-4">
        <Card
          className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
        >
          <CardContent className="pt-6 space-y-4">
            <h3 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Команды рации:
            </h3>
            <div
              className={`p-4 rounded-xl border font-mono text-sm ${theme.mode === "dark" ? "bg-white/5 border-white/10 text-white/70" : "bg-gray-50 border-gray-200 text-gray-600"}`}
            >
              <p>/r [текст] - IC рация фракции. (с 1 ранга)</p>
              <p>/rb [текст] - OOC (NonRP) рация фракции. (с 1 ранга)</p>
              <p>/db [текст] - OOC (NonRP) общая рация всех фракций. (с 6 ранга)</p>
              <p>/d [текст] - IC общая рация всех фракций. (с 6 ранга)</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
        >
          <CardContent className="pt-6 space-y-4">
            <h3 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Команды РЖД:
            </h3>
            <div
              className={`p-4 rounded-xl border font-mono text-sm ${theme.mode === "dark" ? "bg-white/5 border-white/10 text-white/70" : "bg-gray-50 border-gray-200 text-gray-600"}`}
            >
              <p>/trainstop [№ состава] - остановка поезда. (с 5 ранга)</p>
              <p>/cr [текст] - Команда машиниста. (с 3 ранга)</p>
              <p>/tr [№ состава] [текст] - Команда диспетчера. (с 5 ранга)</p>
              <p>/restrain [№ состава] - Респавн состава. (с 5 ранга)</p>
              <p>/find - Список сотрудников онлайн. (с 1 ранга)</p>
            </div>
          </CardContent>
        </Card>

        {showSeniorCommands && (
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardContent className="pt-6 space-y-4">
              <h3 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                Команды для старшего состава:
              </h3>
              <div
                className={`p-4 rounded-xl border font-mono text-sm ${theme.mode === "dark" ? "bg-white/5 border-white/10 text-white/70" : "bg-gray-50 border-gray-200 text-gray-600"}`}
              >
                <p>/giverank [ID] [ранг] - Изменить ранг. (с 6 ранга)</p>
                <p>/invite [ID] - Пригласить во фракцию. (с 8 ранга)</p>
                <p>/uninvite [ID] - Уволить. (с 7 ранга)</p>
                <p>/tlic [ID] - Выдать права машиниста. (с 8 ранга)</p>
                <p>/taketlic [ID] - Изъять права. (с 8 ранга)</p>
                <p>/showdisp - Чат диспетчера. (с 7 ранга)</p>
                <p>Панель "Ю" - Управление. (с 6 ранга)</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function IdCardSection({ getTieColor, theme }: any) {
  return (
    <div id="id-card" className="space-y-6 scroll-mt-6">
      {" "}
      {/* Added id and scroll-mt-6 */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <FileText className="w-6 h-6" style={{ color: getTieColor() }} />
        <h2 className="text-2xl font-bold" style={{ color: getTieColor() }}>
          Раздел VIII. Удостоверение сотрудников
        </h2>
      </div>
      <Card
        className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
      >
        <CardContent className="pt-6 space-y-4">
          <p className={`${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Каждый сотрудник РЖД обязан иметь бинд на удостоверение с действительными данными. В случае
            повышения/понижения необходимо своевременно изменять удостоверение:
          </p>
          <div
            className={`p-4 rounded-xl border font-mono text-sm ${theme.mode === "dark" ? "bg-white/5 border-white/10 text-white/70" : "bg-gray-50 border-gray-200 text-gray-600"}`}
          >
            <p>bind "кнопка1" say Здравствуйте, *Должность*, *Ф.И.О*.</p>
            <p>bind "кнопка1" do Удостоверение в нагрудном кармане.</p>
            <p>bind "кнопка2" me достал удостоверение из нагрудного кармана и развернул его</p>
            <p>bind "кнопка2" chatbox ud</p>
            <p>bind "кнопка3" me закрыл удостоверение и убрал его в карман</p>
            <p>bind "кнопка3" do Удостоверение в нагрудном кармане.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ScheduleSection({ getTieColor, theme }: any) {
  return (
    <div id="schedule" className="space-y-6 scroll-mt-6">
      {" "}
      {/* Added id and scroll-mt-6 */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <Calendar className="w-6 h-6" style={{ color: getTieColor() }} />
        <h2 className="text-2xl font-bold" style={{ color: getTieColor() }}>
          Раздел IX. График работы организации
        </h2>
      </div>
      <Card
        className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
      >
        <CardContent className="pt-6 space-y-4">
          <div
            className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
          >
            <h3 className={`font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              С понедельника по пятницу:
            </h3>
            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              Начало и конец смены — с 9:00 до 21:00.
            </p>
            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              Перерыв на обед — с 12:00 до 13:00.
            </p>
            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              Перерыв на ужин — с 16:00 до 17:00.
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
          >
            <h3 className={`font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              С субботы по воскресенье:
            </h3>
            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              Начало и конец смены — с 11:00 до 19:00.
            </p>
            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              Перерыв на обед — с 12:00 до 13:00.
            </p>
            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              Перерыв на ужин — с 16:00 до 17:00.
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
          >
            <h3 className={`font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              В праздничные дни:
            </h3>
            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              Начало и конец смены — с 12:00 до 18:00.
            </p>
            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              Перерыв на обед — с 15:00 до 16:00.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function OfficesSection({ getTieColor, theme }: any) {
  return (
    <div id="offices" className="space-y-6 scroll-mt-6">
      {" "}
      {/* Added id and scroll-mt-6 */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <Building className="w-6 h-6" style={{ color: getTieColor() }} />
        <h2 className="text-2xl font-bold" style={{ color: getTieColor() }}>
          Раздел X. Распределение кабинетов, комната отдыха сотрудников
        </h2>
      </div>
      <div className="space-y-6">
        {/* Office Layout */}
        <Card
          className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
        >
          <CardContent className="pt-6 space-y-4">
            <h3 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Распределение кабинетов
            </h3>
            <div
              className="rounded-xl overflow-hidden border-2"
              style={{ borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
            >
              <Image
                src="/images/design-mode/kabinet.png"
                alt="Распределение кабинетов"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rest Room */}
        <Card
          className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
        >
          <CardContent className="pt-6 space-y-4">
            <h3 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Комната отдыха сотрудников
            </h3>
            <div
              className="rounded-xl overflow-hidden border-2"
              style={{ borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
            >
              <Image
                src="/images/design-mode/komnata.png"
                alt="Комната отдыха"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>
            <div
              className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
            >
              <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                - Отдыхать (находиться в АФК), согласно пункту 4.38 ПСГО, разрешено до 15 минут строго в комнате отдыха.
              </p>
              <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                - Вне комнаты отдыха AFK разрешено в течение 5 минут
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RoleplaySection({ getTieColor, theme }: any) {
  return (
    <div id="roleplay" className="space-y-6 scroll-mt-6">
      {" "}
      {/* Added id and scroll-mt-6 */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <Wrench className="w-6 h-6" style={{ color: getTieColor() }} />
        <h2 className="text-2xl font-bold" style={{ color: getTieColor() }}>
          Раздел XI. Role Play действия при отсутствии основной рабочей обстановки
        </h2>
      </div>
      <Card
        className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
      >
        <CardContent className="pt-6 space-y-4">
          <p className={`${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Основой внутренней работой на железной дороге является управление составом для машиниста локомотива,
            контроль движения подвижных составов для поездных диспетчеров. Основной целью данной системы является
            избавление отсутствия работы от сотрудников при любых обстоятельствах.
          </p>

          <h3 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
            Примеры обязательных Role Play действий:
          </h3>
          <div
            className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
          >
            <ul className={`text-sm space-y-2 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              <li>
                - Техническая проверка техники в офисе (ПК, телевизор, часы колонки в актовом зале, освещение и т.д.);
              </li>
              <li>
                - Прибраться в зале совещаний (подвинуть стульчики, помыть доски, проверить кондиционеры, заменить
                бутылки на столе и т.д.);
              </li>
              <li>
                - Вне здания проверить рабочую технику на парковке, в них же проверить инструменты на работоспособность;
              </li>
              <li>- В актовом зале проверить акустику, подправить шторки, стульчики;</li>
              <li>- Дополнительно ко всем кабинетам: помыть полы, вытереть пыль, вынести мусор из корзинок;</li>
              <li>- Осмотреть визуально депо, найти какую-либо возможную проблему;</li>
              <li>- Отправиться в депо г. Приволжск, провести осмотр стоячих поездов;</li>
              <li>- Отправиться в депо г. Невский, провести осмотр стоячей техники и поездов.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RetroTrainSection({ getTieColor, theme }: any) {
  return (
    <div id="retro-train" className="space-y-6 scroll-mt-6">
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <Train className="w-6 h-6" style={{ color: getTieColor() }} />
        <h2 className="text-2xl font-bold" style={{ color: getTieColor() }}>
          Ретропоезд «Провинция»
        </h2>
      </div>

      {/* Общие правила */}
      <Card
        className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
      >
        <CardContent className="pt-6 space-y-4">
          <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
            Общие правила проведения рейсов на ретропоезде
          </h3>
          <div
            className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
          >
            <ul className={`text-sm space-y-2 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              <li>• Рейсы на ретро-поезде проводятся строго в составе полной поездной бригады</li>
              <li>• Номер рейса на ретро-поезде в расписании №901 и №903</li>
              <li>• Следует только в направлении Мирный-Приволжск</li>
              <li>• Ретро-поезд состоит из Паровоза ЛВ-0182, вагона с углём и 2 пассажирских сидячих вагонов</li>
              <li>• Стоянка на станциях по 3 минуты</li>
              <li>• Должен соблюдаться скоростной регламент и расписание ретро-поездов</li>
              <li>• Рейсы на ретро-поезде выполняются только в выходные</li>
              <li>• Проводить рейс на ретро-поезде можно только с разрешения руководящего состава</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Подвижной состав */}
      <div className="space-y-4">
        <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
          Подвижной состав ретропоезда
        </h3>

        {/* Паровоз ЛВ-0182 */}
        <Card
          className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
        >
          <CardContent className="pt-6 space-y-4">
            <h4 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Паровоз ЛВ-0182
            </h4>
            <div
              className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
            >
              <p
                className={`text-sm leading-relaxed mb-3 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}
              >
                В 1945 году конструктор Лев Лебедянский создал шедевр паровозостроения — магистральный паровоз серии
                «Л». Это был настоящий прорыв: при весе всего 92 тонны машина развивала мощность 2200 л. с. и скорость
                до 80 км/ч.
              </p>
              <p
                className={`text-sm leading-relaxed mb-3 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}
              >
                Самой ценной наградой для изобретателя стало то, что паровозу присвоили серию с первой буквой его
                фамилии. Железнодорожники до сих пор с теплотой называют эту машину «Лебедянка».
              </p>
              <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                На основе этого паровоза позже создали ещё более совершенную модель серии «ЛВ» — один из лучших
                советских паровозов, который и сегодня можно встретить на железных дорогах Провинции.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Вагон 061 30117 */}
        <Card
          className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
        >
          <CardContent className="pt-6 space-y-4">
            <h4 className={`text-lg font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Вагон модели 061 30117
            </h4>
            <div
              className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
            >
              <p
                className={`text-sm leading-relaxed mb-3 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}
              >
                Сидячий вагон 061 30117 — это пассажирский вагон, предназначенный для перевозки пассажиров на короткие и
                средние расстояния.
              </p>
              <p
                className={`text-sm leading-relaxed mb-3 ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}
              >
                Его конструкция обеспечивает комфортное размещение пассажиров благодаря компактному расположению мест.
                Кресла в вагоне оборудованы подлокотниками и имеют возможность регулировки наклона спинки, что делает
                поездку более удобной. Также в вагоне предусмотрены откидные столики и полки для багажа, что особенно
                удобно для коротких поездок.
              </p>
              <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                В настоящее время данный вагон используется на маршруте Ретропоезда «Провинция».
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Поездная бригада */}
      <Card
        className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
      >
        <CardContent className="pt-6 space-y-4">
          <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
            Поездная бригада
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className={`text-lg font-semibold mb-3 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                Обязательный состав:
              </h4>
              <div className="space-y-2">
                <div
                  className={`p-3 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Машинист поезда
                  </p>
                  <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Доступно с должности Машинист 1-го класса (Возможны исключения)
                  </p>
                  <p className={`text-sm mt-1 ${theme.mode === "dark" ? "text-white/60" : "text-gray-500"}`}>
                    Обязанности: Управлять паровозом обеспечивая безопасную и комфортную поездку для пассажиров
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Помощник машиниста поезда
                  </p>
                  <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Доступно с должности Помощник Машиниста
                  </p>
                  <p className={`text-sm mt-1 ${theme.mode === "dark" ? "text-white/60" : "text-gray-500"}`}>
                    Обязанности: Помогать машинисту обеспечивая безопасное управление локомотивом
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Проводник и экскурсовод 1-го вагона
                  </p>
                  <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Доступно только с должности Помощник Машиниста (Возможны исключения)
                  </p>
                  <p className={`text-sm mt-1 ${theme.mode === "dark" ? "text-white/60" : "text-gray-500"}`}>
                    Обязанности: Вежливо общаться с пассажирами, рассказывать нужную экскурсию во время поездки
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Начальник поезда
                  </p>
                  <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Доступно только Старшему Составу и Лидеру
                  </p>
                  <p className={`text-sm mt-1 ${theme.mode === "dark" ? "text-white/60" : "text-gray-500"}`}>
                    Обязанности: Следить за всей поездной бригадой. Следить за безопасностью и комфортностью перевозок
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className={`text-lg font-semibold mb-3 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                Дополнительный состав:
              </h4>
              <div className="space-y-2">
                <div
                  className={`p-3 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Производственно-Технический Состав
                  </p>
                  <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Доступно с должности Слесарь-электрик
                  </p>
                  <p className={`text-sm mt-1 ${theme.mode === "dark" ? "text-white/60" : "text-gray-500"}`}>
                    Обязанности: Осматривать состав на станциях на наличие тех. неисправностей
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Проводник и экскурсовод 2-го вагона
                  </p>
                  <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Доступно только с должности Помощник Машиниста (Возможны исключения)
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className={`font-semibold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    Поездной диспетчер
                  </p>
                  <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    Доступно только с должности Оператор при ДНЦ (Возможны исключения)
                  </p>
                  <p className={`text-sm mt-1 ${theme.mode === "dark" ? "text-white/60" : "text-gray-500"}`}>
                    Обязанности: Сопровождать поезд во время следования
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Скоростной регламент и расписание */}
      <Card
        className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
      >
        <CardContent className="pt-6 space-y-4">
          <h3 className={`text-xl font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
            Расписание движения ретропоезда
          </h3>
          <div
            className={`p-4 rounded-xl border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
          >
            <p className={`font-semibold mb-3 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
              Маршрут: Мирный - Приволжск | Ретропоезд «Провинция»
            </p>
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                <thead>
                  <tr className={`border-b ${theme.mode === "dark" ? "border-white/10" : "border-gray-200"}`}>
                    <th className="text-left py-2 px-3">№</th>
                    <th className="text-left py-2 px-3">Депо</th>
                    <th className="text-left py-2 px-3">Мирный</th>
                    <th className="text-left py-2 px-3">Невский</th>
                    <th className="text-left py-2 px-3">Приволжск</th>
                    <th className="text-left py-2 px-3">Депо</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b ${theme.mode === "dark" ? "border-white/10" : "border-gray-200"}`}>
                    <td className="py-2 px-3 font-semibold">901</td>
                    <td className="py-2 px-3">
                      <div>Отпр: 18:00</div>
                      <div>Приб: 18:02</div>
                    </td>
                    <td className="py-2 px-3">
                      <div>Отпр: 18:05</div>
                      <div>Приб: 18:13</div>
                    </td>
                    <td className="py-2 px-3">
                      <div>Отпр: 18:16</div>
                      <div>Приб: 18:22</div>
                    </td>
                    <td className="py-2 px-3">
                      <div>Отпр: 18:25</div>
                      <div>Приб: 18:30</div>
                    </td>
                    <td className="py-2 px-3">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">903</td>
                    <td className="py-2 px-3">
                      <div>Отпр: 19:00</div>
                      <div>Приб: 19:02</div>
                    </td>
                    <td className="py-2 px-3">
                      <div>Отпр: 19:05</div>
                      <div>Приб: 19:13</div>
                    </td>
                    <td className="py-2 px-3">
                      <div>Отпр: 19:16</div>
                      <div>Приб: 19:22</div>
                    </td>
                    <td className="py-2 px-3">
                      <div>Отпр: 19:25</div>
                      <div>Приб: 19:30</div>
                    </td>
                    <td className="py-2 px-3">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

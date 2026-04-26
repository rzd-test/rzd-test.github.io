"use client"

import { CardContent } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ExternalLink,
  Dumbbell,
  Briefcase,
  Settings,
  LinkIcon,
  Layers,
  Info,
  Clock,
  Train,
  FileBarChart,
  Radio,
  AlertTriangle,
  BookOpenText,
  Calendar,
  GraduationCap,
  FileCheck,
  Users,
  Globe,
} from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import type { UserRole } from "@/data/users"
import {
  canAccessEducationalContent,
  canAccessOrders,
  canAccessGovWave,
  canAccessReportCompiler,
  canAccessInterviews,
  canAccessGoogleSheets,
  canAccessManagement,
} from "@/data/users"
import { getThemeColor } from "@/lib/theme-utils"

interface ContentsSectionProps {
  onSectionChange: (section: string) => void
  userRole: UserRole
}

export function ContentsSection({ onSectionChange, userRole }: ContentsSectionProps) {
  const { theme } = useTheme()

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const allSections = [
    {
      id: "information",
      icon: Info,
      title: "Информация",
      description: "Справочная информация по рангам, должностям и структуре РЖД.",
      canAccess: true, // Available to all roles
    },
    {
      id: "lectures",
      icon: BookOpenText,
      title: "Лекции",
      description: "Обучающие материалы для сотрудников РЖД. Включает основные и дополнительные лекции.",
      canAccess: canAccessEducationalContent(userRole),
    },
    {
      id: "training",
      icon: Dumbbell,
      title: "Тренировки",
      description: "Физические упражнения и программы для поддержания формы сотрудников.",
      canAccess: canAccessEducationalContent(userRole),
    },
    {
      id: "events",
      icon: Calendar,
      title: "Мероприятия",
      description: "Корпоративные мероприятия и события для сотрудников РЖД.",
      canAccess: canAccessEducationalContent(userRole),
    },
    {
      id: "exams",
      icon: GraduationCap,
      title: "Экзамены",
      description: "Теоретические и практические экзамены для проверки знаний.",
      canAccess: canAccessEducationalContent(userRole),
    },
    {
      id: "interviews",
      icon: Briefcase,
      title: "Собеседования",
      description: "Материалы для проведения собеседований с кандидатами.",
      canAccess: canAccessInterviews(userRole),
    },
    {
      id: "duty",
      icon: Clock,
      title: "Дежурство",
      description: "Информация о дежурствах на станциях и переездах.",
      canAccess: true, // Available to all roles
    },
    {
      id: "reports-section",
      icon: Radio,
      title: "Доклады в рацию",
      description: "Полный справочник докладов и команд для радиосвязи.",
      canAccess: true, // Available to all roles
    },
    {
      id: "report-generation",
      icon: FileBarChart,
      title: "Генерация отчётов",
      description: "Создание отчётов для различных подразделений РЖД.",
      canAccess: true, // Available to all roles
    },
    {
      id: "orders",
      icon: FileCheck,
      title: "Приказы",
      description: "Шаблоны приказов по дисциплине, увольнению, приёму и другим вопросам.",
      canAccess: canAccessOrders(userRole),
    },
    {
      id: "gov-wave",
      icon: Radio,
      title: "Гос Волна",
      description: "Шаблоны объявлений для государственной волны на разных этапах.",
      canAccess: canAccessGovWave(userRole),
    },
    {
      id: "report-compiler",
      icon: Settings,
      title: "Составитель докладов",
      description: "Инструмент для автоматического создания докладов о рейсах.",
      canAccess: canAccessReportCompiler(userRole),
    },
    {
      id: "retro-train",
      icon: Train,
      title: "Ретропоезд",
      description: "Информация о ретропоезде и его маршрутах.",
      canAccess: true, // Available to all roles
    },
    {
      id: "rzd-website",
      icon: Globe,
      title: "Новости РЖД",
      description: "Все самые важные новости фракции РЖД",
      canAccess: true,
    },
    {
      id: "admin",
      icon: Users,
      title: "Управление",
      description: "Управление правами доступа и учётными записями сотрудников.",
      canAccess: canAccessManagement(userRole),
    },
  ]

  const sections = allSections.filter((section) => section.canAccess)

  return (
    <div className="space-y-6 opacity-95">
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <div
          className="p-3 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${getTieColor()}20, ${getTieColor()}10)`,
          }}
        >
          <Layers className="w-6 h-6" style={{ color: getTieColor() }} />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
            Содержание
          </h2>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Обзор всех разделов и материалов
          </p>
        </div>
        <div className={`text-sm italic ${theme.mode === "dark" ? "text-white/50" : "text-gray-500"}`}>
          By Egor_Washington
        </div>
      </div>

      <Card
        className={`rounded-2xl overflow-hidden border-2 leading-[0rem] ${
          theme.mode === "dark" ? "bg-red-950/30 border-red-500/30" : "bg-red-50 border-red-300"
        }`}
      >
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-red-200" : "text-red-900"}`}>
                <strong>(!!!)</strong> - Официальный ресурс государственной фракции. За слив любой информации из данного
                ресурса в руки лиц, кроме сотрудников данной фракции или администрации 6 сервера, игрок и администратор
                может быть наказан согласно ОЧС 0.1.16
              </p>
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
            <LinkIcon className="w-5 h-5" />
            Полезные ссылки
          </h3>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              asChild
              size="lg"
              className="text-white font-semibold h-12 shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: getTieColor() }}
            >
              <a href="https://status-journal.com/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-5 w-5 mr-2" />
                Журнал Активности
              </a>
            </Button>
            {canAccessGoogleSheets(userRole) && (
              <Button
                asChild
                size="lg"
                className="text-white font-semibold h-12 shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: getTieColor() }}
              >
                <a
                  href="https://docs.google.com/spreadsheets/d/1CnTpA7Xj7T5Tsofw_oq9S9FldU_AnOd_oiGMLPigEEg/edit?gid=0#gid=0"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Гугл Таблица
                </a>
              </Button>
            )}
            {canAccessGovWave(userRole) && (
              <Button
                asChild
                size="lg"
                className="text-white font-semibold h-12 shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: getTieColor() }}
              >
                <a href="https://province.status-journal.com/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Гос Волна
                </a>
              </Button>
            )}
            <Button
              asChild
              size="lg"
              className="text-white font-semibold h-12 shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: getTieColor() }}
            >
              <a
                href="https://forum.gtaprovince.ru/forum/630-respublikanskie-zheleznye-dorogi/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Форум
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              className="text-white font-semibold h-12 shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: getTieColor() }}
            >
              <a href="https://vk.com/club177767683" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-5 w-5 mr-2" />
                Закрытая группа
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`group p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:shadow-lg ${
                theme.mode === "dark"
                  ? "bg-[#0f1419]/30 border-white/10 hover:bg-[#0f1419]/50 hover:border-white/20"
                  : "bg-white/30 border-gray-200 hover:bg-white/50 hover:border-gray-300"
              }`}
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: getTieColor(),
              }}
            >
              <div className="flex flex-col gap-4">
                <div
                  className="p-3 rounded-xl transition-all duration-200 group-hover:scale-110 self-start"
                  style={{ backgroundColor: getTieColor() + "20" }}
                >
                  <Icon className="w-6 h-6" style={{ color: getTieColor() }} />
                </div>
                <div>
                  <h3 className={`text-lg font-bold mb-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    {section.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    {section.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

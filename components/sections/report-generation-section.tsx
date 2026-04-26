"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  Upload,
  Trash2,
  FileIcon,
  Copy,
  Check,
  X,
  ExternalLink,
  Info,
  CheckCircle2,
  Circle,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/contexts/theme-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
  getWeeklyNormForPosition,
  getPromotionRequirementsForPosition,
  getReprimandCriteriaForPosition,
  getReprimandPointsRequired,
  getRoleFromPosition,
  type Position,
} from "@/data/positions"
import { getAllUsers } from "@/data/users"
import { getThemeColor } from "@/lib/theme-utils" // Import centralized utility

type ReportType = "weekly" | "pto" | "cdud" | "warning" | "leader"

const ACTIVITY_TYPES = [
  "Лекция",
  "Лекция про объекты железной дороги",
  "Мероприятие",
  "Выездное мероприятие",
  "Межфракционное мероприятие",
  "Мероприятие по тех. осмотру поездов",
  "Тренировка",
  "Автономный рейс",
  "Рейс с диспетчером",
  "Сопровождение рейса",
  "Экзамен",
  "Открытое собеседование",
  "Маркеры",
  "Дежурство на станции",
  "Дежурство на переезде",
  "РП уборка",
  "Тех. осмотр поезда",
] as const

interface WorkEntry {
  id: string
  title: string
  activityType: string
  folderUrl: string | string[] // Can be single URL or array of URLs
  uploadDate: string
  filesCount: number
}

interface GlobalWorkEntry extends WorkEntry {
  userNickname: string
  userPosition: string
}

interface ReportData {
  fullName: string
  fullNameGenitive: string
  position: string
  dateFrom: string
  dateTo: string
  onlineHours: string
  onlineMinutes: string
  workEntries: WorkEntry[]
}

interface PTOReportData {
  fullName: string
  fullNameGenitive: string
  position: string
  dateFrom: string
  dateTo: string
  workEntries: WorkEntry[]
}

interface CDUDReportData {
  fullName: string
  fullNameGenitive: string
  position: string
  dateFrom: string
  dateTo: string
  workEntries: WorkEntry[]
}

interface WarningReportData {
  fullName: string
  fullNameGenitive: string
  position: string
  signature: string // Added signature field, removed reason field
  workEntries: WorkEntry[]
}

interface LeaderReportData {
  dateFrom: string
  dateTo: string
  interviewLinks: string[]
  firedPSJ: string
  firedocs: string
  totalFired: string
  totalHired: string
  firstRanks: string
  middleStaff: string
  seniorStaff: string
  managementStaff: string
  totalStaff: string
  callsCount: string
  seniorHired: string
  staffChanges: string
  warnings: string
  penaltyReceived: string
  penaltyPaid: string
  penaltyBalance: string
  lectures: Array<{ name: string; link: string }>
  branchEvents: Array<{ name: string; link: string }>
  interFactionEvents: Array<{ name: string; link: string }>
  staffEvaluations: StaffEvaluation[]
  ptoWorkEntries: WorkEntry[]
  cdudWorkEntries: WorkEntry[]
  globalWeeklyEntries: GlobalWorkEntry[]
}

interface StaffEvaluation {
  nickname: string
  role: string
  evaluation: string
}

interface ActivityCount {
  activity: string
  count: number
  points: number
  maxPerWeek?: number
}

// Placeholder for point values, assuming this data will be fetched or defined elsewhere
// For now, define a sample structure. In a real app, this might come from a config file or API.
const pointValues = [
  { activity: "Лекция", points: 2, maxPerWeek: 5 },
  { activity: "RP-мероприятие", points: 4, maxPerWeek: 10 },
  { activity: "Индивидуальное собеседование", points: 10 },
  { activity: "Открытое собеседование", points: 20, maxPerWeek: 10 }, // Example of multiple points for one activity
  { activity: "Помощь в проведении открытого собеседования", points: 10 },
  { activity: "Межфракционное мероприятие", points: 20 },
  { activity: "Глобальное мероприятие", points: 50 },
  { activity: "Подготовленное мероприятие", points: 30 },
  { activity: "Написание текста в новостную группу", points: 10 },
  { activity: "Сопровождение рейса (ДНЦ)", points: 5 },
  { activity: "Выполнение рейса (ТЧМ)", points: 5 },
  { activity: "Проведение экзамена", points: 10 },
  { activity: "Мероприятие по Тех. Осмотру поездов", points: 15 }, // Added as an example
  // Add other activities and their point values as needed
]

// Helper function to get points for an activity type
const getPointsForActivity = (activityType: string): number => {
  const normalizedActivityType = activityType.toLowerCase()
  for (const pv of pointValues) {
    if (normalizedActivityType.includes(pv.activity.toLowerCase())) {
      // For activities with multiple point values (like open interviews), consider the base points.
      // The logic for calculating additional points (e.g., for hires) would need more specific handling.
      return pv.points
    }
  }
  return 0
}

const positionToGenitive = (position: string): string => {
  const genitiveMap: { [key: string]: string } = {
    "Первый Заместитель Начальника Депо": "Первого Заместителя Начальника Депо",
    "Заместитель Начальника Депо по кадровой работе": "Заместителя Начальника Депо по кадровой работе",
    "Заместитель Начальника Депо по эксплуатации": "Заместителя Начальника Депо по эксплуатации",
    "Начальник ЦдУД": "Начальника ЦдУД",
    "Начальник ПТО": "Начальника ПТО",
    "Начальник ЭО": "Начальника ЭО",
    "Заместитель Начальника ЦдУД": "Заместителя Начальника ЦдУД",
    "Заместитель Начальника ПТО": "Заместителя Начальника ПТО",
    "Заместитель Начальника ЭО": "Заместителя Начальника ЭО",
  }
  return genitiveMap[position] || position
}

// Helper function to extract relevant activity types from a requirement string
const getActivityTypesFromRequirement = (requirement: string): string[] => {
  const normalizedReq = requirement.toLowerCase().trim()
  const possibleMatches: string[] = []

  const activityMappings: { [key: string]: string[] } = {
    "лекция про объекты железной дороги": ["лекция про объекты железной дороги"],
    "лекции про объекты железной дороги": ["лекция про объекты железной дороги"],
    "межфракционное мероприятие": ["межфракционное мероприятие"],
    "выездное мероприятие": ["выездное мероприятие", "выездные мероприятия"],
    "мероприятие для сотрудников": ["мероприятие для сотрудников"],
    "мероприятие по тех. осмотру": ["мероприятие по тех. осмотру поездов"],
    лекция: ["лекция"],
    тренировка: ["тренировка"],
    "автономный рейс": ["автономный рейс"],
    "рейс с диспетчером": ["рейс с диспетчером"],
    "поездной рейс": ["поездной рейс"],
    экзамен: ["экзамен"],
    собеседование: ["собеседование", "открытое собеседование", "индивидуальное собеседование"],
    "маркер/метка": ["маркеры", "метки"],
    "отстоять на станции": ["отстоять на станции", "отстоять на переезде"],
    "сопроводить рейс": ["сопровождение рейса"],
    "рп уборка": ["рп уборка"],
    мероприятие: ["мероприятие", "общее мероприятие"],
  }

  // Prioritize more specific matches first (railway lectures before general lectures)
  const sortedMappings = Object.entries(activityMappings).sort((a, b) => b[0].length - a[0].length)

  for (const [key, types] of sortedMappings) {
    if (normalizedReq.includes(key)) {
      possibleMatches.push(...types)
      // If we found a specific match, don't look for more general ones
      if (key.includes("лекция про объекты")) {
        return [...new Set(possibleMatches)].map((t) => t.trim())
      }
    }
  }

  // Fallback to broader checks if specific matches aren't found
  if (possibleMatches.length === 0) {
    if (normalizedReq.includes("объект") && normalizedReq.includes("железн")) {
      possibleMatches.push("лекция про объекты железной дороги")
    } else if (normalizedReq.includes("межфракционн")) {
      possibleMatches.push("межфракционное мероприятие")
    } else if (normalizedReq.includes("выездн")) {
      possibleMatches.push("выездное мероприятие")
    } else if (normalizedReq.includes("лекци")) {
      possibleMatches.push("лекция")
    } else if (normalizedReq.includes("тренировк")) {
      possibleMatches.push("тренировка")
    } else if (normalizedReq.includes("собрани")) {
      possibleMatches.push("присутствие на еженедельном собрании")
    } else if (normalizedReq.includes("экзамен")) {
      possibleMatches.push("экзамен")
    } else if (normalizedReq.includes("собеседовани")) {
      possibleMatches.push("собеседование")
    } else if (normalizedReq.includes("автономн")) {
      possibleMatches.push("автономный рейс")
    } else if (normalizedReq.includes("диспетчер")) {
      possibleMatches.push("рейс с диспетчером")
    } else if (normalizedReq.includes("поездн")) {
      possibleMatches.push("поездной рейс")
    } else if (normalizedReq.includes("отстоя")) {
      possibleMatches.push("отстоять на станции/переезде")
    } else if (normalizedReq.includes("сопровод")) {
      possibleMatches.push("сопровождение рейса")
    } else if (normalizedReq.includes("уборк")) {
      possibleMatches.push("рп уборка")
    } else if (normalizedReq.includes("маркер") || normalizedReq.includes("метк")) {
      possibleMatches.push("маркеры")
    } else if (normalizedReq.includes("мероприяти")) {
      possibleMatches.push("мероприятие")
    }
  }

  return [...new Set(possibleMatches)].map((t) => t.trim())
}

// Helper function to extract number from a requirement string
const extractNumberFromRequirement = (requirement: string): number => {
  // Try to find any number in the requirement text
  // Handles formats like: "5", "5-ти", "пять", etc.
  const matches = requirement.match(/(\d+)/g)
  if (matches && matches.length > 0) {
    // If there are multiple numbers, take the first one (usually the count)
    return Number.parseInt(matches[0])
  }

  // Fallback: try to find written numbers (один, два, три, etc.)
  const writtenNumbers: { [key: string]: number } = {
    один: 1,
    одн: 1,
    два: 2,
    двух: 2,
    две: 2,
    три: 3,
    трёх: 3,
    трех: 3,
    четыре: 4,
    четырёх: 4,
    четырех: 4,
    пять: 5,
    пяти: 5,
    шесть: 6,
    шести: 6,
    семь: 7,
    семи: 7,
    восемь: 8,
    восьми: 8,
    девять: 9,
    девяти: 9,
    десять: 10,
    десяти: 10,
  }

  const normalizedReq = requirement.toLowerCase()
  for (const [word, num] of Object.entries(writtenNumbers)) {
    if (normalizedReq.includes(word)) {
      return num
    }
  }

  return 1 // Default to 1 if no number found
}

const getActivityTypeFromRequirement = (requirement: string): string => {
  const req = requirement.toLowerCase()

  // Map requirements to activity types based on keywords
  if (req.includes("экзамен") || req.includes("тэул") || req.includes("пэул")) {
    return "Экзамен"
  }
  if (req.includes("рейс") || req.includes("поездн")) {
    return "Рейс с диспетчером"
  }
  if (req.includes("лекци")) {
    // Special handling for railway object lectures
    if (req.includes("объект") && req.includes("железн")) {
      return "Лекция про объекты железной дороги"
    }
    return "Лекция"
  }
  if (req.includes("отстоять") || req.includes("станци") || req.includes("переезд")) {
    return "Дежурство на станции"
  }
  if (req.includes("дежурств")) {
    return "Дежурство на станции"
  }
  if (req.includes("отработать") || req.includes("тех. осмотр")) {
    return "Тех. осмотр поезда"
  }
  if (req.includes("мероприят")) {
    return "Мероприятие"
  }

  // Default fallback
  return "Экзамен"
}

const getRequirementsForReportType = (type: "pto" | "cdud"): string[] | null => {
  const position = localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser")!).position : ""
  if (!position) return null

  switch (type) {
    case "pto":
      const ptoReqs = getPromotionRequirementsForPosition(position as Position)
      return ptoReqs ? ptoReqs.requirements : null
    case "cdud":
      const cdudReqs = getPromotionRequirementsForPosition(position as Position)
      return cdudReqs ? cdudReqs.requirements : null
    default:
      return null
  }
}

// Mock user profile data, assuming it's fetched elsewhere or statically defined
// In a real application, this would likely come from a context or API call.
const userProfile = {
  signature: "Иванов И.И.", // Example signature
  // Other profile properties if needed
}

export function ReportGenerationSection() {
  const { toast } = useToast()
  const { theme } = useTheme()

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const [reportType, setReportType] = useState<ReportType>("weekly")

  const [initialReportTypeSet, setInitialReportTypeSet] = useState(false)

  const [isDragging, setIsDragging] = useState(false)
  const [reportData, setReportData] = useState<ReportData>({
    fullName: "",
    fullNameGenitive: "",
    position: "",
    dateFrom: "",
    dateTo: "",
    onlineHours: "",
    onlineMinutes: "",
    workEntries: [],
  })

  const [ptoReportData, setPTOReportData] = useState<PTOReportData>({
    fullName: "",
    fullNameGenitive: "",
    position: "",
    dateFrom: "",
    dateTo: "",
    workEntries: [],
  })

  const [cdudReportData, setCDUDReportData] = useState<CDUDReportData>({
    fullName: "",
    fullNameGenitive: "",
    position: "",
    dateFrom: "",
    dateTo: "",
    workEntries: [],
  })

  const [warningReportData, setWarningReportData] = useState<WarningReportData>({
    fullName: "",
    fullNameGenitive: "",
    position: "",
    signature: "", // Initialized signature field instead of reason
    workEntries: [],
  })

  const [leaderReportData, setLeaderReportData] = useState<LeaderReportData>({
    dateFrom: "",
    dateTo: "",
    interviewLinks: [""],
    firedPSJ: "",
    firedocs: "",
    totalFired: "",
    totalHired: "",
    firstRanks: "",
    middleStaff: "",
    seniorStaff: "",
    managementStaff: "",
    totalStaff: "",
    callsCount: "",
    seniorHired: "",
    staffChanges: "",
    warnings: "",
    penaltyReceived: "",
    penaltyPaid: "",
    penaltyBalance: "",
    lectures: [{ name: "", link: "" }],
    branchEvents: [{ name: "", link: "" }],
    interFactionEvents: [{ name: "", link: "" }],
    staffEvaluations: [],
    ptoWorkEntries: [],
    cdudWorkEntries: [],
    globalWeeklyEntries: [],
  })

  const [showTitleDialog, setShowTitleDialog] = useState(false)
  const [showRequirementsDialog, setShowRequirementsDialog] = useState(false)

  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [entryTitle, setEntryTitle] = useState("")
  const [activityType, setActivityType] = useState("")
  const [customActivityType, setCustomActivityType] = useState("") // Added state for custom activity type
  const [nickname, setNickname] = useState("")
  const [currentUploadTarget, setCurrentUploadTarget] = useState<
    "weekly" | "pto" | "cdud" | "warning" | "leader-pto" | "leader-cdud" | "leader-manual"
  >("weekly")

  const [generatedReportText, setGeneratedReportText] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [currentUser, setCurrentUser] = useState<{ nickname?: string; position?: string } | null>(null)

  const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4 MB per file
  const MAX_BATCH_SIZE = 3.5 * 1024 * 1024 // 3.5 MB per batch

  // Helper function to load data from localStorage for specific report types
  const loadReportData = (key: string, setter: React.Dispatch<React.SetStateAction<any>>, preservePosition = false) => {
    const savedData = localStorage.getItem(key)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        // Basic handling for workEntries to ensure they have expected structure
        if (parsed.workEntries) {
          parsed.workEntries = parsed.workEntries.map((entry: any) => ({
            id: entry.id || Date.now().toString(), // Ensure ID exists
            title: entry.title || "",
            activityType: entry.activityType || "",
            folderUrl: entry.folderUrl || "",
            uploadDate: entry.uploadDate || new Date().toLocaleDateString("ru-RU"),
            filesCount: entry.filesCount || 1,
          }))
        } else {
          parsed.workEntries = [] // Ensure workEntries is an array
        }

        if (preservePosition) {
          delete parsed.position
        }

        setter((prev: any) => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error(`Failed to load saved ${key} data:`, error)
      }
    }
  }

  // Helper function to save data to localStorage
  const saveReportData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data))
  }

  // Load initial user data and set default dates
  useEffect(() => {
    const loadCurrentUser = () => {
      const savedUser = localStorage.getItem("currentUser")
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        const userPosition = parsedUser.position || ""
        console.log("[v0] Loaded user position:", userPosition)

        setCurrentUser({
          nickname: parsedUser.nickname,
          position: userPosition,
        })

        if (!initialReportTypeSet && userPosition) {
          const role = getRoleFromPosition(userPosition as Position)
          let defaultReportType: ReportType = "weekly"

          switch (role) {
            case "Руководство":
              defaultReportType = "leader"
              break
            case "ПТО":
              defaultReportType = "pto"
              break
            case "ЦдУД":
              defaultReportType = "cdud"
              break
            case "Старший Состав":
            case "Заместитель":
              defaultReportType = "weekly"
              break
            default:
              defaultReportType = "weekly"
          }

          console.log("[v0] Setting default report type:", defaultReportType, "for role:", role)
          setReportType(defaultReportType)
          setInitialReportTypeSet(true)
        }

        setReportData((prev) => {
          console.log("[v0] Previous reportData position:", prev.position)
          const newData = { ...prev, position: userPosition }
          console.log("[v0] New reportData position:", newData.position)
          return newData
        })
        setPTOReportData((prev) => ({ ...prev, position: userPosition }))
        setCDUDReportData((prev) => ({ ...prev, position: userPosition }))
        setWarningReportData((prev) => ({ ...prev, position: userPosition }))
        setLeaderReportData((prev) => ({ ...prev, position: userPosition }))
      }
    }

    loadCurrentUser()

    // Load saved report data for each type, preserving position from user profile
    const loadWeeklyReports = () => loadReportData("reportData", setReportData, true)
    const loadPTOReports = () => loadReportData("ptoReportData", setPTOReportData, true)
    const loadCDUDReports = () => loadReportData("cdudReportData", setCDUDReportData, true)
    const loadWarningReports = () => loadReportData("warningReportData", setWarningReportData, true)
    const loadLeaderReports = () => loadReportData("leaderReportData", setLeaderReportData, true)

    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(today)
    monday.setDate(today.getDate() - diff)

    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    const defaultDateFrom = formatDate(monday)
    const defaultDateTo = formatDate(today)

    // Set default dates if no saved data exists
    if (!localStorage.getItem("reportData")) {
      setReportData((prev) => ({
        ...prev,
        dateFrom: defaultDateFrom,
        dateTo: defaultDateTo,
      }))
    }
    if (!localStorage.getItem("ptoReportData")) {
      setPTOReportData((prev) => ({ ...prev, dateFrom: defaultDateFrom, dateTo: defaultDateTo }))
    }
    if (!localStorage.getItem("cdudReportData")) {
      setCDUDReportData((prev) => ({ ...prev, dateFrom: defaultDateFrom, dateTo: defaultDateTo }))
    }
    if (!localStorage.getItem("warningReportData")) {
      setWarningReportData((prev) => ({ ...prev, dateFrom: defaultDateFrom, dateTo: defaultDateTo }))
    }
    if (!localStorage.getItem("leaderReportData")) {
      setLeaderReportData((prev) => ({ ...prev, dateFrom: defaultDateFrom, dateTo: defaultDateTo }))
    }

    loadWeeklyReports()
    loadPTOReports()
    loadCDUDReports()
    loadWarningReports()
    loadLeaderReports()

    // Load global weekly reports specifically for the leader report
    if (reportType === "leader") {
      const globalReports = localStorage.getItem("globalWeeklyReports")
      if (globalReports) {
        try {
          const parsed = JSON.parse(globalReports)
          setLeaderReportData((prev) => ({
            ...prev,
            globalWeeklyEntries: parsed || [],
          }))
          console.log("[v0] Loaded global weekly reports:", parsed?.length || 0, "entries")
        } catch (error) {
          console.error("Failed to load global weekly reports:", error)
        }
      }
    }
  }, [reportType]) // Re-run effect if reportType changes to load leader-specific data

  // Save report data to localStorage whenever it changes
  useEffect(() => {
    saveReportData("reportData", reportData)
  }, [reportData])

  useEffect(() => {
    saveReportData("ptoReportData", ptoReportData)
  }, [ptoReportData])

  useEffect(() => {
    saveReportData("cdudReportData", cdudReportData)
  }, [cdudReportData])

  useEffect(() => {
    saveReportData("warningReportData", warningReportData)
  }, [warningReportData])

  useEffect(() => {
    saveReportData("leaderReportData", leaderReportData)
  }, [leaderReportData])

  const processFiles = (files: File[], target: typeof currentUploadTarget = currentUploadTarget) => {
    setPendingFiles(files)
    setEntryTitle("")
    setActivityType("")
    setCustomActivityType("") // Reset custom activity type
    setCurrentUploadTarget(target)
    setShowTitleDialog(true)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent, target: typeof currentUploadTarget = currentUploadTarget) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFiles(files, target)
    }
  }

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: typeof currentUploadTarget = currentUploadTarget,
  ) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(Array.from(files), target)
    }
    e.target.value = ""
  }

  const splitFilesIntoBatches = (files: File[]): File[][] => {
    const batches: File[][] = []
    let currentBatch: File[] = []
    let currentBatchSize = 0

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `Файл "${file.name}" слишком большой (${(file.size / 1024 / 1024).toFixed(2)} МБ). Максимальный размер файла: 4 МБ`,
        )
      }

      // If adding this file would exceed batch size, start a new batch
      if (currentBatchSize + file.size > MAX_BATCH_SIZE && currentBatch.length > 0) {
        batches.push(currentBatch)
        currentBatch = [file]
        currentBatchSize = file.size
      } else {
        currentBatch.push(file)
        currentBatchSize += file.size
      }
    }

    // Add the last batch if it has files
    if (currentBatch.length > 0) {
      batches.push(currentBatch)
    }

    return batches
  }

  const uploadToYandexDisk = async (files: File[]): Promise<string[]> => {
    setIsUploading(true)
    try {
      // Check individual file sizes and split into batches
      const batches = splitFilesIntoBatches(files)

      console.log("[v0] Split files into batches", {
        totalFiles: files.length,
        batchCount: batches.length,
        batchSizes: batches.map((batch) => ({
          files: batch.length,
          size: `${(batch.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} МБ`,
        })),
      })

      const uploadedUrls: string[] = []
      const userNickname = nickname || currentUser?.nickname || "Unknown"
      const finalActivityType = activityType === "Другое" ? customActivityType : activityType

      // Upload each batch separately
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        const formData = new FormData()

        // Add all files from this batch
        batch.forEach((file) => {
          formData.append("file", file)
        })

        // Add metadata with batch info
        const batchTitle = batches.length > 1 ? `${entryTitle} (часть ${i + 1}/${batches.length})` : entryTitle
        formData.append("nickname", userNickname)
        formData.append("activityType", finalActivityType)
        formData.append("title", batchTitle)

        console.log(`[v0] Uploading batch ${i + 1}/${batches.length}`, {
          filesCount: batch.length,
          fileNames: batch.map((f) => f.name),
          totalSize: `${(batch.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} МБ`,
        })

        const response = await fetch("/api/upload-to-yandex", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const contentType = response.headers.get("content-type")

          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json()
            console.error(`[v0] Batch ${i + 1} upload failed`, errorData)

            if (errorData.details) {
              throw new Error(`Ошибка загрузки части ${i + 1}: ${errorData.details}`)
            }
            throw new Error(errorData.error || `Не удалось загрузить часть ${i + 1}`)
          } else {
            const errorText = await response.text()
            console.error(`[v0] Batch ${i + 1} upload failed with non-JSON response`, {
              status: response.status,
              statusText: response.statusText,
              body: errorText.substring(0, 200),
            })

            if (response.status === 413) {
              throw new Error(`Часть ${i + 1} слишком большая для загрузки. Попробуйте загрузить меньше файлов за раз.`)
            }

            throw new Error(`Ошибка загрузки части ${i + 1} (${response.status}): ${response.statusText}`)
          }
        }

        const result = await response.json()

        console.log(`[v0] Batch ${i + 1} upload successful`, {
          url: result.url,
          filesUploaded: result.filesUploaded,
          totalFiles: result.totalFiles,
        })

        uploadedUrls.push(result.url)

        if (result.partialSuccess && result.failedFiles?.length > 0) {
          toast({
            title: `Частичная загрузка части ${i + 1}`,
            description: `Загружено ${result.filesUploaded} из ${result.totalFiles} файлов. Не удалось загрузить: ${result.failedFiles.join(", ")}`,
            variant: "default",
          })
        }
      }

      return uploadedUrls
    } catch (error) {
      console.error("[v0] Upload error", error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const addEntry = (files: File[], target: typeof currentUploadTarget = currentUploadTarget) => {
    const finalActivityType =
      activityType === "Другое" && customActivityType.trim() ? customActivityType.trim() : activityType

    const finalTitle = (target === "pto" || target === "cdud") && entryTitle ? entryTitle : entryTitle.trim()

    if (!finalTitle) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, укажите название работы или выбранное требование",
        variant: "destructive",
      })
      return
    }

    if (!finalActivityType && !(target === "pto" || target === "cdud")) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, укажите тип активности",
        variant: "destructive",
      })
      return
    }

    if (reportType === "warning" && target === "warning") {
      const position = currentUser?.position || ""
      const pointsRequired = getReprimandPointsRequired(position as Position)

      if (pointsRequired) {
        const pointValue = pointValues.find((pv) => finalActivityType.toLowerCase().includes(pv.activity.toLowerCase()))

        if (pointValue?.maxPerWeek) {
          const currentCount = warningReportData.workEntries.filter((e) => e.activityType === finalActivityType).length

          if (currentCount >= pointValue.maxPerWeek) {
            toast({
              title: "Превышен лимит",
              description: `Максимальное количество "${finalActivityType}" в неделю: ${pointValue.maxPerWeek}`,
              variant: "destructive",
            })
            return
          }
        }
      }
    }

    console.log("[v0] Starting upload process", {
      target: target,
      title: finalTitle,
      activityType: finalActivityType,
      filesCount: files.length,
    })

    uploadToYandexDisk(files)
      .then((folderUrls) => {
        const newEntry: WorkEntry = {
          id: `${Date.now()}`,
          title: finalTitle, // No more "(часть 1/2)" suffix
          activityType: finalActivityType,
          folderUrl: folderUrls.length === 1 ? folderUrls[0] : folderUrls, // Single URL or array
          uploadDate: new Date().toLocaleDateString("ru-RU"),
          filesCount: files.length,
        }

        console.log("[v0] Created new entry", newEntry)

        switch (target) {
          case "weekly":
            setReportData((prev) => {
              const updated = {
                ...prev,
                workEntries: [...prev.workEntries, newEntry],
              }
              console.log("[v0] Updated weekly report data", updated.workEntries.length, "entries")
              return updated
            })

            // Add to global reports
            const existingGlobalReports = localStorage.getItem("globalWeeklyReports")
            const globalReports: GlobalWorkEntry[] = existingGlobalReports ? JSON.parse(existingGlobalReports) : []

            const globalEntry: GlobalWorkEntry = {
              ...newEntry,
              userNickname: currentUser?.nickname || nickname || "Unknown",
              userPosition: reportData.position || "Не указана",
            }
            globalReports.push(globalEntry)

            localStorage.setItem("globalWeeklyReports", JSON.stringify(globalReports))
            console.log("[v0] Saved to global weekly reports, total:", globalReports.length)
            break
          case "pto":
            setPTOReportData((prev) => {
              const updated = {
                ...prev,
                workEntries: [...prev.workEntries, newEntry],
              }
              console.log("[v0] Updated PTO report data", updated.workEntries.length, "entries")
              return updated
            })
            break
          case "cdud":
            setCDUDReportData((prev) => {
              const updated = {
                ...prev,
                workEntries: [...prev.workEntries, newEntry],
              }
              console.log("[v0] Updated CDUD report data", updated.workEntries.length, "entries")
              return updated
            })
            break
          case "warning":
            setWarningReportData((prev) => {
              const updated = {
                ...prev,
                workEntries: [...prev.workEntries, newEntry],
              }
              console.log("[v0] Updated warning report data", updated.workEntries.length, "entries")
              return updated
            })
            break
          case "leader-manual":
            setLeaderReportData((prev) => ({
              ...prev,
              lectures: [
                ...prev.lectures,
                ...folderUrls.map((url, index) => ({
                  name: folderUrls.length > 1 ? `${entryTitle} (часть ${index + 1})` : entryTitle,
                  link: url,
                })),
              ],
            }))
            break
          case "leader-pto":
            setLeaderReportData((prev) => ({
              ...prev,
              ptoWorkEntries: [...prev.ptoWorkEntries, newEntry],
            }))
            break
          case "leader-cdud":
            setLeaderReportData((prev) => ({
              ...prev,
              cdudWorkEntries: [...prev.cdudWorkEntries, newEntry],
            }))
            break
        }

        const batchMessage = folderUrls.length > 1 ? ` в ${folderUrls.length} альбома(ов)` : ""
        toast({
          title: "Успешно",
          description: `Загружено ${files.length} файл(ов)${batchMessage}`,
        })

        setShowTitleDialog(false)
        setPendingFiles([])
        setEntryTitle("")
        setActivityType("")
        setCustomActivityType("")
        setNickname("")
      })
      .catch((error) => {
        console.error("[v0] Upload error", error)
        const errorMessage = error instanceof Error ? error.message : "Не удалось загрузить файлы"
        toast({
          title: "Ошибка",
          description: errorMessage,
          variant: "destructive",
        })
      })
  }

  const removeEntry = (entryId: string, target: typeof currentUploadTarget = "weekly") => {
    switch (target) {
      case "weekly":
        setReportData((prev) => ({
          ...prev,
          workEntries: prev.workEntries.filter((entry) => entry.id !== entryId),
        }))

        const existingGlobalReports = localStorage.getItem("globalWeeklyReports")
        if (existingGlobalReports) {
          const globalReports: GlobalWorkEntry[] = JSON.parse(existingGlobalReports)
          const updatedGlobalReports = globalReports.filter((entry) => entry.id !== entryId)
          localStorage.setItem("globalWeeklyReports", JSON.stringify(updatedGlobalReports))
          console.log("[v0] Removed from global weekly reports")
        }
        break
      case "pto":
        setPTOReportData((prev) => ({
          ...prev,
          workEntries: prev.workEntries.filter((entry) => entry.id !== entryId),
        }))
        break
      case "cdud":
        setCDUDReportData((prev) => ({
          ...prev,
          workEntries: prev.workEntries.filter((entry) => entry.id !== entryId),
        }))
        break
      case "warning":
        setWarningReportData((prev) => ({
          ...prev,
          workEntries: prev.workEntries.filter((entry) => entry.id !== entryId),
        }))
        break
      case "leader-manual":
        setLeaderReportData((prev) => ({
          ...prev,
          lectures: prev.lectures.filter((_, i) => prev.lectures[i].name !== entryId), // Assuming entryId is the name here
        }))
        break
      case "leader-pto":
        setLeaderReportData((prev) => ({
          ...prev,
          ptoWorkEntries: prev.ptoWorkEntries.filter((entry) => entry.id !== entryId),
        }))
        break
      case "leader-cdud":
        setLeaderReportData((prev) => ({
          ...prev,
          cdudWorkEntries: prev.cdudWorkEntries.filter((entry) => entry.id !== entryId),
        }))
        break
    }

    toast({
      title: "Удалено",
      description: "Запись удалена из отчёта",
    })
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return ""
    const [year, month, day] = dateString.split("-")
    return `${day}.${month}.${year}`
  }

  const formatFolderUrls = (folderUrl: string | string[]): string => {
    if (typeof folderUrl === "string") {
      return folderUrl
    }
    return folderUrl.join("\n")
  }

  const generateWeeklyReport = (): string => {
    const position = reportData.position || currentUser?.position || ""
    console.log("[v0] Generating weekly report with position:", position)
    const positionGenitive = positionToGenitive(position)
    console.log("[v0] Position in genitive case:", positionGenitive)
    const today = new Date().toLocaleDateString("ru-RU")

    let report = `Начальнику депо\nОАО "РЖД" по Республике Провинция\nОт ${positionGenitive}, ${reportData.fullNameGenitive}\n\n`
    report += `Еженедельный отчёт.\n- Я, ${reportData.fullName}, находящийся в должности ${position}, прошу вас рассмотреть мой еженедельный отчёт за период с ${formatDate(reportData.dateFrom)} по ${formatDate(reportData.dateTo)}.\n\n`
    report += `Отчёт о проделанной работе.\n\n`

    reportData.workEntries.forEach((entry, index) => {
      report += `${index + 1}. ${entry.title} - ${formatFolderUrls(entry.folderUrl)}\n`
    })

    report += `\nВаша статистика онлайна за период:\n`
    report += `${formatDate(reportData.dateFrom)}-${formatDate(reportData.dateTo)} - ${reportData.onlineHours}ч. ${reportData.onlineMinutes}мин.\n\n`
    report += `${position}, ${reportData.fullName}\n\n`
    report += `Дата: ${today}`

    return report
  }

  const generatePTOReport = (): string => {
    const today = new Date().toLocaleDateString("ru-RU")

    let report = `Начальнику Производственно-технического отдела\nОАО "РЖД" по Республике Провинция\nот ${ptoReportData.fullNameGenitive}\n\n`
    report += `Отчёт о проделанной работе ПТО\n\n`
    report += `Я, ${ptoReportData.fullName}, находящийся в должности ${ptoReportData.position}, оставляю отчёт о проделанной работе для повышения в должности с ${formatDate(ptoReportData.dateFrom)} по ${formatDate(ptoReportData.dateTo)} и прикрепляю к отчёту следующие документы:\n\n`

    ptoReportData.workEntries.forEach((entry, index) => {
      report += `${index + 1}. ${entry.title} - «${formatFolderUrls(entry.folderUrl)}»\n`
    })

    report += `\nДата: ${today}\n`
    report += `Подпись: ${userProfile.signature || ""}`

    return report
  }

  const generateCDUDReport = (): string => {
    const today = new Date().toLocaleDateString("ru-RU")

    let report = `Начальнику Центральной дирекции Управления Движением\nОАО "РЖД" по Республике Провинция\nот ${cdudReportData.fullNameGenitive}\n\n`
    report += `Отчёт о проделанной работе ЦдУД\n\n`
    report += `Я, ${cdudReportData.fullName}, находящийся в должности ${cdudReportData.position}, оставляю отчёт о проделанной работе для повышения в должности с ${formatDate(cdudReportData.dateFrom)} по ${formatDate(cdudReportData.dateTo)} и прикрепляю к отчёту следующие документы:\n\n`

    cdudReportData.workEntries.forEach((entry, index) => {
      report += `${index + 1}. ${entry.title} - «${formatFolderUrls(entry.folderUrl)}»\n`
    })

    report += `\nДата: ${today}\n`
    report += `Подпись: ${userProfile.signature || ""}`

    return report
  }

  const generateWarningReport = (): string => {
    const today = new Date().toLocaleDateString("ru-RU")

    let report = `Начальнику депо\nОАО "РЖД" по Республике Провинция\nОт ${warningReportData.fullNameGenitive}\n\n`
    report += `Заявление\n\n`
    report += `Я, ${warningReportData.fullName}, находящийся в должности ${warningReportData.position}, прошу вас рассмотреть моё заявление на отработку дисциплинарного взыскания в виде выговора.\n\n`
    report += `Ниже прикладываю доказательства выполнения минимальный требований:\n\n`

    warningReportData.workEntries.forEach((entry, index) => {
      report += `${index + 1}. ${entry.title} - ${formatFolderUrls(entry.folderUrl)}\n`
    })

    report += `\nДата: ${today}\n`
    report += `Подпись: ${warningReportData.signature || ""}` // Use signature from form data

    return report
  }

  const generateLeaderReport = (): string => {
    let report = `ЛИДЕРСКИЙ ОТЧЁТ\n`
    report += `Период: ${formatDate(leaderReportData.dateFrom)} - ${formatDate(leaderReportData.dateTo)}\n\n`

    report += `1. ОТЧЁТНЫЙ ПЕРИОД\n`
    report += `С ${formatDate(leaderReportData.dateFrom)} по ${formatDate(leaderReportData.dateTo)}\n\n`

    report += `2. СОБЕСЕДОВАНИЯ\n`
    report += `Количество: ${leaderReportData.interviewLinks.filter((l) => l.trim()).length}\n`
    leaderReportData.interviewLinks
      .filter((l) => l.trim())
      .forEach((link, i) => {
        report += `${i + 1}. ${link}\n`
      })
    report += `\n`

    report += `3. СТАТИСТИКА УВОЛЬНЕНИЙ И ПРИЁМА\n`
    report += `Уволено ПСЖ: ${leaderReportData.firedPSJ}\n`
    report += `Уволено с ОЧС: ${leaderReportData.firedocs}\n`
    report += `Всего уволено: ${leaderReportData.totalFired}\n`
    report += `Всего принято: ${leaderReportData.totalHired}\n\n`

    report += `4. ТЕКУЩИЙ СОСТАВ ПО РАНГАМ\n`
    report += `Первые ранги: ${leaderReportData.firstRanks}\n`
    report += `Средний состав: ${leaderReportData.middleStaff}\n`
    report += `Старший состав: ${leaderReportData.seniorStaff}\n`
    report += `Руководящий состав: ${leaderReportData.managementStaff}\n`
    report += `Всего сотрудников: ${leaderReportData.totalStaff}\n\n`

    report += `5. ОБЗВОНЫ И ПРИЁМ В СТАРШИЙ СОСТАВ\n`
    report += `Обзвонов проведено: ${leaderReportData.callsCount}\n`
    report += `Принято в старший состав: ${leaderReportData.seniorHired}\n\n`

    report += `6. КАДРОВЫЕ ПЕРЕСТАНОВКИ\n`
    report += `${leaderReportData.staffChanges}\n\n`

    report += `7. ВЫДАННЫЕ ВЫГОВОРЫ\n`
    report += `${leaderReportData.warnings}\n\n`

    report += `8. ФОНД НЕУСТОЕК\n`
    report += `Получено: ${leaderReportData.penaltyReceived}\n`
    report += `Выплачено: ${leaderReportData.penaltyPaid}\n`
    report += `Остаток: ${leaderReportData.penaltyBalance}\n\n`

    report += `9. ЛЕКЦИИ, ТРЕНИРОВКИ, МЕРОПРИЯТИЯ\n`
    if (leaderReportData.ptoWorkEntries.length > 0) {
      report += `ПТО:\n`
      leaderReportData.ptoWorkEntries.forEach((entry, i) => {
        report += `${i + 1}. ${entry.title} - ${formatFolderUrls(entry.folderUrl)}\n`
      })
    }
    if (leaderReportData.cdudWorkEntries.length > 0) {
      report += `ЦдУД:\n`
      leaderReportData.cdudWorkEntries.forEach((entry, i) => {
        report += `${i + 1}. ${entry.title} - ${formatFolderUrls(entry.folderUrl)}\n`
      })
    }
    leaderReportData.lectures
      .filter((l) => l.name.trim())
      .forEach((lecture, i) => {
        report += `${i + 1}. ${lecture.name} - ${lecture.link}\n`
      })
    report += `\n`

    report += `10. МЕРОПРИЯТИЯ ОТ ФИЛИАЛОВ\n`
    leaderReportData.branchEvents
      .filter((e) => e.name.trim())
      .forEach((event, i) => {
        report += `${i + 1}. ${event.name} - ${event.link}\n`
      })
    report += `\n`

    report += `11. МЕЖФРАКЦИОННЫЕ МЕРОПРИЯТИЯ (С УЧАСТИЕМ ЛИДЕРА)\n`
    leaderReportData.interFactionEvents
      .filter((e) => e.name.trim())
      .forEach((event, i) => {
        report += `${i + 1}. ${event.name} - ${event.link}\n`
      })
    report += `\n`

    report += `12. ОЦЕНКА РАБОТЫ СТАРШЕГО СОСТАВА\n`
    leaderReportData.staffEvaluations
      .filter((s) => s.nickname.trim())
      .forEach((staff) => {
        report += `${staff.nickname} (${staff.role})\n`
        report += `Оценка: ${staff.evaluation}\n\n`
      })

    return report
  }

  const shouldShowReportType = (type: string): boolean => {
    const position = currentUser?.position || ""
    console.log("[v0] shouldShowReportType called for type:", type, "with position:", position)

    if (!position) {
      console.log("[v0] No position found, returning true")
      return true
    }

    const role = getRoleFromPosition(position as Position)
    console.log("[v0] Mapped role:", role, "for position:", position)

    if (role === "Руководство") {
      console.log("[v0] Руководство role - showing all report types")
      return true
    }

    switch (type) {
      case "weekly":
        // Show weekly report for Заместитель and Старший Состав roles
        const showWeekly = role === "Заместитель" || role === "Старший Состав"
        console.log("[v0] Show weekly report:", showWeekly)
        return showWeekly
      case "pto":
        // Show PTO report only for ПТО role
        const showPTO = role === "ПТО"
        console.log("[v0] Show PTO report:", showPTO)
        return showPTO
      case "cdud":
        // Show CDUD report only for ЦдУД role
        const showCDUD = role === "ЦдУД"
        console.log("[v0] Show CDUD report:", showCDUD)
        return showCDUD
      case "warning":
        // Show warning removal for all roles
        console.log("[v0] Show warning report: true")
        return true
      case "leader":
        // Leadership report is now accessible to all through the Руководство check above
        return false
      default:
        return true
    }
  }

  const getRequirementsForCurrentReport = (): string[] | null => {
    const position = currentUser?.position || ""
    console.log("[v0] Getting requirements for position:", position, "report type:", reportType)

    if (!position) return null

    switch (reportType) {
      case "weekly":
        const weeklyReqs = getWeeklyNormForPosition(position as Position)
        console.log("[v0] Weekly requirements:", weeklyReqs)
        return weeklyReqs
      case "pto":
      case "cdud":
        const promoReqs = getPromotionRequirementsForPosition(position as Position)
        console.log("[v0] Promotion requirements:", promoReqs)
        return promoReqs ? promoReqs.requirements : null
      case "warning":
        const warningReqs = getReprimandCriteriaForPosition(position as Position)
        console.log("[v0] Warning requirements:", warningReqs)
        return warningReqs
      default:
        return null
    }
  }

  // Modified isRequirementFulfilled to accept reportType as an argument
  const isRequirementFulfilled = (
    reportType: "weekly" | "pto" | "cdud" | "warning",
    requirement: string,
  ): { fulfilled: boolean; progress: string; percentage: number } => {
    const entries =
      reportType === "weekly"
        ? reportData.workEntries
        : reportType === "pto"
          ? ptoReportData.workEntries
          : reportType === "cdud"
            ? cdudReportData.workEntries
            : warningReportData.workEntries

    console.log("[v0] Checking requirement:", requirement)
    console.log(
      "[v0] Available entries:",
      entries.map((e) => ({ title: e.title, activityType: e.activityType })),
    )

    // Split by "/" to handle alternative requirements
    const requirementParts = requirement.split("/").map((part) => part.trim())

    // Get activity types that could match this requirement
    const activityTypes = getActivityTypesFromRequirement(requirement)
    console.log("[v0] Matching activity types:", activityTypes)

    let requiredCount = 1

    if (requirementParts.length > 1) {
      // Multiple alternatives - find the minimum count across all parts
      const counts = requirementParts.map((part) => extractNumberFromRequirement(part)).filter((count) => count > 0)

      requiredCount = counts.length > 0 ? Math.min(...counts) : 1
      console.log("[v0] Alternative requirements detected, counts:", counts, "using minimum:", requiredCount)
    } else {
      requiredCount = extractNumberFromRequirement(requirement)
    }

    console.log("[v0] Required count:", requiredCount)

    const matchingEntries = entries.filter((entry) => {
      const normalizedEntryType = entry.activityType.toLowerCase().trim()

      const matches = activityTypes.some((type) => {
        const normalizedType = type.toLowerCase().trim()

        // Strict matching for railway lectures vs general lectures
        if (normalizedType === "лекция про объекты железной дороги") {
          // Entry must explicitly be about railway objects
          return normalizedEntryType.includes("объект") && normalizedEntryType.includes("железн")
        }

        if (normalizedType === "лекция") {
          // General lecture should NOT match railway lectures
          const isRailwayLecture = normalizedEntryType.includes("объект") && normalizedEntryType.includes("железн")
          const isGeneralLecture =
            normalizedEntryType === "лекция" || (normalizedEntryType.includes("лекци") && !isRailwayLecture)
          return isGeneralLecture
        }

        // Strict matching for specific event types
        if (normalizedType.includes("выездн") || normalizedType.includes("межфракционн")) {
          return normalizedEntryType.includes(normalizedType.split(" ")[0])
        }

        // General event matching - exclude specific types
        if (normalizedType === "мероприятие" || normalizedType === "общее мероприятие") {
          const isGeneralEvent =
            normalizedEntryType === "мероприятие" ||
            normalizedEntryType === "общее мероприятие" ||
            normalizedEntryType === "мероприятие для сотрудников"
          const isSpecificEvent = normalizedEntryType.includes("выездн") || normalizedEntryType.includes("межфракционн")
          return isGeneralEvent && !isSpecificEvent
        }

        // For other activity types, use exact or contains matching
        return (
          normalizedEntryType === normalizedType ||
          normalizedEntryType.includes(normalizedType) ||
          normalizedType.includes(normalizedEntryType)
        )
      })

      if (matches) {
        console.log("[v0] Matched entry:", entry.title, entry.activityType)
      }
      return matches
    })

    const matchingCount = matchingEntries.length
    console.log("[v0] Matching entries count:", matchingCount, "required:", requiredCount)

    const fulfilled = matchingCount >= requiredCount
    const percentage = requiredCount > 0 ? Math.min((matchingCount / requiredCount) * 100, 100) : 0
    const progress = `${matchingCount}/${requiredCount}`

    console.log("[v0] Result - fulfilled:", fulfilled, "progress:", progress, "percentage:", percentage)

    return {
      fulfilled,
      progress,
      percentage,
    }
  }

  const calculateWarningProgress = (): {
    totalPoints: number
    activityCounts: ActivityCount[]
    progress: number
  } => {
    const position = currentUser?.position || ""
    const pointsRequired = getReprimandPointsRequired(position as Position)

    if (!pointsRequired) {
      return { totalPoints: 0, activityCounts: [], progress: 0 }
    }

    const activityMap = new Map<string, ActivityCount>()

    warningReportData.workEntries.forEach((entry) => {
      const points = getPointsForActivity(entry.activityType)
      const pointValue = pointValues.find((pv) => entry.activityType.toLowerCase().includes(pv.activity.toLowerCase()))

      if (points > 0) {
        const key = entry.activityType // Use the exact activity type for grouping
        const existing = activityMap.get(key)

        if (existing) {
          activityMap.set(key, {
            ...existing,
            count: existing.count + 1,
            points: existing.points + points,
          })
        } else {
          activityMap.set(key, {
            activity: entry.activityType,
            count: 1,
            points: points,
            maxPerWeek: pointValue?.maxPerWeek,
          })
        }
      }
    })

    const activityCounts = Array.from(activityMap.values())
    const totalPoints = activityCounts.reduce((sum, ac) => sum + ac.points, 0)
    const progress = pointsRequired > 0 ? (totalPoints / pointsRequired) * 100 : 0

    return { totalPoints, activityCounts, progress: Math.min(progress, 100) }
  }

  const RequirementsDialog = () => {
    const requirements = getRequirementsForCurrentReport()
    if (!requirements) {
      return null
    }

    // Pass reportType to isRequirementFulfilled
    const requirementResults = requirements.map((req) => isRequirementFulfilled(reportType, req))
    const totalPercentage = requirementResults.reduce((sum, result) => sum + result.percentage, 0)
    const progress = requirements.length > 0 ? totalPercentage / requirements.length : 0
    const fulfilledCount = requirementResults.filter((result) => result.fulfilled).length

    const position = currentUser?.position || ""
    const pointsRequired = reportType === "warning" ? getReprimandPointsRequired(position as Position) : null

    const warningProgress = reportType === "warning" && pointsRequired ? calculateWarningProgress() : null

    // Helper to determine current entries for the selected report type
    const currentEntries =
      reportType === "weekly"
        ? reportData.workEntries
        : reportType === "pto"
          ? ptoReportData.workEntries
          : reportType === "cdud"
            ? cdudReportData.workEntries
            : warningReportData.workEntries

    // Helper to handle deletion of an entry within the RequirementsDialog
    const handleDeleteEntry = (index: number) => {
      const entryIdToRemove = currentEntries[index].id
      // Call the appropriate removeEntry function based on the current report type
      switch (reportType) {
        case "weekly":
          removeEntry(entryIdToRemove, "weekly")
          break
        case "pto":
          removeEntry(entryIdToRemove, "pto")
          break
        case "cdud":
          removeEntry(entryIdToRemove, "cdud")
          break
        case "warning":
          removeEntry(entryIdToRemove, "warning")
          break
        default:
          break
      }
    }

    return (
      <Dialog open={showRequirementsDialog} onOpenChange={setShowRequirementsDialog}>
        <DialogContent
          className={`max-w-3xl max-h-[80vh] overflow-y-auto ${theme.mode === "dark" ? "bg-[#0f1419] border-white/10" : "bg-white border-gray-200"}`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" style={{ color: getTieColor() }} />
              Требования для отчёта
            </DialogTitle>
            <DialogDescription>
              {warningProgress ? (
                <>
                  Набрано жетонов: {warningProgress.totalPoints} из {pointsRequired} (
                  {Math.round(warningProgress.progress)}%)
                </>
              ) : (
                <>
                  Прогресс выполнения: {fulfilledCount} из {requirements.length} ({Math.round(progress)}%)
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${warningProgress ? warningProgress.progress : progress}%`,
                  backgroundColor: getTieColor(),
                }}
              />
            </div>

            {warningProgress && pointsRequired ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Система баллов (жетонов):</h3>
                <div
                  className={`p-4 rounded-lg border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                >
                  <p className="text-sm mb-4">
                    Для вашей должности требуется набрать <strong>{pointsRequired} жетонов</strong>.
                  </p>

                  {/* Activity counts */}
                  {warningProgress.activityCounts.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="font-medium text-sm">Выполненные активности:</h4>
                      {warningProgress.activityCounts.map((ac, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}
                        >
                          <span className="text-sm">{ac.activity}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Сделано: {ac.count} раз{ac.maxPerWeek ? ` (макс. ${ac.maxPerWeek}/нед.)` : ""}
                            </span>
                            <span
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{
                                backgroundColor: getTieColor() + "20",
                                color: getTieColor(),
                              }}
                            >
                              {ac.points} жетонов
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Point values reference */}
                  <div className="space-y-2 text-xs border-t pt-3 mt-3">
                    <h4 className="font-medium text-sm mb-2">Стоимость активностей:</h4>
                    {pointValues.map((pv, index) => (
                      <p key={index}>
                        • {pv.activity} - {pv.points} жетонов
                        {pv.maxPerWeek && ` (макс. ${pv.maxPerWeek} в неделю)`}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Uploaded entries list */}
                {currentEntries.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Загруженные доказательства:</h4>
                    {currentEntries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{entry.title}</p>
                          <p className="text-xs text-muted-foreground">{entry.activityType}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(index)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Requirements list for non-points systems */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Список требований:</h3>
                  {requirements.map((req, index) => {
                    const result = requirementResults[index]
                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 ${
                          result.fulfilled
                            ? theme.mode === "dark"
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-green-50 border-green-200"
                            : theme.mode === "dark"
                              ? "bg-white/5 border-white/10"
                              : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        {result.fulfilled ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm ${result.fulfilled ? "line-through opacity-70" : ""}`}>{req}</p>
                          {!result.fulfilled && result.progress !== "0/1" && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Выполнено: {result.progress} ({Math.round(result.percentage)}%)
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Uploaded entries list */}
                {currentEntries.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h4 className="font-medium text-sm">Загруженные доказательства:</h4>
                    {currentEntries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{entry.title}</p>
                          <p className="text-xs text-muted-foreground">{entry.activityType}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(index)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const handleGenerateReport = () => {
    let report = ""

    switch (reportType) {
      case "weekly":
        if (!reportData.position || !reportData.fullName || !reportData.fullNameGenitive) {
          toast({
            title: "Ошибка",
            description: "Заполните все обязательные поля",
            variant: "destructive",
          })
          return
        }
        report = generateWeeklyReport()
        break
      case "pto":
        if (!ptoReportData.fullName || !ptoReportData.position) {
          toast({
            title: "Ошибка",
            description: "Заполните все обязательные поля",
            variant: "destructive",
          })
          return
        }
        report = generatePTOReport()
        break
      case "cdud":
        if (!cdudReportData.fullName || !cdudReportData.position) {
          toast({
            title: "Ошибка",
            description: "Заполните все обязательные поля",
            variant: "destructive",
          })
          return
        }
        report = generateCDUDReport()
        break
      case "warning":
        if (!warningReportData.fullName || !warningReportData.position || !warningReportData.signature) {
          toast({
            title: "Ошибка",
            description: "Заполните все обязательные поля",
            variant: "destructive",
          })
          return
        }
        report = generateWarningReport()
        break
      case "leader":
        report = generateLeaderReport()
        break
    }

    setGeneratedReportText(report)
    toast({
      title: "Отчёт сформирован",
      description: "Отчёт готов к копированию",
    })
  }

  const copyReportToClipboard = () => {
    navigator.clipboard.writeText(generatedReportText)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast({
      title: "Скопировано",
      description: "Отчёт скопирован в буфер обмена",
    })
  }

  const addInterviewLink = () => {
    setLeaderReportData((prev) => ({
      ...prev,
      interviewLinks: [...prev.interviewLinks, ""],
    }))
  }

  const addLecture = () => {
    setLeaderReportData((prev) => ({
      ...prev,
      lectures: [...prev.lectures, { name: "", link: "" }],
    }))
  }

  const addBranchEvent = () => {
    setLeaderReportData((prev) => ({
      ...prev,
      branchEvents: [...prev.branchEvents, { name: "", link: "" }],
    }))
  }

  const addInterFactionEvent = () => {
    setLeaderReportData((prev) => ({
      ...prev,
      interFactionEvents: [...prev.interFactionEvents, { name: "", link: "" }],
    }))
  }

  const addStaffEvaluation = () => {
    setLeaderReportData((prev) => ({
      ...prev,
      staffEvaluations: [...prev.staffEvaluations, { nickname: "", role: "", evaluation: "" }],
    }))
  }

  // Effect to populate staffEvaluations when the component mounts or when reportType changes to 'leader'
  useEffect(() => {
    const loadStaffEvaluations = async () => {
      if (reportType === "leader") {
        // Get all users and filter for Заместитель and Старший Состав roles
        const allUsers = await getAllUsers()
        const staffUsers = allUsers.filter((user) => user.role === "Заместитель" || user.role === "Старший Состав")

        // Map to StaffEvaluation format
        const staffEvals = staffUsers.map((user) => ({
          nickname: user.nickname || "", // Ensure nickname is not undefined
          role: user.role || "", // Ensure role is not undefined
          evaluation: "",
        }))

        // Only update if the staff list has changed
        setLeaderReportData((prev) => {
          // Create sorted comma-separated strings for comparison
          const existingNicknames = prev.staffEvaluations
            .map((s) => s.nickname)
            .sort()
            .join(",")
          const newNicknames = staffEvals
            .map((s) => s.nickname)
            .sort()
            .join(",")

          if (existingNicknames !== newNicknames) {
            // Preserve existing evaluations for users that still exist
            const updatedEvals = staffEvals.map((newStaff) => {
              const existing = prev.staffEvaluations.find((s) => s.nickname === newStaff.nickname)
              return existing ? { ...newStaff, evaluation: existing.evaluation } : newStaff
            })
            return { ...prev, staffEvaluations: updatedEvals }
          }
          return prev // Return previous state if no change
        })
      }
    }
    loadStaffEvaluations()
  }, [reportType]) // Re-run this effect if reportType changes

  const handleConfirmUpload = () => {
    if (!entryTitle.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, укажите название работы или выбранное требование.",
        variant: "destructive",
      })
      return
    }
    if (pendingFiles.length > 0) {
      addEntry(pendingFiles, currentUploadTarget)
    }
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
          <FileText className="w-6 h-6" style={{ color: getTieColor() }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
            Генератор отчётов
          </h2>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Создание отчётов для различных подразделений РЖД
          </p>
        </div>
      </div>

      <RequirementsDialog />

      <div className="flex gap-3 flex-wrap">
        {shouldShowReportType("weekly") && (
          <button
            onClick={() => setReportType("weekly")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
              reportType === "weekly"
                ? `border-[${getTieColor()}] text-white`
                : theme.mode === "dark"
                  ? "border-white/10 text-white/70 hover:border-white/20"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
            style={
              reportType === "weekly"
                ? {
                    backgroundColor: getTieColor(),
                    borderColor: getTieColor(),
                  }
                : {}
            }
          >
            Еженедельный отчёт
          </button>
        )}

        {shouldShowReportType("pto") && (
          <button
            onClick={() => setReportType("pto")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
              reportType === "pto"
                ? `border-[${getTieColor()}] text-white`
                : theme.mode === "dark"
                  ? "border-white/10 text-white/70 hover:border-white/20"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
            style={
              reportType === "pto"
                ? {
                    backgroundColor: getTieColor(),
                    borderColor: getTieColor(),
                  }
                : {}
            }
          >
            Отчёт ПТО
          </button>
        )}

        {shouldShowReportType("cdud") && (
          <button
            onClick={() => setReportType("cdud")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
              reportType === "cdud"
                ? `border-[${getTieColor()}] text-white`
                : theme.mode === "dark"
                  ? "border-white/10 text-white/70 hover:border-white/20"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
            style={
              reportType === "cdud"
                ? {
                    backgroundColor: getTieColor(),
                    borderColor: getTieColor(),
                  }
                : {}
            }
          >
            Отчёт ЦдУД
          </button>
        )}

        {shouldShowReportType("warning") && (
          <button
            onClick={() => setReportType("warning")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
              reportType === "warning"
                ? `border-[${getTieColor()}] text-white`
                : theme.mode === "dark"
                  ? "border-white/10 text-white/70 hover:border-white/20"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
            style={
              reportType === "warning"
                ? {
                    backgroundColor: getTieColor(),
                    borderColor: getTieColor(),
                  }
                : {}
            }
          >
            Снятие выговора
          </button>
        )}

        {shouldShowReportType("leader") && (
          <button
            onClick={() => setReportType("leader")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
              reportType === "leader"
                ? `border-[${getTieColor()}] text-white`
                : theme.mode === "dark"
                  ? "border-white/10 text-white/70 hover:border-white/20"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
            style={
              reportType === "leader"
                ? {
                    backgroundColor: getTieColor(),
                    borderColor: getTieColor(),
                  }
                : {}
            }
          >
            Лидерский отчёт
          </button>
        )}
      </div>

      {/* Weekly Report */}
      {reportType === "weekly" && (
        <div className="space-y-6">
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Еженедельный отчёт старшего состава</CardTitle>
                  <CardDescription>Укажите ваши данные для формирования отчёта</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowRequirementsDialog(true)}
                  disabled={!reportData.position}
                  className="border-2"
                  style={{
                    borderColor: getTieColor() + "50",
                    color: getTieColor(),
                  }}
                >
                  <Info className="w-4 h-4 mr-2" />
                  Требования
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Position selector removed as position is now auto-filled from user profile */}

              {/* Full name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">ФИО (Именительный падеж) *</Label>
                  <Input
                    id="fullName"
                    placeholder="Иванов Иван Иванович"
                    value={reportData.fullName}
                    onChange={(e) => setReportData({ ...reportData, fullName: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullNameGenitive">ФИО (Родительный падеж) *</Label>
                  <Input
                    id="fullNameGenitive"
                    placeholder="Иванова Ивана Ивановича"
                    value={reportData.fullNameGenitive}
                    onChange={(e) => setReportData({ ...reportData, fullNameGenitive: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Должность</Label>
                <Input
                  id="position"
                  value={reportData.position}
                  readOnly
                  className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-300"} cursor-not-allowed`}
                />
                <p className="text-sm text-muted-foreground">Должность автоматически берётся из вашего профиля</p>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">Период с *</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={reportData.dateFrom}
                    onChange={(e) => setReportData({ ...reportData, dateFrom: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10 [color-scheme:dark]" : "bg-white border-gray-300"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">Период по *</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={reportData.dateTo}
                    onChange={(e) => setReportData({ ...reportData, dateTo: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10 [color-scheme:dark]" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              {/* Online time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="onlineHours">Часы онлайна *</Label>
                  <Input
                    id="onlineHours"
                    type="number"
                    placeholder="0"
                    value={reportData.onlineHours}
                    onChange={(e) => setReportData({ ...reportData, onlineHours: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onlineMinutes">Минуты онлайна *</Label>
                  <Input
                    id="onlineMinutes"
                    type="number"
                    placeholder="0"
                    value={reportData.onlineMinutes}
                    onChange={(e) => setReportData({ ...reportData, onlineMinutes: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              {/* File upload area */}
              <div
                className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg border text-center"
                style={{
                  background: `linear-gradient(135deg, ${getTieColor()}10, ${getTieColor()}05)`,
                  borderColor: getTieColor() + "30",
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "weekly")}
              >
                <div
                  className="p-4 rounded-full transition-colors duration-200"
                  style={{
                    backgroundColor: getTieColor() + (isDragging ? "30" : "15"),
                  }}
                >
                  <Upload className="w-8 h-8 transition-colors" style={{ color: getTieColor() }} />
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {isDragging ? "Отпустите файлы для загрузки" : "Перетащите скриншоты сюда"}
                  </p>
                  <p className="text-sm text-muted-foreground">или</p>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("fileInputWeekly")?.click()}
                    className="border-2"
                    style={{
                      borderColor: getTieColor() + "50",
                      color: getTieColor(),
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Выбрать файлы
                  </Button>
                  <input
                    id="fileInputWeekly"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, "weekly")}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Поддерживаются: изображения (PNG, JPG, JPEG). Можно выбрать несколько файлов
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Work entries list */}
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardHeader>
              <CardTitle>Проделанная работа ({reportData.workEntries.length})</CardTitle>
              <CardDescription>
                {reportData.workEntries.length > 0
                  ? "Загруженные записи о выполненной работе"
                  : "Здесь будут отображаться загруженные записи о работе"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.workEntries.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-3">
                  {reportData.workEntries.map((entry, index) => (
                    <AccordionItem
                      key={entry.id}
                      value={entry.id}
                      className={`border-2 rounded-xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-lg"
                              style={{
                                backgroundColor: getTieColor() + "20",
                              }}
                            >
                              <FileIcon className="w-4 h-4" style={{ color: getTieColor() }} />
                            </div>
                            <div className="text-left">
                              <span
                                className={`font-semibold block ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}
                              >
                                {index + 1}. {entry.title}
                              </span>
                              <span className={`text-sm ${theme.mode === "dark" ? "text-white/60" : "text-gray-600"}`}>
                                {entry.activityType && `${entry.activityType} • `}
                                {entry.uploadDate} • {entry.filesCount} файл(ов)
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeEntry(entry.id, "weekly")
                            }}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3">
                          <div
                            className="p-3 rounded-lg border"
                            style={{
                              background: `linear-gradient(135deg, ${getTieColor()}10, ${getTieColor()}05)`,
                              borderColor: getTieColor() + "30",
                            }}
                          >
                            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                              <span className="font-medium">Дата загрузки:</span> {entry.uploadDate}
                            </p>
                            {entry.activityType && (
                              <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                                <span className="font-medium">Тип активности:</span> {entry.activityType}
                              </p>
                            )}
                            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                              <span className="font-medium">Название:</span> {entry.title}
                            </p>
                            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                              <span className="font-medium">Файлов:</span> {entry.filesCount}
                            </p>

                            <div className="flex items-start gap-2">
                              <p
                                className={`text-sm font-medium ${theme.mode === "dark" ? "text-white/90" : "text-gray-700"}`}
                              >
                                Ссылка на папку:
                              </p>
                              <div className="flex flex-col gap-1">
                                {typeof entry.folderUrl === "string" ? (
                                  <a
                                    href={entry.folderUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"} break-all underline hover:no-underline`}
                                    style={{ color: getTieColor() }}
                                  >
                                    {entry.folderUrl}
                                  </a>
                                ) : (
                                  entry.folderUrl.map((url, idx) => (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"} break-all underline hover:no-underline`}
                                      style={{ color: getTieColor() }}
                                    >
                                      {url}
                                    </a>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div
                  className="p-8 rounded-lg border-2 border-dashed text-center"
                  style={{
                    borderColor: getTieColor() + "30",
                    background: `linear-gradient(135deg, ${getTieColor()}05, ${getTieColor()}02)`,
                  }}
                >
                  <p className="text-sm text-muted-foreground">
                    Пока нет загруженных записей. Используйте форму выше для загрузки файлов.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === "pto" && (
        <div className="space-y-6">
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Отчёт ПТО для повышения</CardTitle>
                  <CardDescription>Заполните данные для отчёта Производственно-технического отдела</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowRequirementsDialog(true)}
                  disabled={!ptoReportData.position}
                  className="border-2"
                  style={{
                    borderColor: getTieColor() + "50",
                    color: getTieColor(),
                  }}
                >
                  <Info className="w-4 h-4 mr-2" />
                  Требования
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Position selector removed as position is now auto-filled from user profile */}

              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ptoFullName">ФИО (Именительный падеж) *</Label>
                  <Input
                    id="ptoFullName"
                    placeholder="Иванов Иван Иванович"
                    value={ptoReportData.fullName}
                    onChange={(e) => setPTOReportData({ ...ptoReportData, fullName: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ptoFullNameGenitive">ФИО (Родительный падеж) *</Label>
                  <Input
                    id="ptoFullNameGenitive"
                    placeholder="Иванова Ивана Ивановича"
                    value={ptoReportData.fullNameGenitive}
                    onChange={(e) => setPTOReportData({ ...ptoReportData, fullNameGenitive: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ptoPosition">Должность</Label>
                <Input
                  id="ptoPosition"
                  value={ptoReportData.position}
                  readOnly
                  className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-300"} cursor-not-allowed`}
                />
                <p className="text-sm text-muted-foreground">Должность автоматически берётся из вашего профиля</p>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ptoDateFrom">Период с *</Label>
                  <Input
                    id="ptoDateFrom"
                    type="date"
                    value={ptoReportData.dateFrom}
                    onChange={(e) => setPTOReportData({ ...ptoReportData, dateFrom: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10 [color-scheme:dark]" : "bg-white border-gray-300"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ptoDateTo">Период по *</Label>
                  <Input
                    id="ptoDateTo"
                    type="date"
                    value={ptoReportData.dateTo}
                    onChange={(e) => setPTOReportData({ ...ptoReportData, dateTo: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10 [color-scheme:dark]" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              {/* File upload area */}
              <div
                className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg border text-center"
                style={{
                  background: `linear-gradient(135deg, ${getTieColor()}10, ${getTieColor()}05)`,
                  borderColor: getTieColor() + "30",
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "pto")}
              >
                <div
                  className="p-4 rounded-full transition-colors duration-200"
                  style={{
                    backgroundColor: getTieColor() + (isDragging ? "30" : "15"),
                  }}
                >
                  <Upload className="w-8 h-8 transition-colors" style={{ color: getTieColor() }} />
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {isDragging ? "Отпустите файлы для загрузки" : "Перетащите скриншоты сюда"}
                  </p>
                  <p className="text-sm text-muted-foreground">или</p>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("fileInputPTO")?.click()}
                    className="border-2"
                    style={{
                      borderColor: getTieColor() + "50",
                      color: getTieColor(),
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Выбрать файлы
                  </Button>
                  <input
                    id="fileInputPTO"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, "pto")}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Поддерживаются: изображения (PNG, JPG, JPEG). Можно выбрать несколько файлов
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Work entries list for PTO */}
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardHeader>
              <CardTitle>Выполненные требования ({ptoReportData.workEntries.length})</CardTitle>
              <CardDescription>
                {ptoReportData.workEntries.length > 0
                  ? "Загруженные доказательства выполнения требований"
                  : "Здесь будут отображаться загруженные доказательства"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ptoReportData.workEntries.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-3">
                  {ptoReportData.workEntries.map((entry, index) => (
                    <AccordionItem
                      key={entry.id}
                      value={entry.id}
                      className={`border-2 rounded-xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-lg"
                              style={{
                                backgroundColor: getTieColor() + "20",
                              }}
                            >
                              <FileIcon className="w-4 h-4" style={{ color: getTieColor() }} />
                            </div>
                            <div className="text-left">
                              <span
                                className={`font-semibold block ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}
                              >
                                {index + 1}. {entry.title}
                              </span>
                              <span className={`text-sm ${theme.mode === "dark" ? "text-white/60" : "text-gray-600"}`}>
                                ({entry.uploadDate}) • {entry.filesCount} файл(ов)
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeEntry(entry.id, "pto")
                            }}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3">
                          <div
                            className="p-3 rounded-lg border"
                            style={{
                              background: `linear-gradient(135deg, ${getTieColor()}10, ${getTieColor()}05)`,
                              borderColor: getTieColor() + "30",
                            }}
                          >
                            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                              <span className="font-medium">Дата загрузки:</span> {entry.uploadDate}
                            </p>
                            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                              <span className="font-medium">Требование:</span> {entry.title}
                            </p>
                            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                              <span className="font-medium">Файлов:</span> {entry.filesCount}
                            </p>

                            <div className="flex items-start gap-2">
                              <p
                                className={`text-sm font-medium ${theme.mode === "dark" ? "text-white/90" : "text-gray-700"}`}
                              >
                                Ссылка на папку:
                              </p>
                              <div className="flex flex-col gap-1">
                                {typeof entry.folderUrl === "string" ? (
                                  <a
                                    href={entry.folderUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"} break-all underline hover:no-underline`}
                                    style={{ color: getTieColor() }}
                                  >
                                    {entry.folderUrl}
                                  </a>
                                ) : (
                                  entry.folderUrl.map((url, idx) => (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"} break-all underline hover:no-underline`}
                                      style={{ color: getTieColor() }}
                                    >
                                      {url}
                                    </a>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div
                  className="p-8 rounded-lg border-2 border-dashed text-center"
                  style={{
                    borderColor: getTieColor() + "30",
                    background: `linear-gradient(135deg, ${getTieColor()}05, ${getTieColor()}02)`,
                  }}
                >
                  <p className="text-sm text-muted-foreground">
                    Пока нет загруженных записей. Используйте форму выше для загрузки файлов.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === "cdud" && (
        <div className="space-y-6">
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Отчёт ЦдУД для повышения</CardTitle>
                  <CardDescription>
                    Заполните данные для отчёта Центральной дирекции Управления Движением
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowRequirementsDialog(true)}
                  disabled={!cdudReportData.position}
                  className="border-2"
                  style={{
                    borderColor: getTieColor() + "50",
                    color: getTieColor(),
                  }}
                >
                  <Info className="w-4 h-4 mr-2" />
                  Требования
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Position selector removed as position is now auto-filled from user profile */}

              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cdudFullName">ФИО (Именительный падеж) *</Label>
                  <Input
                    id="cdudFullName"
                    placeholder="Иванов Иван Иванович"
                    value={cdudReportData.fullName}
                    onChange={(e) => setCDUDReportData({ ...cdudReportData, fullName: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cdudFullNameGenitive">ФИО (Родительный падеж) *</Label>
                  <Input
                    id="cdudFullNameGenitive"
                    placeholder="Иванова Ивана Ивановича"
                    value={cdudReportData.fullNameGenitive}
                    onChange={(e) => setCDUDReportData({ ...cdudReportData, fullNameGenitive: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cdudPosition">Должность</Label>
                <Input
                  id="cdudPosition"
                  value={cdudReportData.position}
                  readOnly
                  className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-300"} cursor-not-allowed`}
                />
                <p className="text-sm text-muted-foreground">Должность автоматически берётся из вашего профиля</p>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cdudDateFrom">Период с *</Label>
                  <Input
                    id="cdudDateFrom"
                    type="date"
                    value={cdudReportData.dateFrom}
                    onChange={(e) => setCDUDReportData({ ...cdudReportData, dateFrom: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10 [color-scheme:dark]" : "bg-white border-gray-300"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cdudDateTo">Период по *</Label>
                  <Input
                    id="cdudDateTo"
                    type="date"
                    value={cdudReportData.dateTo}
                    onChange={(e) => setCDUDReportData({ ...cdudReportData, dateTo: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10 [color-scheme:dark]" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              {/* File upload area */}
              <div
                className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg border text-center"
                style={{
                  background: `linear-gradient(135deg, ${getTieColor()}10, ${getTieColor()}05)`,
                  borderColor: getTieColor() + "30",
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "cdud")}
              >
                <div
                  className="p-4 rounded-full transition-colors duration-200"
                  style={{
                    backgroundColor: getTieColor() + (isDragging ? "30" : "15"),
                  }}
                >
                  <Upload className="w-8 h-8 transition-colors" style={{ color: getTieColor() }} />
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {isDragging ? "Отпустите файлы для загрузки" : "Перетащите скриншоты сюда"}
                  </p>
                  <p className="text-sm text-muted-foreground">или</p>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("fileInputCDUD")?.click()}
                    className="border-2"
                    style={{
                      borderColor: getTieColor() + "50",
                      color: getTieColor(),
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Выбрать файлы
                  </Button>
                  <input
                    id="fileInputCDUD"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, "cdud")}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Поддерживаются: изображения (PNG, JPG, JPEG). Можно выбрать несколько файлов
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Work entries list for CDUD */}
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardHeader>
              <CardTitle>Выполненные требования ({cdudReportData.workEntries.length})</CardTitle>
              <CardDescription>
                {cdudReportData.workEntries.length > 0
                  ? "Загруженные доказательства выполнения требований"
                  : "Здесь будут отображаться загруженные доказательства"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cdudReportData.workEntries.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-3">
                  {cdudReportData.workEntries.map((entry, index) => (
                    <AccordionItem
                      key={entry.id}
                      value={entry.id}
                      className={`border-2 rounded-xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-lg"
                              style={{
                                backgroundColor: getTieColor() + "20",
                              }}
                            >
                              <FileIcon className="w-4 h-4" style={{ color: getTieColor() }} />
                            </div>
                            <div className="text-left">
                              <span
                                className={`font-semibold block ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}
                              >
                                {index + 1}. {entry.title}
                              </span>
                              <span className={`text-sm ${theme.mode === "dark" ? "text-white/60" : "text-gray-600"}`}>
                                ({entry.uploadDate}) • {entry.filesCount} файл(ов)
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeEntry(entry.id, "cdud")
                            }}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3">
                          <div
                            className="p-3 rounded-lg border"
                            style={{
                              background: `linear-gradient(135deg, ${getTieColor()}10, ${getTieColor()}05)`,
                              borderColor: getTieColor() + "30",
                            }}
                          >
                            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                              <span className="font-medium">Дата загрузки:</span> {entry.uploadDate}
                            </p>
                            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                              <span className="font-medium">Требование:</span> {entry.title}
                            </p>
                            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                              <span className="font-medium">Файлов:</span> {entry.filesCount}
                            </p>

                            <div className="flex items-start gap-2">
                              <p
                                className={`text-sm font-medium ${theme.mode === "dark" ? "text-white/90" : "text-gray-700"}`}
                              >
                                Ссылка на папку:
                              </p>
                              <div className="flex flex-col gap-1">
                                {typeof entry.folderUrl === "string" ? (
                                  <a
                                    href={entry.folderUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"} break-all underline hover:no-underline`}
                                    style={{ color: getTieColor() }}
                                  >
                                    {entry.folderUrl}
                                  </a>
                                ) : (
                                  entry.folderUrl.map((url, idx) => (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"} break-all underline hover:no-underline`}
                                      style={{ color: getTieColor() }}
                                    >
                                      {url}
                                    </a>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div
                  className="p-8 rounded-lg border-2 border-dashed text-center"
                  style={{
                    borderColor: getTieColor() + "30",
                    background: `linear-gradient(135deg, ${getTieColor()}05, ${getTieColor()}02)`,
                  }}
                >
                  <p className="text-sm text-muted-foreground">
                    Пока нет загруженных записей. Используйте форму выше для загрузки файлов.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === "warning" && (
        <div className="space-y-6">
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Заявление на отработку выговора</CardTitle>
                  <CardDescription>
                    Заполните данные для заявления на отработку дисциплинарного взыскания
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowRequirementsDialog(true)}
                  disabled={!warningReportData.position}
                  className="border-2"
                  style={{
                    borderColor: getTieColor() + "50",
                    color: getTieColor(),
                  }}
                >
                  <Info className="w-4 h-4 mr-2" />
                  Требования
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Position selector removed as position is now auto-filled from user profile */}

              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warningFullName">ФИО (Именительный падеж) *</Label>
                  <Input
                    id="warningFullName"
                    placeholder="Иванов Иван Иванович"
                    value={warningReportData.fullName}
                    onChange={(e) => setWarningReportData({ ...warningReportData, fullName: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warningFullNameGenitive">ФИО (Родительный падеж) *</Label>
                  <Input
                    id="warningFullNameGenitive"
                    placeholder="Иванова Ивана Ивановича"
                    value={warningReportData.fullNameGenitive}
                    onChange={(e) => setWarningReportData({ ...warningReportData, fullNameGenitive: e.target.value })}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warningPosition">Должность</Label>
                <Input
                  id="warningPosition"
                  value={warningReportData.position}
                  readOnly
                  className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-300"} cursor-not-allowed`}
                />
                <p className="text-sm text-muted-foreground">Должность автоматически берётся из вашего профиля</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warningSignature">Подпись *</Label>
                <Input
                  id="warningSignature"
                  placeholder="Иванов И. И."
                  value={warningReportData.signature || ""}
                  onChange={(e) => setWarningReportData((prev) => ({ ...prev, signature: e.target.value }))}
                  className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                />
                <p className="text-sm text-muted-foreground">Введите вашу подпись для заявления</p>
              </div>

              {/* File upload area */}
              <div
                className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg border text-center"
                style={{
                  background: `linear-gradient(135deg, ${getTieColor()}10, ${getTieColor()}05)`,
                  borderColor: getTieColor() + "30",
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "warning")}
              >
                <div
                  className="p-4 rounded-full transition-colors duration-200"
                  style={{
                    backgroundColor: getTieColor() + (isDragging ? "30" : "15"),
                  }}
                >
                  <Upload className="w-8 h-8 transition-colors" style={{ color: getTieColor() }} />
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {isDragging ? "Отпустите файлы для загрузки" : "Перетащите скриншоты сюда"}
                  </p>
                  <p className="text-sm text-muted-foreground">или</p>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("fileInputWarning")?.click()}
                    className="border-2"
                    style={{
                      borderColor: getTieColor() + "50",
                      color: getTieColor(),
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Выбрать файлы
                  </Button>
                  <input
                    id="fileInputWarning"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, "warning")}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Поддерживаются: изображения (PNG, JPG, JPEG). Можно выбрать несколько файлов
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Work entries list for warning */}
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardHeader>
              <CardTitle>Доказательства нарушений ({warningReportData.workEntries.length})</CardTitle>
              <CardDescription>
                {warningReportData.workEntries.length > 0
                  ? "Загруженные доказательства нарушений"
                  : "Здесь будут отображаться загруженные доказательства"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {warningReportData.workEntries.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-3">
                  {warningReportData.workEntries.map((entry, index) => (
                    <AccordionItem
                      key={entry.id}
                      value={entry.id}
                      className={`border-2 rounded-xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-lg"
                              style={{
                                backgroundColor: getTieColor() + "20",
                              }}
                            >
                              <FileIcon className="w-4 h-4" style={{ color: getTieColor() }} />
                            </div>
                            <div className="text-left">
                              <span
                                className={`font-semibold block ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}
                              >
                                {index + 1}. {entry.title}
                              </span>
                              <span className={`text-sm ${theme.mode === "dark" ? "text-white/60" : "text-gray-600"}`}>
                                ({entry.uploadDate}) • {entry.filesCount} файл(ов)
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeEntry(entry.id, "warning")
                            }}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3">
                          <div
                            className="p-3 rounded-lg border"
                            style={{
                              background: `linear-gradient(135deg, ${getTieColor()}10, ${getTieColor()}05)`,
                              borderColor: getTieColor() + "30",
                            }}
                          >
                            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                              <span className="font-medium">Дата загрузки:</span> {entry.uploadDate}
                            </p>
                            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                              <span className="font-medium">Требование:</span> {entry.title}
                            </p>
                            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
                              <span className="font-medium">Файлов:</span> {entry.filesCount}
                            </p>

                            <div className="flex items-start gap-2">
                              <p
                                className={`text-sm font-medium ${theme.mode === "dark" ? "text-white/90" : "text-gray-700"}`}
                              >
                                Ссылка на папку:
                              </p>
                              <div className="flex flex-col gap-1">
                                {typeof entry.folderUrl === "string" ? (
                                  <a
                                    href={entry.folderUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"} break-all underline hover:no-underline`}
                                    style={{ color: getTieColor() }}
                                  >
                                    {entry.folderUrl}
                                  </a>
                                ) : (
                                  entry.folderUrl.map((url, idx) => (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"} break-all underline hover:no-underline`}
                                      style={{ color: getTieColor() }}
                                    >
                                      {url}
                                    </a>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div
                  className="p-8 rounded-lg border-2 border-dashed text-center"
                  style={{
                    borderColor: getTieColor() + "30",
                    background: `linear-gradient(135deg, ${getTieColor()}05, ${getTieColor()}02)`,
                  }}
                >
                  <p className="text-sm text-muted-foreground">
                    Пока нет загруженных записей. Используйте форму выше для загрузки файлов.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === "leader" && (
        <div className="space-y-6">
          <Card
            className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <CardHeader>
              <CardTitle>Лидерский отчёт</CardTitle>
              <CardDescription>Комплексный отчёт лидера фракции с 12 разделами</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaderDateFrom">Период с *</Label>
                  <Input
                    id="leaderDateFrom"
                    type="date"
                    value={leaderReportData.dateFrom}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, dateFrom: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10 [color-scheme:dark]" : "bg-white border-gray-300"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaderDateTo">Период по *</Label>
                  <Input
                    id="leaderDateTo"
                    type="date"
                    value={leaderReportData.dateTo}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, dateTo: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10 [color-scheme:dark]" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              {/* Section 2: Interviews */}
              <div className="space-y-3">
                <Label>2. Ссылки на собеседования</Label>
                {leaderReportData.interviewLinks.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Ссылка на собеседование"
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...leaderReportData.interviewLinks]
                        newLinks[index] = e.target.value
                        setLeaderReportData((prev) => ({ ...prev, interviewLinks: newLinks }))
                      }}
                      className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                    />
                    {leaderReportData.interviewLinks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLeaderReportData((prev) => ({
                            ...prev,
                            interviewLinks: prev.interviewLinks.filter((_, i) => i !== index),
                          }))
                        }}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addInterviewLink} className="w-full bg-transparent">
                  Добавить ссылку
                </Button>
              </div>

              {/* Section 3: Staff statistics */}
              <div className="space-y-3">
                <Label>3. Статистика увольнений и приёма</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Уволенных ПСЖ"
                    value={leaderReportData.firedPSJ}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, firedPSJ: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                  <Input
                    placeholder="Уволенных с ОЧС"
                    value={leaderReportData.firedocs}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, firedocs: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                  <Input
                    placeholder="Всего уволенных"
                    value={leaderReportData.totalFired}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, totalFired: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                  <Input
                    placeholder="Всего принятых"
                    value={leaderReportData.totalHired}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, totalHired: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              {/* Section 4: Current staff count */}
              <div className="space-y-3">
                <Label>4. Количество сотрудников по рангам</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Первые ранги"
                    value={leaderReportData.firstRanks}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, firstRanks: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                  <Input
                    placeholder="Средний состав"
                    value={leaderReportData.middleStaff}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, middleStaff: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                  <Input
                    placeholder="Старший состав"
                    value={leaderReportData.seniorStaff}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, seniorStaff: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                  <Input
                    placeholder="Руководящий состав"
                    value={leaderReportData.managementStaff}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, managementStaff: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                  <Input
                    placeholder="Всего сотрудников"
                    value={leaderReportData.totalStaff}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, totalStaff: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              {/* Section 5: Calls and senior hires */}
              <div className="space-y-3">
                <Label>5. Обзвоны и приём в старший состав</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Количество обзвонов"
                    value={leaderReportData.callsCount}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, callsCount: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                  <Input
                    placeholder="Принято в старший состав"
                    value={leaderReportData.seniorHired}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, seniorHired: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              {/* Section 6: Staff changes */}
              <div className="space-y-2">
                <Label htmlFor="staffChanges">6. Кадровые перестановки</Label>
                <Textarea
                  id="staffChanges"
                  placeholder="Никнеймы, отделы, повышения, понижения..."
                  value={leaderReportData.staffChanges}
                  onChange={(e) => setLeaderReportData((prev) => ({ ...prev, staffChanges: e.target.value }))}
                  rows={4}
                  className={theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}
                />
              </div>

              {/* Section 7: Warnings */}
              <div className="space-y-2">
                <Label htmlFor="warnings">7. Выданные выговоры</Label>
                <Textarea
                  id="warnings"
                  placeholder="Никнеймы, причины, количество..."
                  value={leaderReportData.warnings}
                  onChange={(e) => setLeaderReportData((prev) => ({ ...prev, warnings: e.target.value }))}
                  rows={4}
                  className={theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}
                />
              </div>

              {/* Section 8: Penalty fund */}
              <div className="space-y-3">
                <Label>8. Фонд неустоек</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Получено"
                    value={leaderReportData.penaltyReceived}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, penaltyReceived: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                  <Input
                    placeholder="Выплачено"
                    value={leaderReportData.penaltyPaid}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, penaltyPaid: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                  <Input
                    placeholder="Остаток"
                    value={leaderReportData.penaltyBalance}
                    onChange={(e) => setLeaderReportData((prev) => ({ ...prev, penaltyBalance: e.target.value }))}
                    className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              {/* Section 9: Global Weekly Reports from All Users */}
              <Card
                className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
              >
                <CardHeader>
                  <CardTitle>9. Глобальная активность ({leaderReportData.globalWeeklyEntries.length})</CardTitle>
                  <CardDescription>Все еженедельные отчёты от всех сотрудников</CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderReportData.globalWeeklyEntries.length > 0 ? (
                    <Accordion type="single" collapsible className="space-y-3">
                      {leaderReportData.globalWeeklyEntries.map((entry, index) => (
                        <AccordionItem
                          key={entry.id}
                          value={entry.id}
                          className={`border-2 rounded-xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="p-2 rounded-lg"
                                  style={{
                                    backgroundColor: getTieColor() + "20",
                                  }}
                                >
                                  <FileIcon className="w-4 h-4" style={{ color: getTieColor() }} />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">{entry.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {entry.userNickname} • {entry.activityType} • {entry.uploadDate}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{entry.filesCount} файл(ов)</span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Должность:</span>
                                <span>{entry.userPosition}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Тип активности:</span>
                                <span>{entry.activityType}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Дата загрузки:</span>
                                <span>{entry.uploadDate}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(entry.folderUrl as string, "_blank")}
                                className="w-full"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Открыть папку на Яндекс.Диске
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Пока нет загруженных отчётов от сотрудников</p>
                      <p className="text-sm mt-1">Отчёты будут появляться здесь автоматически</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Section 10: Branch events */}
              <div className="space-y-3">
                <Label>10. Мероприятия от филиалов</Label>
                {leaderReportData.branchEvents.map((event, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Название"
                      value={event.name}
                      onChange={(e) => {
                        const newEvents = [...leaderReportData.branchEvents]
                        newEvents[index].name = e.target.value
                        setLeaderReportData((prev) => ({ ...prev, branchEvents: newEvents }))
                      }}
                      className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                    />
                    <Input
                      placeholder="Ссылка"
                      value={event.link}
                      onChange={(e) => {
                        const newEvents = [...leaderReportData.branchEvents]
                        newEvents[index].link = e.target.value
                        setLeaderReportData((prev) => ({ ...prev, branchEvents: newEvents }))
                      }}
                      className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                    />
                    {leaderReportData.branchEvents.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLeaderReportData((prev) => ({
                            ...prev,
                            branchEvents: prev.branchEvents.filter((_, i) => i !== index),
                          }))
                        }}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addBranchEvent} className="w-full bg-transparent">
                  Добавить мероприятие
                </Button>
              </div>

              {/* Section 11: Inter-faction events */}
              <div className="space-y-3">
                <Label>11. Межфракционные мероприятия (с участием лидера)</Label>
                {leaderReportData.interFactionEvents.map((event, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Название"
                      value={event.name}
                      onChange={(e) => {
                        const newEvents = [...leaderReportData.interFactionEvents]
                        newEvents[index].name = e.target.value
                        setLeaderReportData((prev) => ({ ...prev, interFactionEvents: newEvents }))
                      }}
                      className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                    />
                    <Input
                      placeholder="Ссылка"
                      value={event.link}
                      onChange={(e) => {
                        const newEvents = [...leaderReportData.interFactionEvents]
                        newEvents[index].link = e.target.value
                        setLeaderReportData((prev) => ({ ...prev, interFactionEvents: newEvents }))
                      }}
                      className={`h-12 ${theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}
                    />
                    {leaderReportData.interFactionEvents.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLeaderReportData((prev) => ({
                            ...prev,
                            interFactionEvents: prev.interFactionEvents.filter((_, i) => i !== index),
                          }))
                        }}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addInterFactionEvent} className="w-full bg-transparent">
                  Добавить мероприятие
                </Button>
              </div>

              {/* Section 12: Staff evaluations with auto-populated users */}
              <div className="space-y-3">
                <Label>12. Оценка работы старшего состава и заместителей</Label>
                {leaderReportData.staffEvaluations.map((staff, index) => (
                  <div
                    key={index}
                    className="space-y-2 p-4 rounded-lg border"
                    style={{ borderColor: getTieColor() + "30" }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="px-3 py-1 rounded-md text-sm font-medium"
                        style={{
                          backgroundColor: getTieColor() + "20",
                          color: getTieColor(),
                        }}
                      >
                        {staff.nickname}
                      </div>
                      <div className="text-sm text-muted-foreground">({staff.role})</div>
                    </div>
                    <Textarea
                      placeholder="Характеристика работы сотрудника (оценка/10, комментарий)"
                      value={staff.evaluation}
                      onChange={(e) => {
                        const newEvals = [...leaderReportData.staffEvaluations]
                        newEvals[index].evaluation = e.target.value
                        setLeaderReportData((prev) => ({ ...prev, staffEvaluations: newEvals }))
                      }}
                      rows={3}
                      className={theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}
                    />
                  </div>
                ))}
                {leaderReportData.staffEvaluations.length === 0 && (
                  <div
                    className="p-6 rounded-lg border text-center text-sm text-muted-foreground"
                    style={{ borderColor: getTieColor() + "20" }}
                  >
                    Нет сотрудников с ролью "Заместитель" или "Старший Состав" в разделе управления
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate Report Button */}
      <Card
        className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
      >
        <CardContent className="pt-6">
          <Button
            onClick={handleGenerateReport}
            className="w-full h-14 text-lg font-semibold"
            style={{
              backgroundColor: getTieColor(),
              color: "white",
            }}
          >
            <FileText className="w-5 h-5 mr-2" />
            Сформировать отчёт
          </Button>
        </CardContent>
      </Card>

      {/* Generated Report Display */}
      {generatedReportText && (
        <Card
          className={`border-2 rounded-2xl ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Сформированный отчёт</CardTitle>
              <Button
                onClick={copyReportToClipboard}
                variant="outline"
                className="border-2 bg-transparent"
                style={{
                  borderColor: getTieColor() + "50",
                  color: getTieColor(),
                }}
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Скопировано
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Копировать
                  </>
                )}
              </Button>
            </div>
            <CardDescription>Нажмите кнопку выше, чтобы скопировать отчёт в буфер обмена</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`p-6 rounded-xl border-2 font-mono text-sm whitespace-pre-wrap ${theme.mode === "dark" ? "bg-[#0f1419]/80 border-white/10" : "bg-gray-50 border-gray-200"}`}
            >
              {generatedReportText}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={showTitleDialog} onOpenChange={setShowTitleDialog}>
        <DialogContent
          className={`sm:max-w-md ${theme.mode === "dark" ? "bg-[#0f1419] border-white/10" : "bg-white border-gray-200"}`}
        >
          <DialogHeader>
            <DialogTitle className={theme.mode === "dark" ? "text-white" : "text-gray-900"}>
              Информация о работе
            </DialogTitle>
            <DialogDescription className={theme.mode === "dark" ? "text-white/70" : "text-gray-600"}>
              {currentUploadTarget === "pto" || currentUploadTarget === "cdud"
                ? "Выберите требование, которое вы выполнили"
                : "Укажите тип и название выполненной работы"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {currentUploadTarget === "pto" || currentUploadTarget === "cdud" ? (
              <div className="space-y-2">
                <Label className={theme.mode === "dark" ? "text-white" : "text-gray-900"}>
                  Выполненное требование *
                </Label>
                <Select
                  value={entryTitle}
                  onValueChange={(value) => {
                    setEntryTitle(value)
                    // Automatically set the activity type based on the requirement
                    const mappedActivityType = getActivityTypeFromRequirement(value)
                    setActivityType(mappedActivityType)
                    console.log("[v0] Selected requirement:", value, "Mapped activity type:", mappedActivityType)
                  }}
                >
                  <SelectTrigger
                    className={
                      theme.mode === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-300"
                    }
                  >
                    <SelectValue placeholder="Выберите требование" />
                  </SelectTrigger>
                  <SelectContent
                    className={theme.mode === "dark" ? "bg-[#0f1419] border-white/10" : "bg-white border-gray-200"}
                  >
                    {(() => {
                      const requirements = getRequirementsForReportType(currentUploadTarget === "pto" ? "pto" : "cdud")
                      return requirements
                        ? requirements.map((req, index) => (
                            <SelectItem
                              key={index}
                              value={req}
                              className={
                                theme.mode === "dark"
                                  ? "text-white hover:bg-white/5 focus:bg-white/10"
                                  : "text-gray-900 hover:bg-gray-100"
                              }
                            >
                              {req}
                            </SelectItem>
                          ))
                        : null
                    })()}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className={theme.mode === "dark" ? "text-white" : "text-gray-900"}>Тип активности *</Label>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger
                      className={
                        theme.mode === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-300"
                      }
                    >
                      <SelectValue placeholder="Выберите тип активности" />
                    </SelectTrigger>
                    <SelectContent
                      className={theme.mode === "dark" ? "bg-[#0f1419] border-white/10" : "bg-white border-gray-200"}
                    >
                      {ACTIVITY_TYPES.map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className={
                            theme.mode === "dark"
                              ? "text-white hover:bg-white/5 focus:bg-white/10"
                              : "text-gray-900 hover:bg-gray-100"
                          }
                        >
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={theme.mode === "dark" ? "text-white" : "text-gray-900"}>Название работы *</Label>
                  <Input
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                    placeholder="Например: №542, Проверка локомотивов"
                    className={
                      theme.mode === "dark"
                        ? "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        : "bg-white border-gray-300"
                    }
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowTitleDialog(false)
                setPendingFiles([])
                setEntryTitle("")
                setActivityType("")
                setCustomActivityType("")
              }}
              className={
                theme.mode === "dark"
                  ? "border-white/10 text-white hover:bg-white/5"
                  : "border-gray-300 hover:bg-gray-100"
              }
            >
              Отмена
            </Button>
            <Button
              onClick={handleConfirmUpload}
              disabled={isUploading || !entryTitle}
              className="text-white"
              style={{ backgroundColor: getTieColor() }}
            >
              {isUploading ? "Загрузка..." : "Загрузить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Copy, AlertCircle, Train, MapPin, Settings, User, Hash, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTheme } from "@/contexts/theme-context"
import { getThemeColor } from "@/lib/theme-utils"

export function ReportCompilerSection() {
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedLocomotive, setSelectedLocomotive] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [locomotiveNumber, setLocomotiveNumber] = useState("")
  const [passNumber, setPassNumber] = useState("")
  const [flightNumber, setFlightNumber] = useState("")
  const [dispatcherName, setDispatcherName] = useState("")
  const [assistantName, setAssistantName] = useState("")

  const [generatedReports, setGeneratedReports] = useState<string[]>([])
  const [generatedWithType, setGeneratedWithType] = useState<string | null>(null)
  const [generatedWithRole, setGeneratedWithRole] = useState<string | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const { theme } = useTheme()

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const selectOption = (type: string, value: string) => {
    switch (type) {
      case "direction":
        setSelectedDirection(selectedDirection === value ? null : value)
        break
      case "role":
        setSelectedRole(selectedRole === value ? null : value)
        break
      case "locomotive":
        setSelectedLocomotive(selectedLocomotive === value ? null : value)
        break
      case "type":
        setSelectedType(selectedType === value ? null : value)
        break
      case "category":
        setSelectedCategory(selectedCategory === value ? null : value)
        break
    }
  }

  const getLowercaseLocomotive = (locomotive: string) => {
    switch (locomotive) {
      case "Тепловоз ТЭП70БС":
        return "тепловоз ТЭП70БС"
      case "Электровоз ЭП1":
        return "электровоз ЭП1"
      case "Паровоз ЛВ":
        return "паровоз ЛВ"
      default:
        return locomotive
    }
  }

  const getLowercaseLocomotivePlural = (locomotive: string) => {
    switch (locomotive) {
      case "Тепловоз ТЭП70БС":
        return "тепловоза ТЭП70БС"
      case "Электровоз ЭП1":
        return "электровоза ЭП1"
      case "Паровоз ЛВ":
        return "паровоза ЛВ"
      default:
        return locomotive
    }
  }

  const generateReport = () => {
    const isDNC = selectedType === "Рейс с ДНЦ"
    const requiredFields =
      selectedDirection && selectedLocomotive && selectedCategory && locomotiveNumber && passNumber && flightNumber
    const hasDispatcherInfo = isDNC ? dispatcherName !== "" && selectedRole !== null : true

    if (!requiredFields || !hasDispatcherInfo) {
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 2000)
      return
    }

    setShowNotification(false)

    const callSign = `${selectedCategory === "Пассажирский" ? "П" : "Т"}-${passNumber}-${flightNumber}`
    const reports: string[] = []

    if (selectedCategory === "Пассажирский") {
      generatePassengerReports(reports, callSign)
    } else if (selectedCategory === "Туристический") {
      generateTouristReports(reports, callSign)
    }

    setGeneratedReports(reports)
    setGeneratedWithType(selectedType)
    setGeneratedWithRole(selectedRole)

    setSelectedDirection(null)
    setSelectedRole(null)
    setSelectedLocomotive(null)
    setSelectedType(null)
    setSelectedCategory(null)
    setLocomotiveNumber("")
    setPassNumber("")
    setFlightNumber("")
    setDispatcherName("")
    setAssistantName("")
  }

  const generatePassengerReports = (reports: string[], callSign: string) => {
    const lowerLocomotive = getLowercaseLocomotive(selectedLocomotive!)
    const lowLocomotivePlural = getLowercaseLocomotivePlural(selectedLocomotive!)
    const assistantText = assistantName.length > 0 ? ` Помощник: ${assistantName}.` : ""

    if (selectedDirection === "Приволжск-Мирный") {
      if (selectedType === "Рейс с ДНЦ") {
        if (selectedRole === "Машинист") {
          reports.push(
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr Машинист ${dispatcherName}, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `cr Заполнили документацию. Магистраль продули, башмаки убрали, состав готов к выезду на линию.`,
            `tr ${passNumber} Понятно, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `tr ${passNumber} Заполнили документацию. Магистраль продули, башмаки убрали, ожидайте отправления.`,
            `cr Принято.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Приволжск готов, ЧМ1 лунно-белый.`,
            `cr Принято, выполняю!`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} следует по перегону из депо ТЧЭ-1 до ст. Приволжск.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 1 путь ст. Приволожск, машинист ${dispatcherName}.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 1 путь ст. Приволожск, ожидайте 1 минуту.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 1 путь ст. Приволожск, стоянка 1 минута.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Невский готов, Ч1 два жёлтых, верхний мигающий.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Приволжск на перегон до ст. Невский.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 1 путь ст. Невский, машинист ${dispatcherName}.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 1 путь ст. Невский, ожидайте 1 минуту.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 1 путь ст. Невский, стоянка 1 минута.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Мирный готов, Ч1 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Невский на перегон до ст. Мирный.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 2 путь ст. Мирный, машинист ${dispatcherName}.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 2 путь ст. Мирный, ожидайте 1 минуту.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 2 путь ст. Мирный, стоянка 1 минута.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут в депо ТЧЭ-1 готов, ЧМ2 лунно-белый.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Мирный в депо ТЧЭ-1.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1. Рейс № ${flightNumber} окончен, локомотив сдан, машинист ${dispatcherName}!`,
            `tr ${passNumber} Понятно! Прибыли в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
          )
        } else if (selectedRole === "Диспетчер") {
          reports.push(
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ ${dispatcherName}, слушаю.`,
            `cr Машинист Фамилия, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `cr Заполнили документацию. Магистраль продули, башмаки убрали, состав готов к выезду на линию.`,
            `tr ${passNumber} Понятно, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `tr ${passNumber} Заполнили документацию. Магистраль продули, башмаки убрали, ожидайте отправления.`,
            `cr Принято.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Приволжск готов, ЧМ1 лунно-белый.`,
            `cr Принято, выполняю!`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} следует по перегону из депо ТЧЭ-1 до ст. Приволжск.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ ${dispatcherName}, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 1 путь ст. Приволожск, машинист Фамилия.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 1 путь ст. Приволожск, ожидайте 1 минуту.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 1 путь ст. Приволожск, стоянка 1 минута.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Невский готов, Ч1 два жёлтых, верхний мигающий.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Приволжск на перегон до ст. Невский.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ ${dispatcherName}, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 1 путь ст. Невский, машинист Фамилия.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 1 путь ст. Невский, ожидайте 1 минуту.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 1 путь ст. Невский, стоянка 1 минута.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Мирный готов, Ч1 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Невский на перегон до ст. Мирный.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 2 путь ст. Мирный, машинист Фамилия.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 2 путь ст. Мирный, ожидайте 1 минуту.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 2 путь ст. Мирный, стоянка 1 минута.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут в депо ТЧЭ-1 готов, ЧМ2 лунно-белый.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Мирный в депо ТЧЭ-1.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1. Рейс № ${flightNumber} окончен, локомотив сдан, машинист Фамилия!`,
            `tr ${passNumber} Понятно! Прибыли в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
          )
        }
      } else if (selectedType === "Автономный") {
        reports.push(
          `r [${callSign}] Приняли ${lowerLocomotive}-${locomotiveNumber} №${flightNumber}, заполнили документацию.`,
          `r [${callSign}] Убираем башмаки, откручиваем ручной, продуваем тормозную магистраль.`,
          `r [${callSign}] Магистраль продули, башмаки убрали, состав готов к выезду на линию.${assistantText}`,
          `r [${callSign}] Вижу ЧМ1 лунно-белый, отправляемся из депо ТЧЭ-1 на перегон до ст. Приволжск…`,
          `r [${callSign}] ...пл. Жуковский без остановки.${assistantText}`,
          `r [${callSign}] Машинист ${lowLocomotivePlural}-${locomotiveNumber} на приближении к ст. Приволжск, вижу Ч жёлтый мигающий.`,
          `r [${callSign}] Прибываем под посадку на 1 путь ст. Приволжск.${assistantText}`,
          `r [${callSign}] Прибыли под посадку на 1 путь ст. Приволжск. Интервал: 1 минута.${assistantText}`,
          `r [${callSign}] Вижу, Ч1 два жёлтых, верхний мигающий, отправляемся со ст. Приволжск на перегон до ст. Невский…`,
          `r [${callSign}] ...пл. Азино без остановки.${assistantText}`,
          `r [${callSign}] Машинист ${lowLocomotivePlural}-${locomotiveNumber} на приближении к ст. Невский, вижу Ч зелёный.`,
          `r [${callSign}] Прибываем на 1 путь ст. Невский.${assistantText}`,
          `r [${callSign}] Прибыли на 1 путь ст. Невский. Интервал: 1 минута.${assistantText}`,
          `r [${callSign}] Вижу Ч1 зелёный, отправляемся со ст. Невский на перегон до ст. Мирный…`,
          `r [${callSign}] ...пл. 47 км. без остановки.${assistantText}`,
          `r [${callSign}] Машинист ${lowLocomotivePlural}-${locomotiveNumber} на приближении к ст. Мирный, вижу, Ч жёлтый.`,
          `r [${callSign}] Прибываем на 2 путь ст. Мирный.${assistantText}`,
          `r [${callSign}] Прибыли на 2 путь ст. Мирный. Интервал: 1 минута.${assistantText}`,
          `r [${callSign}] Вижу ЧМ2 лунно-белый, отправляемся со ст. Мирный на канаву №2 ТЧЭ-1.${assistantText}`,
          `r [${callSign}] Прибыли в депо на канаву №2. Закрепляем локомотив.`,
          `r [${callSign}] Состав закреплён двумя тормозными башмаками: один с чётной стороны, один с нечётной и одним ручным тормозом.${assistantText}`,
        )
      }
    } else if (selectedDirection === "Мирный-Приволжск") {
      if (selectedType === "Рейс с ДНЦ") {
        if (selectedRole === "Машинист") {
          reports.push(
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr Машинист ${dispatcherName}, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `cr Заполнили документацию. Магистраль продули, башмаки убрали, состав готов к выезду на линию.`,
            `tr ${passNumber} Понятно, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `tr ${passNumber} Заполнили документацию. Магистраль продули, башмаки убрали, ожидайте отправления.`,
            `cr Принято.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Мирный готов, НМ1 лунно-белый.`,
            `cr Принято, выполняю!`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} следует по перегону из депо ТЧЭ-1 до ст. Мирный.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 1 путь ст. Мирный, машинист ${dispatcherName}.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 1 путь ст. Мирный, ожидайте 1 минуту.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 1 путь ст. Мирный, стоянка 1 минута.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Невский готов, Н1 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Мирный на перегон до ст. Невский.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 4 путь ст. Невский, машинист ${dispatcherName}.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 4 путь ст. Невский, ожидайте 1 минуту.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 4 путь ст. Невский, стоянка 1 минута.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Приволжск готов, Н4 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Невский на перегон до ст. Приволжск.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 2 путь ст. Приволжск. Машинист: ${dispatcherName}.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 2 путь ст. Приволжск, ожидайте 1 минуту.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 2 путь ст. Приволжск, стоянка 1 минута.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут в депо ТЧЭ-1 готов, Н2 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Приволжск в депо ТЧЭ-1.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1. Рейс № ${flightNumber} окончен, локомотив сдан, машинист ${dispatcherName}!`,
            `tr ${passNumber} Понятно! Прибыли в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
          )
        } else if (selectedRole === "Диспетчер") {
          reports.push(
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ ${dispatcherName}, слушаю.`,
            `cr Машинист Фамилия, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `cr Заполнили документацию. Магистраль продули, башмаки убрали, состав готов к выезду на линию.`,
            `tr ${passNumber} Понятно, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `tr ${passNumber} Заполнили документацию. Магистраль продули, башмаки убрали, ожидайте отправления.`,
            `cr Принято.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Мирный готов, НМ1 лунно-белый.`,
            `cr Принято, выполняю!`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} следует по перегону из депо ТЧЭ-1 до ст. Мирный.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ ${dispatcherName}, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 1 путь ст. Мирный, машинист Фамилия.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 1 путь ст. Мирный, ожидайте 1 минуту.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 1 путь ст. Мирный, стоянка 1 минута.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Невский готов, Н1 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Мирный на перегон до ст. Невский.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ ${dispatcherName}, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 4 путь ст. Невский, машинист Фамилия.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 4 путь ст. Невский, ожидайте 1 минуту.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 4 путь ст. Невский, стоянка 1 минута.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Приволжск готов, Н4 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Невский на перегон до ст. Приволжск.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ ${dispatcherName}, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 2 путь ст. Приволжск. Машинист: Фамилия.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 2 путь ст. Приволжск, ожидайте 1 минуту.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 2 путь ст. Приволжск, стоянка 1 минута.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут в депо ТЧЭ-1 готов, Н2 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Приволжск в депо ТЧЭ-1.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1. Рейс № ${flightNumber} окончен, локомотив сдан, машинист Фамилия!`,
            `tr ${passNumber} Понятно! Прибыли в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
          )
        }
      } else if (selectedType === "Автономный") {
        reports.push(
          `r [${callSign}] Приняли ${lowerLocomotive}-${locomotiveNumber} №${flightNumber}, заполнили документацию.`,
          `r [${callSign}] Убираем башмаки, откручиваем ручной, продуваем тормозную магистраль.`,
          `r [${callSign}] Магистраль продули, башмаки убрали, состав готов к выезду на линию.${assistantText}`,
          `r [${callSign}] Вижу НМ1 лунно-белый, выезжаем под посадку на 1 путь ст. Мирный.${assistantText}`,
          `r [${callSign}] Прибыли под посадку на 1 путь ст. Мирный. Интервал: 1 минута.${assistantText}`,
          `r [${callSign}] Вижу Н1 зелёный, отправляемся со ст. Мирный на перегон до ст. Невский,..`,
          `r [${callSign}]...О.П. 47км без остановки.${assistantText}`,
          `r [${callSign}] Машинист ${lowLocomotivePlural}-${locomotiveNumber} на приближении к ст. Невский, вижу Н два жёлтых, верхний мигающий.`,
          `r [${callSign}] Прибываем на 4 путь ст. Невский.${assistantText}`,
          `r [${callSign}] Прибыли на 4 путь ст. Невский. Интервал: 1 минута.${assistantText}`,
          `r [${callSign}] Вижу Н4 зелёный, отправляемся со ст. Невский на перегон до ст. Приволжск,..`,
          `r [${callSign}]...пл. Азино без остановки.${assistantText}`,
          `r [${callSign}] Машинист ${lowLocomotivePlural}-${locomotiveNumber} на приближении к ст. Приволжск, вижу Н два жёлтых, верхний мигающий.`,
          `r [${callSign}] Прибываем на 2 путь ст. Приволжск.${assistantText}`,
          `r [${callSign}] Прибыли на 2 путь ст. Приволжск. Интервал: 1 минута.${assistantText}`,
          `r [${callSign}] Вижу Н2 зелёный, отправляемся со ст. Приволжск на перегон до депо ТЧЭ-1,..`,
          `r [${callSign}]...пл. Жуковский без остановки.${assistantText}`,
          `r [${callSign}] Машинист ${lowLocomotivePlural}-${locomotiveNumber} на приближении к депо ТЧЭ-1, вижу НМ2 лунно-белый.`,
          `r [${callSign}] Прибываем на 1 канаву депо ТЧЭ-1.${assistantText}`,
          `r [${callSign}] Прибыли в депо на канаву №1. Закрепляем локомотив.`,
          `r [${callSign}] Состав закреплён двумя тормозными башмаками: один с чётной стороны, один с нечётной и одним ручным тормозом.${assistantText}`,
        )
      }
    }
  }

  const generateTouristReports = (reports: string[], callSign: string) => {
    const lowerLocomotive = getLowercaseLocomotive(selectedLocomotive!)
    const lowLocomotivePlural = getLowercaseLocomotivePlural(selectedLocomotive!)
    const assistantText = assistantName.length > 0 ? ` Помощник: ${assistantName}.` : ""

    if (selectedDirection === "Приволжск-Мирный") {
      if (selectedType === "Рейс с ДНЦ") {
        if (selectedRole === "Машинист") {
          reports.push(
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr Машинист ${dispatcherName}, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `cr Заполнили документацию. Магистраль продули, башмаки убрали, состав готов к выезду на линию.`,
            `tr ${passNumber} Понятно, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `tr ${passNumber} Заполнили документацию. Магистраль продули, башмаки убрали, ожидайте отправления.`,
            `cr Принято.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Приволжск готов, ЧМ1 лунно-белый.`,
            `cr Принято, выполняю!`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} следует по перегону из депо ТЧЭ-1 до ст. Приволжск.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 1 путь ст. Приволожск, машинист ${dispatcherName}.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 1 путь ст. Приволожск, ожидайте 3 минуты.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 1 путь ст. Приволожск, стоянка 3 минуты.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Невский готов, Ч1 два жёлтых, верхний мигающий.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Приволжск на перегон до ст. Невский.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 1 путь ст. Невский, машинист ${dispatcherName}.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 1 путь ст. Невский, ожидайте 3 минуты.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 1 путь ст. Невский, стоянка 3 минуты.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Мирный готов, Ч1 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Невский на перегон до ст. Мирный.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 2 путь ст. Мирный, машинист ${dispatcherName}.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 2 путь ст. Мирный, ожидайте 3 минуты.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 2 путь ст. Мирный, стоянка 3 минуты.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут в депо ТЧЭ-1 готов, ЧМ2 лунно-белый.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Мирный в депо ТЧЭ-1.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1. Рейс № ${flightNumber} окончен, локомотив сдан, машинист ${dispatcherName}!`,
            `tr ${passNumber} Понятно! Прибыли в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
          )
        } else if (selectedRole === "Диспетчер") {
          reports.push(
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ ${dispatcherName}, слушаю.`,
            `cr Машинист Фамилия, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `cr Заполнили документацию. Магистраль продули, башмаки убрали, состав готов к выезду на линию.`,
            `tr ${passNumber} Понятно, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `tr ${passNumber} Заполнили документацию. Магистраль продули, башмаки убрали, ожидайте отправления.`,
            `cr Принято.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Приволжск готов, ЧМ1 лунно-белый.`,
            `cr Принято, выполняю!`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} следует по перегону из депо ТЧЭ-1 до ст. Приволжск.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ ${dispatcherName}, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 1 путь ст. Приволожск, машинист Фамилия.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 1 путь ст. Приволожск, ожидайте 3 минуты.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 1 путь ст. Приволожск, стоянка 3 минуты.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Невский готов, Ч1 два жёлтых, верхний мигающий.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Приволжск на перегон до ст. Невский.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ ${dispatcherName}, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 1 путь ст. Невский, машинист Фамилия.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 1 путь ст. Невский, ожидайте 3 минуты.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 1 путь ст. Невский, стоянка 3 минуты.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Мирный готов, Ч1 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Невский на перегон до ст. Мирный.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 2 путь ст. Мирный, машинист Фамилия.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 2 путь ст. Мирный, ожидайте 3 минуты.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 2 путь ст. Мирный, стоянка 3 минуты.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут в депо ТЧЭ-1 готов, ЧМ2 лунно-белый.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Мирный в депо ТЧЭ-1.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1. Рейс № ${flightNumber} окончен, локомотив сдан, машинист Фамилия!`,
            `tr ${passNumber} Понятно! Прибыли в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
          )
        }
      } else if (selectedType === "Автономный") {
        reports.push(
          `r [${callSign}] Приняли ${lowerLocomotive}-${locomotiveNumber} №${flightNumber}, заполнили документацию.`,
          `r [${callSign}] Убираем башмаки, откручиваем ручной, продуваем тормозную магистраль.`,
          `r [${callSign}] Магистраль продули, башмаки убрали, состав готов к выезду на линию.${assistantText}`,
          `r [${callSign}] Вижу ЧМ1 лунно-белый, отправляемся из депо ТЧЭ-1 на перегон до ст. Приволжск…`,
          `r [${callSign}] ...пл. Жуковский без остановки.${assistantText}`,
          `r [${callSign}] Машинист ${lowLocomotivePlural}-${locomotiveNumber} на приближении к ст. Приволжск, вижу Ч жёлтый мигающий.`,
          `r [${callSign}] Прибываем под посадку на 1 путь ст. Приволжск.${assistantText}`,
          `r [${callSign}] Прибыли под посадку на 1 путь ст. Приволжск. Интервал: 3 минуты.${assistantText}`,
          `r [${callSign}] Вижу, Ч1 два жёлтых, верхний мигающий, отправляемся со ст. Приволжск на перегон до ст. Невский…`,
          `r [${callSign}] ...пл. Азино без остановки.${assistantText}`,
          `r [${callSign}] Машинист ${lowLocomotivePlural}-${locomotiveNumber} на приближении к ст. Невский, вижу Ч зелёный.`,
          `r [${callSign}] Прибываем на 1 путь ст. Невский.${assistantText}`,
          `r [${callSign}] Прибыли на 1 путь ст. Невский. Интервал: 3 минуты.${assistantText}`,
          `r [${callSign}] Вижу Ч1 зелёный, отправляемся со ст. Невский на перегон до ст. Мирный…`,
          `r [${callSign}] ...пл. 47 км. без остановки.${assistantText}`,
          `r [${callSign}] Машинист ${lowLocomotivePlural}-${locomotiveNumber} на приближении к ст. Мирный, вижу, Ч жёлтый.`,
          `r [${callSign}] Прибываем на 2 путь ст. Мирный.${assistantText}`,
          `r [${callSign}] Прибыли на 2 путь ст. Мирный. Интервал: 3 минуты.${assistantText}`,
          `r [${callSign}] Вижу ЧМ2 лунно-белый, отправляемся со ст. Мирный на канаву №2 ТЧЭ-1.${assistantText}`,
          `r [${callSign}] Прибыли в депо на канаву №2. Закрепляем локомотив.`,
          `r [${callSign}] Состав закреплён двумя тормозными башмаками: один с чётной стороны, один с нечётной и одним ручным тормозом.${assistantText}`,
        )
      }
    } else if (selectedDirection === "Мирный-Приволжск") {
      if (selectedType === "Рейс с ДНЦ") {
        if (selectedRole === "Машинист") {
          reports.push(
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr Машинист ${dispatcherName}, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `cr Заполнили документацию. Магистраль продули, башмаки убрали, состав готов к выезду на линию.`,
            `tr ${passNumber} Понятно, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `tr ${passNumber} Заполнили документацию. Магистраль продули, башмаки убрали, ожидайте отправления.`,
            `cr Принято.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Мирный готов, НМ1 лунно-белый.`,
            `cr Принято, выполняю!`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} следует по перегону из депо ТЧЭ-1 до ст. Мирный.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 1 путь ст. Мирный, машинист ${dispatcherName}.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 1 путь ст. Мирный, ожидайте 3 минуты.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 1 путь ст. Мирный, стоянка 3 минуты.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Невский готов, Н1 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Мирный на перегон до ст. Невский.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 4 путь ст. Невский, машинист ${dispatcherName}.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 4 путь ст. Невский, ожидайте 3 минуты.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 4 путь ст. Невский, стоянка 3 минуты.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Приволжск готов, Н4 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Невский на перегон до ст. Приволжск.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ Фамилия, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 2 путь ст. Приволжск. Машинист: ${dispatcherName}.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 2 путь ст. Приволжск, ожидайте 3 минуты.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 2 путь ст. Приволжск, стоянка 3 минуты.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут в депо ТЧЭ-1 готов, Н2 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Приволжск в депо ТЧЭ-1.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1. Рейс № ${flightNumber} окончен, локомотив сдан, машинист ${dispatcherName}!`,
            `tr ${passNumber} Понятно! Прибыли в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
          )
        } else if (selectedRole === "Диспетчер") {
          reports.push(
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ ${dispatcherName}, слушаю.`,
            `cr Машинист Фамилия, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `cr Заполнили документацию. Магистраль продули, башмаки убрали, состав готов к выезду на линию.`,
            `tr ${passNumber} Понятно, приняли ${lowerLocomotive}-${locomotiveNumber}, Присвоен позывной ${callSign}.`,
            `tr ${passNumber} Заполнили документацию. Магистраль продули, башмаки убрали, ожидайте отправления.`,
            `cr Принято.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Мирный готов, НМ1 лунно-белый.`,
            `cr Принято, выполняю!`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} следует по перегону из депо ТЧЭ-1 до ст. Мирный.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ ${dispatcherName}, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 1 путь ст. Мирный, машинист Фамилия.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 1 путь ст. Мирный, ожидайте 3 минуты.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 1 путь ст. Мирный, стоянка 3 минуты.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Невский готов, Н1 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Мирный на перегон до ст. Невский.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ ${dispatcherName}, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 4 путь ст. Невский, машинист Фамилия.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 4 путь ст. Невский, ожидайте 3 минуты.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 4 путь ст. Невский, стоянка 3 минуты.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут до ст. Приволжск готов, Н4 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Невский на перегон до ст. Приволжск.`,
            `cr Диспетчер!`,
            `tr ${passNumber} ДНЦ ${dispatcherName}, слушаю.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл под посадку на 2 путь ст. Приволжск. Машинист: Фамилия.`,
            `tr ${passNumber} Понятно, прибыли под посадку на 2 путь ст. Приволжск, ожидайте 3 минуты.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл на 2 путь ст. Приволжск, стоянка 3 минуты.`,
            `tr ${passNumber} ${selectedLocomotive}-${locomotiveNumber} ${callSign}, маршрут в депо ТЧЭ-1 готов, Н2 зелёный.`,
            `cr Принято! Выполняю.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} отправляется со ст. Приволжск в депо ТЧЭ-1.`,
            `cr ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1. Рейс № ${flightNumber} окончен, локомотив сдан, машинист Фамилия!`,
            `tr ${passNumber} Понятно! Прибыли в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
            `r [ДНЦ] ${selectedLocomotive}-${locomotiveNumber} ${callSign} прибыл в ТЧЭ-1, рейс ${flightNumber} окончен, локомотив сдан.`,
          )
        }
      } else if (selectedType === "Автономный") {
        reports.push(
          `r [${callSign}] Приняли ${lowerLocomotive}-${locomotiveNumber} №${flightNumber}, заполнили документацию.`,
          `r [${callSign}] Убираем башмаки, откручиваем ручной, продуваем тормозную магистраль.`,
          `r [${callSign}] Магистраль продули, башмаки убрали, состав готов к выезду на линию.${assistantText}`,
          `r [${callSign}] Вижу НМ1 лунно-белый, выезжаем под посадку на 1 путь ст. Мирный.${assistantText}`,
          `r [${callSign}] Прибыли под посадку на 1 путь ст. Мирный. Интервал: 3 минуты.${assistantText}`,
          `r [${callSign}] Вижу Н1 зелёный, отправляемся со ст. Мирный на перегон до ст. Невский,..`,
          `r [${callSign}]...О.П. 47км без остановки.${assistantText}`,
          `r [${callSign}] Машинист ${lowLocomotivePlural}-${locomotiveNumber} на приближении к ст. Невский, вижу Н два жёлтых, верхний мигающий.`,
          `r [${callSign}] Прибываем на 4 путь ст. Невский.${assistantText}`,
          `r [${callSign}] Прибыли на 4 путь ст. Невский. Интервал: 3 минуты.${assistantText}`,
          `r [${callSign}] Вижу Н4 зелёный, отправляемся со ст. Невский на перегон до ст. Приволжск,..`,
          `r [${callSign}]...пл. Азино без остановки.${assistantText}`,
          `r [${callSign}] Машинист ${lowLocomotivePlural}-${locomotiveNumber} на приближении к ст. Приволжск, вижу Н два жёлтых, верхний мигающий.`,
          `r [${callSign}] Прибываем на 2 путь ст. Приволжск.${assistantText}`,
          `r [${callSign}] Прибыли на 2 путь ст. Приволжск. Интервал: 3 минуты.${assistantText}`,
          `r [${callSign}] Вижу Н2 зелёный, отправляемся со ст. Приволжск на перегон до депо ТЧЭ-1,..`,
          `r [${callSign}]...пл. Жуковский без остановки.${assistantText}`,
          `r [${callSign}] Машинист ${lowLocomotivePlural}-${locomotiveNumber} на приближении к депо ТЧЭ-1, вижу НМ2 лунно-белый.`,
          `r [${callSign}] Прибываем на 1 канаву депо ТЧЭ-1.${assistantText}`,
          `r [${callSign}] Прибыли в депо на канаву №1. Закрепляем локомотив.`,
          `r [${callSign}] Состав закреплён двумя тормозными башмаками: один с чётной стороны, один с нечётной и одним ручным тормозом.${assistantText}`,
        )
      }
    }
  }

  const renderReportItem = (report: string, index: number, isOpposite: boolean) => {
    const lineId = `report-${index}`

    // Determine color based on report type
    let colorClass = ""
    if (report.startsWith("cr ")) {
      colorClass = theme.mode === "dark" ? "text-white-400" : "text-black-600"
    } else if (report.startsWith("tr ")) {
      colorClass = theme.mode === "dark" ? "text-white-400" : "text-black-600"
    } else {
      colorClass = theme.mode === "dark" ? "text-white-400" : "text-black-600"
    }

    if (isOpposite) {
      return (
        <div
          key={index}
          className={`w-full p-4 rounded-xl border-2 text-left mb-3 opacity-50 ${
            theme.mode === "dark"
              ? "bg-gradient-to-r from-[#0f1419]/40 to-[#0f1419]/30 border-white/5"
              : "bg-gradient-to-r from-gray-100/60 to-gray-50/40 border-gray-200/50"
          }`}
          style={{
            borderLeftWidth: "4px",
            borderLeftColor: getTieColor() + "30",
          }}
        >
          <code className={`block font-mono text-sm ${colorClass} opacity-70`}>{report}</code>
        </div>
      )
    }

    // Copyable report matching lecture style
    return (
      <button
        key={index}
        onClick={() => copyReport(report, index)}
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
          <code className={`block font-mono text-sm flex-1 ${colorClass}`}>{report}</code>
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: getTieColor() + "20",
            }}
          >
            {copiedIndex === index ? (
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

  const copyReport = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    // Removed the undeclared copyTimestamp variable
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Removed the undeclared isRecentlyCopied function and its related variables
  const isOppositeRole = (report: string) => {
    if (generatedWithType !== "Рейс с ДНЦ" || !generatedWithRole) return false

    // cr = machinist reports, tr/r = dispatcher reports
    if (generatedWithRole === "Машинист") {
      // If user is machinist, tr/r reports are for dispatcher (opposite)
      return report.startsWith("tr ") || report.startsWith("r ")
    } else {
      // If user is dispatcher, cr reports are for machinist (opposite)
      return report.startsWith("cr ")
    }
  }

  const renderOptionButton = (value: string, selectedValue: string | null, label: string, type: string) => {
    const isSelected = selectedValue === value
    return (
      <button
        onClick={() => selectOption(type, value)}
        className={`group relative w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
          isSelected
            ? theme.mode === "dark"
              ? "bg-white/10 shadow-lg"
              : "bg-black/10 shadow-lg"
            : theme.mode === "dark"
              ? "hover:bg-white/5"
              : "hover:bg-black/5"
        }`}
        style={
          isSelected
            ? {
                borderLeft: `4px solid ${getTieColor()}`,
                paddingLeft: "calc(1rem - 4px)",
              }
            : {}
        }
      >
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isSelected
              ? "border-transparent scale-110"
              : theme.mode === "dark"
                ? "border-white/30 group-hover:border-white/50"
                : "border-gray-300 group-hover:border-gray-400"
          }`}
          style={isSelected ? { backgroundColor: getTieColor() } : {}}
        >
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span
          className={`text-base font-medium transition-colors ${
            isSelected
              ? theme.mode === "dark"
                ? "text-white"
                : "text-black"
              : theme.mode === "dark"
                ? "text-white/70 group-hover:text-white"
                : "text-black/70 group-hover:text-black"
          }`}
        >
          {label}
        </span>
      </button>
    )
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
          <Settings className="w-6 h-6" style={{ color: getTieColor() }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
            Составитель докладов
          </h2>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Генератор докладов для рейсов на поезде
          </p>
        </div>
      </div>

      <Card
        className={`border-2 rounded-2xl overflow-hidden ${
          theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <CardHeader
          className="border-b pb-6"
          style={{
            borderColor: getTieColor(),
          }}
        >
          <CardTitle className="text-2xl flex items-center gap-3" style={{ color: getTieColor() }}>
            <Train className="w-6 h-6" />
            Параметры рейса
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5" style={{ color: getTieColor() }} />
              <Label className={`text-lg font-semibold ${theme.mode === "dark" ? "text-white" : "text-black"}`}>
                Направление маршрута
              </Label>
            </div>
            <div className={`space-y-3 p-4 rounded-xl ${theme.mode === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
              {["Мирный-Приволжск", "Приволжск-Мирный"].map((dir) =>
                renderOptionButton(dir, selectedDirection, dir, "direction"),
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-5 h-5" style={{ color: getTieColor() }} />
                <Label className={`text-lg font-semibold ${theme.mode === "dark" ? "text-white" : "text-black"}`}>
                  Тип рейса
                </Label>
              </div>
              <div className={`space-y-3 p-4 rounded-xl ${theme.mode === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                {["Автономный", "Рейс с ДНЦ"].map((type) => renderOptionButton(type, selectedType, type, "type"))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Train className="w-5 h-5" style={{ color: getTieColor() }} />
                <Label className={`text-lg font-semibold ${theme.mode === "dark" ? "text-white" : "text-black"}`}>
                  Категория
                </Label>
              </div>
              <div className={`space-y-3 p-4 rounded-xl ${theme.mode === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                {["Пассажирский", "Туристический"].map((cat) =>
                  renderOptionButton(cat, selectedCategory, cat, "category"),
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Train className="w-5 h-5" style={{ color: getTieColor() }} />
              <Label className={`text-lg font-semibold ${theme.mode === "dark" ? "text-white" : "text-black"}`}>
                Тип локомотива
              </Label>
            </div>
            <div className={`space-y-3 p-4 rounded-xl ${theme.mode === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
              {["Тепловоз ТЭП70БС", "Электровоз ЭП1", "Паровоз ЛВ"].map((loco) =>
                renderOptionButton(loco, selectedLocomotive, loco, "locomotive"),
              )}
            </div>
          </div>

          <Alert
            className={`border-l-4 rounded-xl ${
              theme.mode === "dark" ? "bg-blue-500/10 border-blue-500 backdrop-blur-sm" : "bg-blue-50 border-blue-400"
            }`}
          >
            <AlertCircle className="h-5 w-5 text-blue-400" />
            <AlertDescription className={`text-base ${theme.mode === "dark" ? "text-blue-200" : "text-blue-700"}`}>
              <strong>Важно:</strong> Локомотив "Паровоз ЛВ" используется только для туристических рейсов, мероприятий
              или тестов.
            </AlertDescription>
          </Alert>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label
                className={`text-base font-medium flex items-center gap-2 ${theme.mode === "dark" ? "text-white" : "text-black"}`}
              >
                <Hash className="w-4 h-4" style={{ color: getTieColor() }} />
                Номер локомотива
              </Label>
              <Input
                value={locomotiveNumber}
                onChange={(e) => setLocomotiveNumber(e.target.value)}
                placeholder="Введите номер локомотива..."
                className={`h-12 text-base ${
                  theme.mode === "dark"
                    ? "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    : "bg-white border-gray-300 text-black placeholder:text-gray-400"
                }`}
              />
            </div>
            <div className="space-y-2">
              <Label
                className={`text-base font-medium flex items-center gap-2 ${theme.mode === "dark" ? "text-white" : "text-black"}`}
              >
                <Hash className="w-4 h-4" style={{ color: getTieColor() }} />
                Номер ПАССа
              </Label>
              <Input
                value={passNumber}
                onChange={(e) => setPassNumber(e.target.value)}
                placeholder="Введите номер ПАССа..."
                className={`h-12 text-base ${
                  theme.mode === "dark"
                    ? "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    : "bg-white border-gray-300 text-black placeholder:text-gray-400"
                }`}
              />
            </div>
            <div className="space-y-2">
              <Label
                className={`text-base font-medium flex items-center gap-2 ${theme.mode === "dark" ? "text-white" : "text-black"}`}
              >
                <Hash className="w-4 h-4" style={{ color: getTieColor() }} />
                Номер рейса
              </Label>
              <Input
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="Введите номер рейса..."
                className={`h-12 text-base ${
                  theme.mode === "dark"
                    ? "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    : "bg-white border-gray-300 text-black placeholder:text-gray-400"
                }`}
              />
            </div>

            {selectedType === "Рейс с ДНЦ" && (
              <>
                <div className="space-y-2">
                  <Label
                    className={`text-base font-medium flex items-center gap-2 ${theme.mode === "dark" ? "text-white" : "text-black"}`}
                  >
                    <User className="w-4 h-4" style={{ color: getTieColor() }} />
                    Фамилия
                  </Label>
                  <Input
                    value={dispatcherName}
                    onChange={(e) => setDispatcherName(e.target.value)}
                    placeholder="Введите фамилию..."
                    className={`h-12 text-base ${
                      theme.mode === "dark"
                        ? "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        : "bg-white border-gray-300 text-black placeholder:text-gray-400"
                    }`}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5" style={{ color: getTieColor() }} />
                    <Label className={`text-lg font-semibold ${theme.mode === "dark" ? "text-white" : "text-black"}`}>
                      Ваша роль
                    </Label>
                  </div>
                  <div className={`space-y-3 p-4 rounded-xl ${theme.mode === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                    {["Машинист", "Диспетчер"].map((role) => renderOptionButton(role, selectedRole, role, "role"))}
                  </div>
                </div>
              </>
            )}

            {selectedType === "Автономный" && (
              <div className="space-y-2">
                <Label
                  className={`text-base font-medium flex items-center gap-2 ${theme.mode === "dark" ? "text-white" : "text-black"}`}
                >
                  <User className="w-4 h-4" style={{ color: getTieColor() }} />
                  Имя и фамилия помощника <span className="text-sm opacity-60">(необязательно)</span>
                </Label>
                <Input
                  value={assistantName}
                  onChange={(e) => setAssistantName(e.target.value)}
                  placeholder="Введите имя и фамилию помощника..."
                  className={`h-12 text-base ${
                    theme.mode === "dark"
                      ? "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      : "bg-white border-gray-300 text-black placeholder:text-gray-400"
                  }`}
                />
              </div>
            )}
          </div>

          <Button
            onClick={generateReport}
            className="w-full text-white text-lg font-bold h-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            size="lg"
            style={{
              backgroundColor: getTieColor(),
              boxShadow: `0 4px 20px ${getTieColor()}40`,
            }}
          >
            Сгенерировать доклад
          </Button>

          {showNotification && (
            <Alert
              className={`border-l-4 rounded-xl animate-in slide-in-from-top-2 ${
                theme.mode === "dark" ? "bg-red-500/10 border-red-500" : "bg-red-50 border-red-400"
              }`}
            >
              <AlertCircle className="h-5 w-5 text-red-400" />
              <AlertDescription
                className={`text-base font-semibold ${theme.mode === "dark" ? "text-red-200" : "text-red-700"}`}
              >
                Не всё заполнено! Проверьте все обязательные поля.
              </AlertDescription>
            </Alert>
          )}

          {generatedReports.length > 0 && (
            <div className="space-y-4 mt-8 pt-8 border-t-2" style={{ borderColor: getTieColor() + "30" }}>
              <h3
                className={`font-bold text-2xl mb-4 flex items-center gap-2 ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}
              >
                <Settings className="w-8 h-8" />
                <span>Сгенерированные доклады</span>
              </h3>
              <div className="space-y-0">
                {generatedReports.map((report, index) => {
                  const isOpposite = isOppositeRole(report)
                  return renderReportItem(report, index, isOpposite)
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

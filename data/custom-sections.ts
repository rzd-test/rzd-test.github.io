import type { UserRole } from "./users"

export interface CustomSectionContent {
  id: string
  type: "text" | "heading" | "image" | "table" | "list" | "divider"
  content: any
  style?: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    fontSize?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl"
    color?: string
    align?: "left" | "center" | "right"
  }
}

export interface CustomSection {
  id: string
  title: string
  description: string
  icon: string // Icon name from lucide-react
  content: CustomSectionContent[]
  hiddenFromRoles: UserRole[]
  createdAt: string
  updatedAt: string
  createdBy: string
  order: number
}

// Get custom sections from localStorage
export function getCustomSections(): CustomSection[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem("customSections")
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

// Save custom sections to localStorage
export function saveCustomSections(sections: CustomSection[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("customSections", JSON.stringify(sections))
}

// Add a new custom section
export function addCustomSection(section: Omit<CustomSection, "id" | "createdAt" | "updatedAt">): CustomSection {
  const sections = getCustomSections()
  const newSection: CustomSection = {
    ...section,
    id: `custom-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  sections.push(newSection)
  saveCustomSections(sections)
  return newSection
}

// Update an existing custom section
export function updateCustomSection(
  id: string,
  updates: Partial<Omit<CustomSection, "id" | "createdAt">>,
): CustomSection | null {
  const sections = getCustomSections()
  const index = sections.findIndex((s) => s.id === id)

  if (index === -1) return null

  sections[index] = {
    ...sections[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveCustomSections(sections)
  return sections[index]
}

// Delete a custom section
export function deleteCustomSection(id: string): boolean {
  const sections = getCustomSections()
  const filtered = sections.filter((s) => s.id !== id)

  if (filtered.length === sections.length) return false

  saveCustomSections(filtered)
  return true
}

// Get sections visible to a specific role
export function getVisibleSections(role: UserRole): CustomSection[] {
  const sections = getCustomSections()
  return sections.filter((s) => !s.hiddenFromRoles.includes(role)).sort((a, b) => a.order - b.order)
}

// Check if a role can see a section
export function canSeeSection(section: CustomSection, role: UserRole): boolean {
  return !section.hiddenFromRoles.includes(role)
}

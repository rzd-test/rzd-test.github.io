import type { Position, UserRole } from "./positions"

export interface PositionData {
  name: Position
  role: UserRole
  order: number
}

// Get custom positions from localStorage
export function getCustomPositions(): PositionData[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem("customPositions")
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

// Save custom positions to localStorage
export function saveCustomPositions(positions: PositionData[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("customPositions", JSON.stringify(positions))
}

// Add a new position
export function addPosition(name: string, role: UserRole): PositionData {
  const positions = getCustomPositions()
  const newPosition: PositionData = {
    name: name as Position,
    role,
    order: positions.length,
  }
  positions.push(newPosition)
  saveCustomPositions(positions)
  return newPosition
}

// Update a position
export function updatePosition(oldName: Position, newName: string, newRole: UserRole): PositionData | null {
  const positions = getCustomPositions()
  const index = positions.findIndex((p) => p.name === oldName)

  if (index === -1) return null

  positions[index] = {
    ...positions[index],
    name: newName as Position,
    role: newRole,
  }

  saveCustomPositions(positions)
  return positions[index]
}

// Delete a position
export function deletePosition(name: Position): boolean {
  const positions = getCustomPositions()
  const filtered = positions.filter((p) => p.name !== name)

  if (filtered.length === positions.length) return false

  saveCustomPositions(filtered)
  return true
}

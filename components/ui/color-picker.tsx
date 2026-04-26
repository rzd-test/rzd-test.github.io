"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pipette } from "lucide-react"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [hexInput, setHexInput] = useState(value)
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(50)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Convert hex to HSL
  useEffect(() => {
    const hex = value.replace("#", "")
    const r = Number.parseInt(hex.substring(0, 2), 16) / 255
    const g = Number.parseInt(hex.substring(2, 4), 16) / 255
    const b = Number.parseInt(hex.substring(4, 6), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6
          break
        case g:
          h = ((b - r) / d + 2) / 6
          break
        case b:
          h = ((r - g) / d + 4) / 6
          break
      }
    }

    setHue(Math.round(h * 360))
    setSaturation(Math.round(s * 100))
    setLightness(Math.round(l * 100))
    setHexInput(value)
  }, [value])

  // Convert HSL to hex
  const hslToHex = (h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l)
    const toHex = (n: number) => {
      const hex = n.toString(16)
      return hex.length === 1 ? "0" + hex : hex
    }
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
  }

  // Draw color wheel
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    const size = canvas.width
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 5

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw color wheel using pixel manipulation for better performance
    const imageData = ctx.createImageData(size, size)
    const data = imageData.data

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX
        const dy = y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= radius) {
          // Calculate hue from angle
          let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
          if (angle < 0) angle += 360

          // Calculate saturation from distance (0 at center, 100 at edge)
          const sat = (distance / radius) * 100

          // Convert HSL to RGB
          const hsl = `hsl(${angle}, ${sat}%, 50%)`
          const rgb = hslToRgb(angle, sat, 50)

          const index = (y * size + x) * 4
          data[index] = rgb.r
          data[index + 1] = rgb.g
          data[index + 2] = rgb.b
          data[index + 3] = 255
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }, [showPicker])

  const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100
    l /= 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2
    let r = 0
    let g = 0
    let b = 0

    if (h >= 0 && h < 60) {
      r = c
      g = x
      b = 0
    } else if (h >= 60 && h < 120) {
      r = x
      g = c
      b = 0
    } else if (h >= 120 && h < 180) {
      r = 0
      g = c
      b = x
    } else if (h >= 180 && h < 240) {
      r = 0
      g = x
      b = c
    } else if (h >= 240 && h < 300) {
      r = x
      g = 0
      b = c
    } else if (h >= 300 && h < 360) {
      r = c
      g = 0
      b = x
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    const dx = x - centerX
    const dy = y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const radius = canvas.width / 2 - 5

    if (distance > radius) return

    // Calculate hue from angle
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
    if (angle < 0) angle += 360

    // Calculate saturation from distance
    const sat = Math.min((distance / radius) * 100, 100)

    setHue(Math.round(angle))
    setSaturation(Math.round(sat))

    const newColor = hslToHex(Math.round(angle), Math.round(sat), lightness)
    setHexInput(newColor)
    onChange(newColor)
  }

  const handleHexInput = (value: string) => {
    setHexInput(value)
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value)
    }
  }

  const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLightness = Number.parseInt(e.target.value)
    setLightness(newLightness)
    const newColor = hslToHex(hue, saturation, newLightness)
    setHexInput(newColor)
    onChange(newColor)
  }

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false)
      }
    }

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showPicker])

  return (
    <div className="space-y-2">
      {label && <Label className="text-base font-medium text-white">{label}</Label>}
      <div className="relative" ref={pickerRef}>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="w-16 h-12 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all shadow-md hover:scale-105"
            style={{ backgroundColor: value }}
          />
          <Input
            value={hexInput}
            onChange={(e) => handleHexInput(e.target.value)}
            placeholder="#000000"
            className="flex-1 h-12 text-base font-mono uppercase bg-white/5 border-white/10 text-white"
            maxLength={7}
          />
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="px-4 h-12 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all bg-white/5 hover:bg-white/10 text-white"
          >
            <Pipette className="w-5 h-5" />
          </button>
        </div>

        {showPicker && (
          <div className="absolute top-full left-0 mt-2 p-4 bg-black/95 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-2xl z-50 space-y-4 w-full max-w-[320px]">
            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              onClick={handleCanvasClick}
              className="cursor-crosshair rounded-full mx-auto block"
            />

            <div className="space-y-2">
              <Label className="text-white text-sm">Яркость</Label>
              <input
                type="range"
                min="0"
                max="100"
                value={lightness}
                onChange={handleLightnessChange}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer brightness-slider"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(${hue}, ${saturation}%, 0%), 
                    hsl(${hue}, ${saturation}%, 50%), 
                    hsl(${hue}, ${saturation}%, 100%))`,
                }}
              />
              <style jsx>{`
                .brightness-slider::-webkit-slider-thumb {
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: ${value};
                  cursor: pointer;
                  border: 3px solid white;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                }
                .brightness-slider::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: ${value};
                  cursor: pointer;
                  border: 3px solid white;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                }
              `}</style>
            </div>

            <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg">
              <div className="w-12 h-12 rounded-lg border-2 border-white/30" style={{ backgroundColor: value }} />
              <div className="flex-1 text-white">
                <div className="text-sm font-mono">{hexInput}</div>
                <div className="text-xs text-white/60">
                  HSL({hue}°, {saturation}%, {lightness}%)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

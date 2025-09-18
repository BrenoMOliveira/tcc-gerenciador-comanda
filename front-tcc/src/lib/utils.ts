import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const numberFormatter = new Intl.NumberFormat("pt-BR")

export function formatCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return currencyFormatter.format(0)
  }

  return currencyFormatter.format(value)
}

export function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return numberFormatter.format(0)
  }

  return numberFormatter.format(value)
}

export function formatPercentage(value: number, fractionDigits = 1) {
  if (!Number.isFinite(value)) {
    return "0%"
  }

  if (value === 0) {
    return "0%"
  }

  const formatted = Math.abs(value)
    .toFixed(fractionDigits)
    .replace(".", ",")

  return `${value > 0 ? "+" : "-"}${formatted}%`
}

export function formatShortDateLabel(date: string) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return parsed.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
}

export type Trend = "positive" | "negative" | "neutral"

export function getTrendFromValue(value: number | null | undefined): Trend {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "neutral"
  }

  if (value > 0) {
    return "positive"
  }

  if (value < 0) {
    return "negative"
  }

  return "neutral"
}
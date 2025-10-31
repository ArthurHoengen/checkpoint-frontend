import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSessionId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleString('pt-BR')
}

export function getRiskLevelColor(riskLevel?: string): string {
  switch (riskLevel) {
    case 'low':
      return 'text-green-600'
    case 'medium':
      return 'text-yellow-600'
    case 'high':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export function getRiskLevelBg(riskLevel?: string): string {
  switch (riskLevel) {
    case 'low':
      return 'bg-green-100'
    case 'medium':
      return 'bg-yellow-100'
    case 'high':
      return 'bg-red-100'
    default:
      return 'bg-gray-100'
  }
}
import {
  ScanConfidence,
  ScanVerdict,
  Signal,
} from "@/lib/scan/types"

export interface ScanStartedEvent {
  type: "scan_started"
  scanId: string
  userId: string
  status: string
  updatedAt: string
}

export interface ScanCompletedEvent {
  type: "scan_completed"
  scanId: string
  finalScore: number
  confidence: ScanConfidence
  verdict: ScanVerdict
  signals?: Signal[]
}

export interface ScanFailedEvent {
  type: "scan_failed"
  scanId: string
  userId?: string
  message?: string
}

export interface SubscriptionUpdatedEvent {
  type: "subscription_updated"
  userId?: string
}

export interface PaymentSucceededEvent {
  type: "payment_succeeded"
  userId?: string
}

export interface PaymentFailedEvent {
  type: "payment_failed"
  userId?: string
}

export type UserStreamEvent =
  | ScanStartedEvent
  | ScanCompletedEvent
  | ScanFailedEvent
  | SubscriptionUpdatedEvent
  | PaymentSucceededEvent
  | PaymentFailedEvent

export function isUserStreamEvent(value: unknown): value is UserStreamEvent {
  if (!value || typeof value !== "object") return false

  const type = (value as { type?: string }).type

  return (
    type === "scan_started" ||
    type === "scan_completed" ||
    type === "scan_failed" ||
    type === "subscription_updated" ||
    type === "payment_succeeded" ||
    type === "payment_failed"
  )
}

export function shouldRefetchScans(event: UserStreamEvent): boolean {
  return (
    event.type === "scan_completed" || event.type === "scan_failed"
  )
}

export function getUserChannel(userId: string): string {
  return `users:${userId}`
}

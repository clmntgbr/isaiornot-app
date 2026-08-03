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

/** Payload shared by user_created / user_updated (Clerk webhook or lazy-create). */
export interface UserLifecycleEvent {
  type: "user_created" | "user_updated"
  userId: string
  clerkId: string
  firstName: string
  lastName: string
  email: string
  createdAt: string
  updatedAt: string
}

export type UserStreamEvent =
  | ScanStartedEvent
  | ScanCompletedEvent
  | ScanFailedEvent
  | SubscriptionUpdatedEvent
  | PaymentSucceededEvent
  | PaymentFailedEvent
  | UserLifecycleEvent

export function isUserStreamEvent(value: unknown): value is UserStreamEvent {
  if (!value || typeof value !== "object") return false

  const type = (value as { type?: string }).type

  return (
    type === "scan_started" ||
    type === "scan_completed" ||
    type === "scan_failed" ||
    type === "subscription_updated" ||
    type === "payment_succeeded" ||
    type === "payment_failed" ||
    type === "user_created" ||
    type === "user_updated"
  )
}

export function shouldRefetchScans(event: UserStreamEvent): boolean {
  return event.type === "scan_completed" || event.type === "scan_failed"
}

export function isUserLifecycleEvent(
  event: UserStreamEvent
): event is UserLifecycleEvent {
  return event.type === "user_created" || event.type === "user_updated"
}

/** Builds `users:{internalUserId}` — prefer `channel` from `/api/realtime/connection`. */
export function getUserChannel(userId: string): string {
  return `users:${userId}`
}

import {
  AnalysisConfidence,
  AnalysisVerdict,
  Signal,
} from "@/lib/analysis/types"

export interface AnalysisStartedEvent {
  type: "analysis_started"
  analysisId: string
  userId: string
  status: string
  updatedAt: string
}

export interface AnalysisCompletedEvent {
  type: "analysis_completed"
  analysisId: string
  finalScore: number
  confidence: AnalysisConfidence
  verdict: AnalysisVerdict
  signals?: Signal[]
}

export interface AnalysisFailedEvent {
  type: "analysis_failed"
  analysisId: string
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
  | AnalysisStartedEvent
  | AnalysisCompletedEvent
  | AnalysisFailedEvent
  | SubscriptionUpdatedEvent
  | PaymentSucceededEvent
  | PaymentFailedEvent

export function isUserStreamEvent(value: unknown): value is UserStreamEvent {
  if (!value || typeof value !== "object") return false

  const type = (value as { type?: string }).type

  return (
    type === "analysis_started" ||
    type === "analysis_completed" ||
    type === "analysis_failed" ||
    type === "subscription_updated" ||
    type === "payment_succeeded" ||
    type === "payment_failed"
  )
}

export function shouldRefetchAnalyses(event: UserStreamEvent): boolean {
  return (
    event.type === "analysis_completed" || event.type === "analysis_failed"
  )
}

export function getUserChannel(userId: string): string {
  return `users:${userId}`
}

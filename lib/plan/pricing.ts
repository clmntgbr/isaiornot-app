import type { Plan, Quota } from "./types"

export const PLAN_ORDER = ["free", "starter", "pro", "business"] as const

export type PlanSlug = (typeof PLAN_ORDER)[number]

export interface PlanMeta {
  tagline: string
  cta: string
  highlight: boolean
  extraFeatures: string[]
}

export const PLAN_META: Record<PlanSlug, PlanMeta> = {
  free: {
    tagline: "To explore",
    cta: "Start for free",
    highlight: false,
    extraFeatures: ["Community support"],
  },
  starter: {
    tagline: "To get started",
    cta: "Choose Starter",
    highlight: false,
    extraFeatures: ["Email support"],
  },
  pro: {
    tagline: "Most popular",
    cta: "Choose Pro",
    highlight: true,
    extraFeatures: ["Priority support"],
  },
  business: {
    tagline: "For teams",
    cta: "Choose Business",
    highlight: false,
    extraFeatures: ["Dedicated support", "Per sub-signal detail"],
  },
}

export function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function getPlanForInterval(
  plans: Plan[],
  slug: string,
  interval: string
): Plan | undefined {
  const exact = plans.find(
    (plan) =>
      plan.slug === slug &&
      plan.billingInterval === interval &&
      plan.isActive
  )
  if (exact) return exact

  // Free (and similar) may only exist monthly
  if (interval === "annually") {
    return plans.find(
      (plan) =>
        plan.slug === slug &&
        plan.billingInterval === "monthly" &&
        plan.isActive
    )
  }

  return undefined
}

export function getQuotaFeatures(quota: Quota): string[] {
  const features: string[] = [
    `${quota.maxImagesPerMonth.toLocaleString("en-US")} images / month`,
  ]

  if (quota.maxVideosPerMonth > 0) {
    features.push(
      `${quota.maxVideosPerMonth.toLocaleString("en-US")} videos / month`
    )
  } else {
    features.push("Videos not included")
  }

  features.push(`Images up to ${formatBytes(quota.maxFileSizeImage)}`)

  if (quota.maxFileSizeVideo > 0) {
    features.push(`Videos up to ${formatBytes(quota.maxFileSizeVideo)}`)
  }

  features.push(
    quota.fullPipeline
      ? "Full pipeline"
      : "Standard pipeline (metadata & heuristics)"
  )
  features.push(`History ${formatRetention(quota.historyRetention)}`)

  return features
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "—"
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(0)} GB`
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-US")
}

/** Go duration in nanoseconds → human label */
export function formatRetention(nanoseconds: number): string {
  const days = nanoseconds / (24 * 60 * 60 * 1e9)

  if (days >= 365) {
    const years = Math.round(days / 365)
    return `${years} year${years > 1 ? "s" : ""}`
  }

  if (days >= 30) {
    const months = Math.round(days / 30)
    return `${months} month${months > 1 ? "s" : ""}`
  }

  const roundedDays = Math.round(days)
  return `${roundedDays} day${roundedDays > 1 ? "s" : ""}`
}

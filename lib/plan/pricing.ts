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
    tagline: "Pour découvrir",
    cta: "Commencer gratuitement",
    highlight: false,
    extraFeatures: ["Support communautaire"],
  },
  starter: {
    tagline: "Pour démarrer",
    cta: "Choisir Starter",
    highlight: false,
    extraFeatures: ["Support email"],
  },
  pro: {
    tagline: "Le plus populaire",
    cta: "Choisir Pro",
    highlight: true,
    extraFeatures: ["Support prioritaire"],
  },
  business: {
    tagline: "Pour les équipes",
    cta: "Choisir Business",
    highlight: false,
    extraFeatures: ["Support dédié", "Détail par sous-signal"],
  },
}

export function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
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
    `${quota.maxImagesPerMonth.toLocaleString("fr-FR")} images / mois`,
  ]

  if (quota.maxVideosPerMonth > 0) {
    features.push(
      `${quota.maxVideosPerMonth.toLocaleString("fr-FR")} vidéos / mois`
    )
  } else {
    features.push("Vidéos non incluses")
  }

  features.push(`Images jusqu'à ${formatBytes(quota.maxFileSizeImage)}`)

  if (quota.maxFileSizeVideo > 0) {
    features.push(`Vidéos jusqu'à ${formatBytes(quota.maxFileSizeVideo)}`)
  }

  features.push(quota.fullPipeline ? "Pipeline complet" : "Pipeline standard (metadata & heuristiques)")
  features.push(`Historique ${formatRetention(quota.historyRetention)}`)

  return features
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "—"
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(0)} Mo`
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(0)} Go`
}

export function formatCount(value: number): string {
  return value.toLocaleString("fr-FR")
}

/** Go duration in nanoseconds → human label */
export function formatRetention(nanoseconds: number): string {
  const days = nanoseconds / (24 * 60 * 60 * 1e9)

  if (days >= 365) {
    const years = Math.round(days / 365)
    return `${years} an${years > 1 ? "s" : ""}`
  }

  if (days >= 30) {
    return `${Math.round(days / 30)} mois`
  }

  return `${Math.round(days)} jours`
}

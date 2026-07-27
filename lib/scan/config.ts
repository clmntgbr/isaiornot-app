import type {
  ScanConfidence,
  ScanStatus,
  ScanVerdict,
  Insight,
  InsightKey,
} from "./types"

export type VerdictIcon = "shield-check" | "user" | "help-circle" | "bot"

export interface VerdictConfig {
  short: string
  label: string
  description: string
  icon: VerdictIcon
  bg: string
  color: string
  border: string
}

export const VERDICT_CONFIG: Record<ScanVerdict, VerdictConfig> = {
  likely_ai: {
    short: "IA",
    label: "Probablement IA",
    description:
      "Plusieurs indicateurs suggèrent une génération ou une manipulation par IA.",
    icon: "bot",
    bg: "bg-destructive/10",
    color: "text-destructive",
    border: "border-destructive/20",
  },
  likely_real: {
    short: "Réel",
    label: "Probablement réel",
    description:
      "Les signaux analysés sont cohérents avec un contenu authentique.",
    icon: "shield-check",
    bg: "bg-primary/10",
    color: "text-primary",
    border: "border-primary/20",
  },
  uncertain: {
    short: "Incertain",
    label: "Incertain",
    description:
      "Les résultats sont mitigés ; une vérification humaine reste recommandée.",
    icon: "help-circle",
    bg: "bg-muted",
    color: "text-muted-foreground",
    border: "border-border",
  },
}

export const VERDICT_COLOR_VAR: Record<ScanVerdict, string> = {
  likely_real: "--primary",
  uncertain: "--chart-3",
  likely_ai: "--destructive",
}

export type ConfidenceIcon =
  | "signal-high"
  | "signal-medium"
  | "signal-low"
  | "help-circle"

export interface ConfidenceConfig {
  short: string
  label: string
  icon: ConfidenceIcon
  bg: string
  color: string
  border: string
}

export const CONFIDENCE_CONFIG: Record<ScanConfidence, ConfidenceConfig> = {
  high: {
    short: "Élevée",
    label: "Confiance élevée",
    icon: "signal-high",
    bg: "bg-emerald-500/10",
    color: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  medium: {
    short: "Moyenne",
    label: "Confiance moyenne",
    icon: "signal-medium",
    bg: "bg-amber-500/10",
    color: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  low: {
    short: "Faible",
    label: "Confiance faible",
    icon: "signal-low",
    bg: "bg-orange-500/10",
    color: "text-orange-700 dark:text-orange-400",
    border: "border-orange-500/20",
  },
  unknown: {
    short: "Inconnue",
    label: "Confiance inconnue",
    icon: "help-circle",
    bg: "bg-muted",
    color: "text-muted-foreground",
    border: "border-border",
  },
}

export const CONFIDENCE_LABEL: Record<ScanConfidence, string> = {
  low: "faible",
  medium: "moyenne",
  high: "élevée",
  unknown: "inconnue",
}

export interface InsightConfig {
  label: string
  description: string
  help?: string
}

export const INSIGHT_CONFIG: Record<InsightKey, InsightConfig> = {
  noise: {
    label: "Bruit",
    description: "Analyse du bruit résiduel et de sa cohérence spatiale.",
    help: "Le bruit est une composante indésirable de l’image qui peut être causée par le processus de compression ou par des artefacts de quantification. Il peut être utilisé pour évaluer la qualité de l’image et la présence de compression.",
  },
  compression: {
    label: "Compression",
    description: "Traces de compression et artefacts de quantification.",
    help: "La compression est un processus qui réduit la taille d’un fichier image en supprimant des informations inutiles. Elle peut être utilisée pour réduire la taille des fichiers et pour améliorer la qualité de l’image.",
  },
  frequency: {
    label: "Fréquences",
    description: "Répartition des hautes et basses fréquences de l’image.",
    help: "Les hautes fréquences sont des détails fins et les basses fréquences sont des détails grossiers. La fréquence est utilisée pour évaluer la qualité de l’image et la présence de détails.",
  },
  histogram: {
    label: "Histogramme",
    description: "Distribution des intensités et anomalies statistiques.",
    help: "L’histogramme est un graphique qui montre la distribution des intensités de l’image. Il peut être utilisé pour évaluer la qualité de l’image et la présence d’anomalies statistiques.",
  },
}

export const INSIGHT_KEYS = Object.keys(INSIGHT_CONFIG) as InsightKey[]

export function getInsightEntries(insight: Insight): {
  key: InsightKey
  value: number
  label: string
  description: string
  help?: string
}[] {
  return INSIGHT_KEYS.map((key) => ({
    key,
    value: insight[key],
    label: INSIGHT_CONFIG[key].label,
    description: INSIGHT_CONFIG[key].description,
    help: INSIGHT_CONFIG[key].help,
  }))
}

export function getScanProgress(status: ScanStatus): number {
  if (status === "processing") return 66
  if (status === "pending") return 33
  return 100
}

export function isVideoMedia(
  filenameOrKey: string,
  contentType?: string
): boolean {
  if (contentType?.startsWith("video/")) return true
  return /\.(mp4|mov|webm)$/i.test(filenameOrKey)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function getScanDisplayName(scan: {
  filename?: string
  medias: { filename: string; key: string }[]
}): string {
  if (scan.filename) return scan.filename
  const first = scan.medias[0]
  return first?.filename || first?.key || "Analyse"
}

export function getMediaThumbnailUrl(mediaId: string): string {
  return `/api/medias/${mediaId}/thumbnail`
}

export function getScanThumbnail(scan: {
  medias: { id: string }[]
}): string | undefined {
  const mediaId = scan.medias[0]?.id
  return mediaId ? getMediaThumbnailUrl(mediaId) : undefined
}

export function getScanTotalSize(scan: {
  medias: { size?: number }[]
}): number | undefined {
  const sizes = scan.medias
    .map((media) => media.size)
    .filter((size): size is number => size !== undefined)

  if (sizes.length === 0) return undefined
  return sizes.reduce((total, size) => total + size, 0)
}

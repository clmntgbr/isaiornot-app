import type {
  ScanConfidence,
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
    short: "AI",
    label: "Likely AI",
    description:
      "Several indicators suggest AI generation or manipulation.",
    icon: "bot",
    bg: "bg-destructive/10",
    color: "text-destructive",
    border: "border-destructive/20",
  },
  likely_real: {
    short: "Real",
    label: "Likely real",
    description:
      "The analyzed signals are consistent with authentic content.",
    icon: "shield-check",
    bg: "bg-primary/10",
    color: "text-primary",
    border: "border-primary/20",
  },
  uncertain: {
    short: "Uncertain",
    label: "Uncertain",
    description:
      "Results are mixed; human review is still recommended.",
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
    short: "High",
    label: "High confidence",
    icon: "signal-high",
    bg: "bg-emerald-500/10",
    color: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  medium: {
    short: "Medium",
    label: "Medium confidence",
    icon: "signal-medium",
    bg: "bg-amber-500/10",
    color: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  low: {
    short: "Low",
    label: "Low confidence",
    icon: "signal-low",
    bg: "bg-orange-500/10",
    color: "text-orange-700 dark:text-orange-400",
    border: "border-orange-500/20",
  },
  unknown: {
    short: "Unknown",
    label: "Unknown confidence",
    icon: "help-circle",
    bg: "bg-muted",
    color: "text-muted-foreground",
    border: "border-border",
  },
}

export const CONFIDENCE_LABEL: Record<ScanConfidence, string> = {
  low: "low",
  medium: "medium",
  high: "high",
  unknown: "unknown",
}

export interface InsightConfig {
  label: string
  description: string
  help?: string
}

export const INSIGHT_CONFIG: Record<InsightKey, InsightConfig> = {
  noise: {
    label: "Noise",
    description: "Analysis of residual noise and its spatial consistency.",
    help: "Noise is an unwanted component of the image that can come from compression or quantization artifacts. It can be used to assess image quality and the presence of compression.",
  },
  compression: {
    label: "Compression",
    description: "Compression traces and quantization artifacts.",
    help: "Compression reduces image file size by removing unnecessary information. It can be used to shrink files and may affect perceived image quality.",
  },
  frequency: {
    label: "Frequencies",
    description: "Distribution of high and low frequencies in the image.",
    help: "High frequencies are fine details and low frequencies are coarse structure. Frequency analysis helps assess image quality and the presence of detail.",
  },
  histogram: {
    label: "Histogram",
    description: "Intensity distribution and statistical anomalies.",
    help: "A histogram shows the distribution of image intensities. It can be used to assess image quality and the presence of statistical anomalies.",
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

export function isVideoMedia(
  filenameOrKey: string,
  contentType?: string
): boolean {
  if (contentType?.startsWith("video/")) return true
  return /\.(mp4|mov|webm)$/i.test(filenameOrKey)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getScanDisplayName(scan: {
  filename?: string
  medias: { filename: string; key: string }[]
}): string {
  if (scan.filename) return scan.filename
  const first = scan.medias[0]
  return first?.filename || first?.key || "Scan"
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

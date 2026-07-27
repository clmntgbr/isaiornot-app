"use client"

import { ScanDetailDrawer } from "@/components/scan-detail-drawer"
import { MediaThumbnail } from "@/components/media-thumbnail"
import { Progress } from "@/components/ui/progress"
import {
  CONFIDENCE_CONFIG,
  VERDICT_COLOR_VAR,
  VERDICT_CONFIG,
  formatBytes,
  getScanDisplayName,
  getScanProgress,
  getScanThumbnail,
  getScanTotalSize,
  isVideoMedia,
} from "@/lib/scan/config"
import { Scan, ScanConfidence, ScanVerdict } from "@/lib/scan/types"
import { cn } from "@/lib/utils"
import {
  Bot,
  Check,
  ChevronRight,
  CircleAlert,
  FileVideo,
  HardDrive,
  HelpCircle,
  Loader2,
  ShieldCheck,
  SignalHigh,
  SignalLow,
  SignalMedium,
  User,
} from "lucide-react"
import { useState } from "react"

const VERDICT_ICONS = {
  "shield-check": ShieldCheck,
  user: User,
  "help-circle": HelpCircle,
  bot: Bot,
}

const CONFIDENCE_ICONS = {
  "signal-high": SignalHigh,
  "signal-medium": SignalMedium,
  "signal-low": SignalLow,
  "help-circle": HelpCircle,
}

interface ScanItemProps {
  item: Scan
}

export function ScanItem({ item }: ScanItemProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const primaryMedia = item.medias[0]
  const displayName = getScanDisplayName(item)
  const thumbnail = getScanThumbnail(item)
  const size = getScanTotalSize(item)
  const isVideo = isVideoMedia(
    primaryMedia?.filename || primaryMedia?.key || displayName,
    primaryMedia?.contentType
  )
  const isComplete = item.status === "analyzed" && item.verdict
  const isAnalyzing = item.status === "pending" || item.status === "processing"
  const isFailed = item.status === "failed"
  const progress = getScanProgress(item.status)
  const cfg = item.verdict ? VERDICT_CONFIG[item.verdict] : null

  const canOpenDrawer = isComplete || isFailed

  const openDrawer = () => {
    if (canOpenDrawer) setDrawerOpen(true)
  }

  return (
    <>
      <div
        className={cn(
          "group relative flex items-center gap-4 rounded-2xl border bg-card p-3",
          "transition-all duration-300 ease-out",
          canOpenDrawer &&
            "cursor-pointer hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md",
          isAnalyzing && "border-primary/40 bg-primary/5"
        )}
        onClick={openDrawer}
        role="button"
        tabIndex={canOpenDrawer ? 0 : -1}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && canOpenDrawer) {
            event.preventDefault()
            openDrawer()
          }
        }}
      >
        <div
          className={cn(
            "relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary",
            "transition-transform duration-300 ease-out",
            canOpenDrawer && "group-hover:scale-[1.04]"
          )}
        >
          {thumbnail ? (
            <MediaThumbnail
              src={thumbnail}
              alt={`Aperçu de ${displayName}`}
              className={cn(
                "transition-transform duration-500 ease-out",
                canOpenDrawer && "group-hover:scale-110"
              )}
            />
          ) : isVideo ? (
            <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
              <FileVideo className="size-5" />
              <span className="text-[0.6rem] font-medium">VIDEO</span>
            </div>
          ) : (
            <Bot className="size-5 text-muted-foreground" />
          )}
          {isAnalyzing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Loader2 className="size-5 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="truncate text-sm font-medium text-foreground">
            {displayName}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {size !== undefined && <SizeBadge size={size} />}
            {isComplete &&
            cfg &&
            item.verdict &&
            item.finalScore !== undefined ? (
              <>
                <VerdictBadge verdict={item.verdict} />
                <ScorePill score={item.finalScore} verdict={item.verdict} />
                {item.confidence && (
                  <ConfidenceBadge confidence={item.confidence} />
                )}
              </>
            ) : isAnalyzing ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-primary">
                  {item.status === "processing"
                    ? "Analyse en cours…"
                    : "Préparation…"}
                </span>
                <Progress value={progress} className="h-1.5 w-24" />
              </div>
            ) : isFailed ? (
              <ErrorBadge message={item.message} />
            ) : (
              <span className="text-sm text-muted-foreground">
                Processing...
              </span>
            )}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          {isComplete ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
              <Check className="size-3" />
              Completed
            </span>
          ) : isAnalyzing ? (
            <span
              className="inline-flex size-11 items-center justify-center rounded-full bg-primary/10"
              aria-label="Scan in progress"
            >
              <Loader2 className="size-5 animate-spin text-primary" />
            </span>
          ) : isFailed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs text-destructive">
              <CircleAlert className="size-3" />
              Failed
            </span>
          ) : null}

          {canOpenDrawer && (
            <span
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground opacity-40 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100"
              aria-hidden="true"
            >
              <ChevronRight className="size-4" />
            </span>
          )}
        </div>
      </div>

      <ScanDetailDrawer
        scanId={item.id}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  )
}

function SizeBadge({ size }: { size: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
      <HardDrive className="size-3" />
      {formatBytes(size)}
    </span>
  )
}

function ErrorBadge({ message }: { message?: string | null }) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-1 rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-xs text-destructive"
      title={message ?? "Analyse échouée"}
    >
      <CircleAlert className="size-3 shrink-0" />
      <span className="truncate">{message ?? "Analyse échouée"}</span>
    </span>
  )
}

function VerdictBadge({ verdict }: { verdict: ScanVerdict }) {
  const cfg = VERDICT_CONFIG[verdict]
  const Icon = VERDICT_ICONS[cfg.icon]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
        cfg.bg,
        cfg.color,
        cfg.border
      )}
    >
      <Icon className="size-3" />
      {cfg.short}
    </span>
  )
}

function ConfidenceBadge({ confidence }: { confidence: ScanConfidence }) {
  const cfg = CONFIDENCE_CONFIG[confidence]
  const Icon = CONFIDENCE_ICONS[cfg.icon]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
        cfg.bg,
        cfg.color,
        cfg.border
      )}
      title={cfg.label}
    >
      <Icon className="size-3" />
      {cfg.label}
    </span>
  )
}

function ScorePill({
  score,
  verdict,
}: {
  score: number
  verdict: ScanVerdict
}) {
  const colorVar = VERDICT_COLOR_VAR[verdict]

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs tabular-nums"
      style={{
        backgroundColor: `color-mix(in oklch, var(${colorVar}) 10%, transparent)`,
        color: `var(${colorVar})`,
      }}
    >
      Score {score.toFixed(1)}
    </span>
  )
}

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  formatBytes,
  formatCount,
  formatPrice,
  formatRetention,
} from "@/lib/plan/pricing"
import { createBillingPortalSession } from "@/lib/subscription/api"
import { useSubscription } from "@/lib/subscription/context"
import type { Subscription } from "@/lib/subscription/types"
import { cn } from "@/lib/utils"
import {
  ArrowUpRight,
  CalendarClock,
  CreditCard,
  ExternalLink,
  FileStack,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Timer,
  TrendingUp,
  Video,
} from "lucide-react"
import { useEffect, useState, type ComponentType } from "react"
import { toast } from "sonner"

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Past due",
  canceled: "Canceled",
  cancelled: "Canceled",
  unpaid: "Unpaid",
  incomplete: "Incomplete",
  incomplete_expired: "Expired",
}

const STATUS_BG: Record<string, string> = {
  active:
    "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  trialing: "border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-400",
  past_due:
    "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400",
  unpaid: "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-400",
  canceled: "border-border bg-muted text-muted-foreground",
  cancelled: "border-border bg-muted text-muted-foreground",
  incomplete:
    "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400",
  incomplete_expired: "border-border bg-muted text-muted-foreground",
}

interface SubscriptionPageProps {
  onGoPricing: () => void
  onGoDetect: () => void
}

export function SubscriptionPage({
  onGoPricing,
  onGoDetect,
}: SubscriptionPageProps) {
  const { subscription, isLoading, fetchSubscription } = useSubscription()
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    void fetchSubscription()
  }, [fetchSubscription])

  const handleOpenPortal = async () => {
    setPortalLoading(true)
    try {
      const { url } = await createBillingPortalSession()
      window.location.assign(url)
    } catch {
      toast.error("Unable to open the customer portal", {
        description: "Please try again in a moment.",
      })
      setPortalLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          My subscription
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your plan, usage, and billing.
        </p>
      </div>

      {isLoading && !subscription ? (
        <LoadingState />
      ) : !subscription || !(subscription.effectivePlan ?? subscription.plan) ? (
        <EmptyState onGoPricing={onGoPricing} />
      ) : (
        <SubscriptionContent
          subscription={subscription}
          portalLoading={portalLoading}
          onOpenPortal={handleOpenPortal}
          onGoPricing={onGoPricing}
          onGoDetect={onGoDetect}
        />
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="h-56 w-full animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
      <p className="sr-only">Loading your subscription…</p>
    </div>
  )
}

function EmptyState({ onGoPricing }: { onGoPricing: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-4 p-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CreditCard className="size-6" aria-hidden="true" />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">
          No active subscription
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a plan to unlock analyses.
        </p>
      </div>
      <Button onClick={onGoPricing}>View plans</Button>
    </Card>
  )
}

function SubscriptionContent({
  subscription,
  portalLoading,
  onOpenPortal,
  onGoPricing,
  onGoDetect,
}: {
  subscription: Subscription
  portalLoading: boolean
  onOpenPortal: () => void
  onGoPricing: () => void
  onGoDetect: () => void
}) {
  const plan = subscription.effectivePlan ?? subscription.plan!
  const quota = plan.quota
  const usage = subscription.quotaUsage

  const periodStart = usage?.periodStart ?? subscription.startDate
  const periodEnd = usage?.periodEnd ?? subscription.endDate
  const remainingDays = daysUntil(periodEnd)
  const cycleProgress = computeCycleProgress(periodStart, periodEnd)

  const imagesUsed = usage?.imagesUsed ?? 0
  const imagesMax = usage?.imagesMax ?? quota.maxImagesPerMonth
  const videosUsed = usage?.videosUsed ?? 0
  const videosMax = usage?.videosMax ?? quota.maxVideosPerMonth
  const hasPortal = Boolean(subscription.stripeCustomerId)

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary p-0 gap-0">
        <div className="grid gap-px md:grid-cols-[1.4fr_1fr]">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn("gap-1.5", STATUS_BG[subscription.status])}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Since {formatDate(subscription.startDate)}
              </span>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Your plan
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-4xl font-bold tracking-tight text-foreground">
                {plan.name}
              </span>
              <span className="font-display text-xl font-semibold text-primary">
                {formatPrice(plan.price, plan.currency)}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.billingInterval === "annually" ? "year" : "month"}
                </span>
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {plan.description}
            </p>
          </div>

          <div className="bg-card p-6 sm:p-8">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarClock
                className="size-4 text-primary"
                aria-hidden="true"
              />
              Next renewal
            </div>
            <p className="mt-2 font-display text-xl font-semibold text-foreground">
              {formatDate(periodEnd)}
            </p>
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Current cycle</span>
                <span className="font-medium text-foreground">
                  {remainingDays} days left
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${cycleProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <UsageGauge
          icon={ImageIcon}
          label="Image analyses"
          used={imagesUsed}
          max={imagesMax}
          unit="analyses"
        />
        {videosMax > 0 ? (
          <UsageGauge
            icon={Video}
            label="Video analyses"
            used={videosUsed}
            max={videosMax}
            unit="videos"
          />
        ) : (
          <QuotaCard icon={Video} label="Video analyses" value="Not included" />
        )}
        <QuotaCard
          icon={HardDrive}
          label="History retention"
          value={formatRetention(quota.historyRetention)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Plan details
          </h2>
          <p className="text-sm text-muted-foreground">
            Included limits and capabilities
          </p>
          <div className="mt-4 divide-y">
            <DetailRow
              icon={FileStack}
              label="Analyses per month"
              value={formatCount(imagesMax)}
            />
            <DetailRow
              icon={ImageIcon}
              label="Max image size"
              value={formatBytes(quota.maxFileSizeImage)}
            />
            {quota.maxFileSizeVideo > 0 && (
              <DetailRow
                icon={Video}
                label="Max video size"
                value={formatBytes(quota.maxFileSizeVideo)}
              />
            )}
            <DetailRow
              icon={TrendingUp}
              label="Pipeline"
              value={quota.fullPipeline ? "Full" : "Basic (metadata & heuristics)"}
            />
            <DetailRow
              icon={Sparkles}
              label="Detection models"
              value={
                plan.slug === "free"
                  ? "1"
                  : plan.slug === "starter"
                    ? "2"
                    : "4+"
              }
            />
            <DetailRow
              icon={Timer}
              label="Result retention"
              value={formatRetention(quota.historyRetention)}
            />
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                Billing
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your payment method, download invoices, or change or
                cancel your subscription.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {hasPortal ? (
              <Button
                className="w-full"
                onClick={onOpenPortal}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ExternalLink className="size-4" aria-hidden="true" />
                )}
                Open billing portal
              </Button>
            ) : (
              <Button className="w-full" onClick={onGoPricing}>
                <ArrowUpRight className="size-4" aria-hidden="true" />
                Choose a paid plan
              </Button>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Secure payment — you can cancel anytime.
            </p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          className="sm:w-auto"
          onClick={onGoPricing}
        >
          <ArrowUpRight className="size-4" aria-hidden="true" />
          Change plan
        </Button>
        <Button variant="ghost" className="sm:w-auto" onClick={onGoDetect}>
          Back to detector
        </Button>
      </div>
    </div>
  )
}

function UsageGauge({
  icon: Icon,
  label,
  used,
  max,
  unit,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  used: number
  max: number
  unit: string
}) {
  const pct = max > 0 ? Math.min(100, (used / max) * 100) : 0
  const isWarning = pct >= 80
  const isCritical = pct >= 95
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <Card className="flex flex-col items-center gap-4 p-6 text-center">
      <div className="relative size-28">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="8"
            className="stroke-muted"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(
              "transition-[stroke-dashoffset] duration-700",
              isCritical
                ? "stroke-destructive"
                : isWarning
                  ? "stroke-amber-500"
                  : "stroke-primary"
            )}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-xl font-bold text-foreground">
            {Math.round(pct)}%
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-foreground">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          {label}
        </div>
        <p className="mt-1 text-sm text-foreground">
          <span className="font-display font-semibold">
            {formatCount(used)}
          </span>
          <span className="text-muted-foreground">
            {" "}
            / {formatCount(max)} {unit}
          </span>
        </p>
        <p
          className={cn(
            "mt-1 text-xs",
            isCritical
              ? "text-destructive"
              : isWarning
                ? "text-amber-600"
                : "text-muted-foreground"
          )}
        >
          {isCritical
            ? "Quota almost reached"
            : isWarning
              ? "Approaching the limit"
              : `${formatCount(Math.max(0, max - used))} ${unit} left`}
        </p>
      </div>
    </Card>
  )
}

function QuotaCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 font-display text-xl font-bold text-foreground">
          {value}
        </p>
      </div>
    </Card>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function daysUntil(value: string): number {
  const target = new Date(value).getTime()
  if (Number.isNaN(target)) return 0
  const diff = target - Date.now()
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
}

function computeCycleProgress(start: string, end: string): number {
  const now = Date.now()
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  const total = endMs - startMs
  if (!Number.isFinite(total) || total <= 0) return 0
  const elapsed = now - startMs
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
}

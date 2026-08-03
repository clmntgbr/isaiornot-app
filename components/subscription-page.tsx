"use client"

import { PageHero } from "@/components/page-hero"
import { PillBadge } from "@/components/pill-badge"
import { PlanSkills } from "@/components/skill-badge"
import { Button } from "@/components/ui/button"
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
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  Check,
  CreditCard,
  ExternalLink,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Video,
  Zap,
} from "lucide-react"
import { useState, type ComponentType } from "react"
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
  const { subscription, isLoading } = useSubscription()
  const [portalLoading, setPortalLoading] = useState(false)

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
    <div className="container mx-auto flex max-w-6xl flex-col gap-8 p-4 pb-20">
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
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-56 w-full animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
      <p className="sr-only">Loading your subscription…</p>
    </div>
  )
}

function EmptyState({ onGoPricing }: { onGoPricing: () => void }) {
  return (
    <div
      className="animate-slide-up relative overflow-hidden rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center"
      style={{ animationDelay: "0.1s" }}
    >
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 opacity-30" />
      <div
        className="pointer-events-none absolute top-0 left-1/2 size-72 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--primary), transparent 70%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CreditCard className="size-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-xl font-bold text-foreground">
            No active subscription
          </h2>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            Choose a plan to unlock multi-model detection and higher quotas.
          </p>
        </div>
        <Button onClick={onGoPricing} className="mt-1">
          <Sparkles className="size-4" aria-hidden="true" />
          View plans
        </Button>
      </div>
    </div>
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

  const includedFeatures = [
    `${formatCount(imagesMax)} image analyses / month`,
    videosMax > 0
      ? `${formatCount(videosMax)} video analyses / month`
      : "Videos not included",
    `Images up to ${formatBytes(quota.maxFileSizeImage)}`,
    ...(quota.maxFileSizeVideo > 0
      ? [`Videos up to ${formatBytes(quota.maxFileSizeVideo)}`]
      : []),
    quota.fullPipeline ? "Full detection pipeline" : "Basic pipeline",
    `${
      plan.slug === "free" ? "1" : plan.slug === "starter" ? "2" : "4+"
    } detection model${plan.slug === "free" ? "" : "s"}`,
    `History retained for ${formatRetention(quota.historyRetention)}`,
  ]

  return (
    <div className="flex flex-col gap-4">
      <section
        className="animate-slide-up relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 via-sky-500/5 to-background p-5 sm:p-6"
        style={{ animationDelay: "0.08s" }}
      >
        <div className="grid items-stretch gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="flex flex-col justify-center gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <PillBadge
                className={
                  STATUS_BG[subscription.status] ??
                  "border-border bg-muted text-muted-foreground"
                }
              >
                <span className="size-1.5 rounded-full bg-current" />
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </PillBadge>
              <PillBadge
                icon={CalendarClock}
                className="border-border bg-card text-muted-foreground"
              >
                Since {formatDate(subscription.startDate)}
              </PillBadge>
            </div>

            <div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                  {plan.name}
                </h2>
                <p className="text-lg text-muted-foreground sm:text-xl">
                  {plan.price === 0
                    ? "Free"
                    : formatPrice(plan.price, plan.currency)}
                  {plan.price > 0 && (
                    <span>
                      /{plan.billingInterval === "annually" ? "year" : "month"}
                    </span>
                  )}
                </p>
              </div>
              <PlanSkills quota={quota} className="mt-3 flex flex-wrap gap-2" />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CalendarClock
                className="size-4 text-primary"
                aria-hidden="true"
              />
              Next renewal
            </div>
            <p className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">
              {formatDate(periodEnd)}
            </p>
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Current cycle</span>
                <span className="font-medium text-foreground">
                  {remainingDays}d left
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${cycleProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="animate-slide-up grid gap-4 sm:grid-cols-3"
        style={{ animationDelay: "0.14s" }}
      >
        <UsageGaugeCard
          icon={ImageIcon}
          label="Images analyzed"
          used={imagesUsed}
          max={imagesMax}
          unit="images"
        />
        {videosMax > 0 ? (
          <UsageGaugeCard
            icon={Video}
            label="Videos analyzed"
            used={videosUsed}
            max={videosMax}
            unit="videos"
          />
        ) : (
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Video className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Videos analyzed</p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">
                Not included
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <HardDrive className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">History retention</p>
            <p className="mt-1 font-display text-xl font-bold text-foreground">
              {formatRetention(quota.historyRetention)}
            </p>
          </div>
        </div>
      </section>

      <section
        className="animate-slide-up grid gap-4 lg:grid-cols-2"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-bold text-foreground">
            What&apos;s included
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything in your {plan.name} plan
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {includedFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Check className="size-3 text-primary" />
                </span>
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
          <div
            className="pointer-events-none absolute -right-10 -bottom-12 size-56 rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, var(--primary), transparent 70%)",
            }}
          />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                Billing
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage your payment method, download invoices, or cancel your
                subscription anytime.
              </p>
            </div>

            <div className="space-y-3">
              {hasPortal ? (
                <Button
                  className="w-full"
                  onClick={onOpenPortal}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
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
                Secure payment — cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function UsageGaugeCard({
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
  const remaining = Math.max(0, max - used)
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="relative size-20 shrink-0">
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
          <span className="font-display text-sm font-bold tabular-nums text-foreground">
            {Math.round(pct)}%
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Icon className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{label}</span>
        </div>
        <p className="mt-1 font-display text-lg font-bold tabular-nums text-foreground">
          {formatCount(used)} / {formatCount(max)} {unit}
        </p>
        <p
          className={cn(
            "mt-0.5 text-sm",
            isCritical
              ? "text-destructive"
              : isWarning
                ? "text-amber-600"
                : "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {formatCount(remaining)} {unit} left
        </p>
      </div>
    </div>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
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

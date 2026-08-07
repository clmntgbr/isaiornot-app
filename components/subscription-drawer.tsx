"use client"

import { InvoicesCard } from "@/components/invoices-card"
import { PillBadge } from "@/components/pill-badge"
import { QuotaMeter } from "@/components/quota-meter"
import { PlanSkills } from "@/components/skill-badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  formatBytes,
  formatCount,
  formatPrice,
  formatRetention,
} from "@/lib/plan/pricing"
import { useQuota } from "@/lib/quota/context"
import { createBillingPortalSession } from "@/lib/subscription/api"
import { useSubscription } from "@/lib/subscription/context"
import type { Subscription } from "@/lib/subscription/types"
import {
  ArrowUpRight,
  CalendarClock,
  CreditCard,
  FileStack,
  HardDrive,
  History,
  Image as ImageIcon,
  Infinity as InfinityIcon,
  Loader2,
  Sparkles,
  Video,
  Zap,
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

interface SubscriptionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGoPricing: () => void
}

export function SubscriptionDrawer({
  open,
  onOpenChange,
  onGoPricing,
}: SubscriptionDrawerProps) {
  const { subscription, isLoading, fetchSubscription } = useSubscription()
  const { fetchQuota } = useQuota()
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    void fetchSubscription()
    void fetchQuota()
  }, [open, fetchSubscription, fetchQuota])

  const handleOpenPortal = async () => {
    setPortalLoading(true)
    try {
      const { url } = await createBillingPortalSession()
      if (!url) {
        throw new Error("Missing billing portal url")
      }
      setPortalLoading(false)
      window.location.assign(url)
    } catch {
      toast.error("Unable to open the customer portal", {
        description: "Please try again in a moment.",
      })
      setPortalLoading(false)
    }
  }

  useEffect(() => {
    const resetPortalLoading = () => setPortalLoading(false)
    window.addEventListener("pageshow", resetPortalLoading)
    window.addEventListener("focus", resetPortalLoading)
    return () => {
      window.removeEventListener("pageshow", resetPortalLoading)
      window.removeEventListener("focus", resetPortalLoading)
    }
  }, [])

  const handleGoPricing = () => {
    onOpenChange(false)
    onGoPricing()
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="flex h-full w-full! max-w-full! flex-col gap-0 overflow-hidden p-2 sm:w-[min(100vw,60rem)]! sm:max-w-[60rem]!">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-popover">
          <DrawerHeader className="sr-only hidden">
            <DrawerTitle>Your subscription</DrawerTitle>
            <DrawerDescription>
              Plan, quotas, and billing in one place.
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            {isLoading && !subscription ? (
              <LoadingState />
            ) : !subscription ||
              !(subscription.effectivePlan ?? subscription.plan) ? (
              <EmptyState onGoPricing={handleGoPricing} />
            ) : (
              <SubscriptionContent
                subscription={subscription}
                portalLoading={portalLoading}
                onOpenPortal={handleOpenPortal}
                onGoPricing={handleGoPricing}
              />
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-40 w-full animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="h-56 animate-pulse rounded-2xl bg-muted" />
      <p className="sr-only">Loading your subscription…</p>
    </div>
  )
}

function EmptyState({ onGoPricing }: { onGoPricing: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
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
}: {
  subscription: Subscription
  portalLoading: boolean
  onOpenPortal: () => void
  onGoPricing: () => void
}) {
  const { quota: usage } = useQuota()
  const plan = subscription.effectivePlan ?? subscription.plan!
  const quota = plan.quota

  const periodStart = usage?.periodStart ?? subscription.startDate
  const periodEnd = usage?.periodEnd ?? subscription.endDate
  const remainingDays = daysUntil(periodEnd)
  const cycleProgress = computeCycleProgress(periodStart, periodEnd)

  const imagesUsed = usage?.imagesUsed ?? 0
  const imagesMax = usage?.imagesMax ?? quota.maxImagesPerMonth
  const videosUsed = usage?.videosUsed ?? 0
  const videosMax = usage?.videosMax ?? quota.maxVideosPerMonth
  const hasPortal = Boolean(subscription.stripeCustomerId)
  const isFree = plan.price === 0 || plan.slug === "free"

  const modelCount =
    plan.slug === "free" ? 1 : plan.slug === "starter" ? 2 : 4

  return (
    <div className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-2xl border border-border bg-linear-to-br from-sky-500/8 via-background to-background">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-col gap-4 p-5 sm:p-6">
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
              <span className="text-xs text-muted-foreground">
                Since {formatDate(subscription.startDate)}
              </span>
            </div>

            <div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {plan.name}
                </h2>
                <span className="text-base font-semibold text-primary">
                  {plan.price === 0
                    ? "Free"
                    : formatPrice(plan.price, plan.currency)}
                  {plan.price > 0 && (
                    <span className="font-normal text-muted-foreground">
                      /{plan.billingInterval === "annually" ? "year" : "month"}
                    </span>
                  )}
                </span>
              </div>
              {plan.description ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              ) : null}
            </div>

            <PlanSkills quota={quota} className="mt-auto flex flex-wrap gap-2" />
          </div>

          <div className="flex flex-col gap-4 border-t border-border/70 p-5 sm:p-6 lg:border-t-0 lg:border-l">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CalendarClock
                className="size-4 text-primary"
                aria-hidden="true"
              />
              End of cycle
            </div>

            <p className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {formatDate(periodStart)}
            <br />
            {formatDate(periodEnd)}
            </p>

            <div className="mt-auto">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${cycleProgress}%` }}
                />
              </div>

              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                {isFree ? (
                  <>
                    <InfinityIcon className="size-3.5 shrink-0" aria-hidden="true" />
                    Plan with no expiration date
                  </>
                ) : (
                  <>
                    {remainingDays} days left
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <QuotaMeter
          icon={ImageIcon}
          label="Image scans"
          used={imagesUsed}
          max={imagesMax}
          unit="scans"
        />
        <QuotaMeter
          icon={Video}
          label="Video scans"
          used={videosUsed}
          max={videosMax}
          unit="scans"
          lockedHint="Upgrade your plan to unlock."
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-bold text-foreground">
          What your plan includes
        </h3>
        <div className="mt-4 divide-y divide-border/70">
          <DetailRow
            icon={HardDrive}
            label="Max image size"
            value={formatBytes(quota.maxFileSizeImage)}
          />
          <DetailRow
            icon={Zap}
            label="Pipeline"
            value={quota.fullPipeline ? "Full" : "Basic"}
          />
          <DetailRow
            icon={Sparkles}
            label="Detection models"
            value={`${modelCount} model${modelCount > 1 ? "s" : ""}`}
          />
          <DetailRow
            icon={FileStack}
            label="Images / month"
            value={formatCount(imagesMax)}
          />
          <DetailRow
            icon={Video}
            label="Videos / month"
            value={formatCount(videosMax)}
          />
          <DetailRow
            icon={History}
            label="Historical data retention"
            value={formatRetention(quota.historyRetention)}
          />
        </div>
      </section>

      <section
        className={
          plan.slug !== "business"
            ? "grid gap-4 sm:grid-cols-2"
            : "grid gap-4"
        }
      >
        <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <CreditCard className="size-5" aria-hidden="true" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-foreground">
            Stripe customer portal
          </h3>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">
            Manage your payment method, download invoices, or change or cancel
            your subscription.
          </p>

          <div className="mt-4 border-t border-border/70 pt-4">
            {isFree ? (
              <Button className="w-full" disabled>
                <CreditCard className="size-4" aria-hidden="true" />
                Free plan — no billing
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={hasPortal ? onOpenPortal : onGoPricing}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <CreditCard className="size-4" aria-hidden="true" />
                )}
                {hasPortal ? "Open billing portal" : "Choose a paid plan"}
              </Button>
            )}
          </div>
        </div>

        {plan.slug !== "business" && (
          <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-foreground">
              Level up your plan
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              Unlock the full pipeline, up to 1,000 scans per month, and video
              analysis.
            </p>
            <div className="mt-4 border-t border-border/70 pt-4">
              <Button className="w-full" onClick={onGoPricing}>
                <ArrowUpRight className="size-4" aria-hidden="true" />
                View plans
              </Button>
            </div>
          </div>
        )}
      </section>

      <InvoicesCard isFree={isFree} onGoPricing={onGoPricing} />
    </div>
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
    <div className="flex items-center justify-between gap-3 py-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
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

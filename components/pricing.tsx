"use client"

import { PageHero } from "@/components/page-hero"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { usePlan } from "@/lib/plan/context"
import {
  PLAN_META,
  PLAN_ORDER,
  formatPrice,
  getPlanForInterval,
  getQuotaFeatures,
} from "@/lib/plan/pricing"
import { useOptionalSubscription } from "@/lib/subscription/context"
import { cn } from "@/lib/utils"
import { BadgeCheck, Check, Loader2, Zap } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface PricingPageProps {
  onBack: () => void
  /** Current plan slug when authenticated; omit on public pricing. */
  currentPlanSlug?: string | null
}

export function Pricing({ onBack, currentPlanSlug }: PricingPageProps) {
  const { plans, isLoading, error } = usePlan()
  const subscriptionContext = useOptionalSubscription()
  const [annual, setAnnual] = useState(false)
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null)
  const interval = annual ? "annually" : "monthly"

  const createSubscription = subscriptionContext?.createSubscription
  const isCreating = subscriptionContext?.isCreating ?? false
  const subscription = subscriptionContext?.subscription ?? null

  const activeSlug =
    currentPlanSlug ??
    subscription?.effectivePlan?.slug ??
    subscription?.plan?.slug ??
    null

  const handleSelectPlan = async (planId: string) => {
    if (!createSubscription) {
      toast.error("Sign in to subscribe to a plan")
      return
    }

    setPendingPlanId(planId)
    try {
      const result = await createSubscription(planId)
      if (!result?.url) {
        toast.error("Unable to create subscription")
        return
      }

      window.location.assign(result.url)
    } finally {
      setPendingPlanId(null)
    }
  }

  return (
    <div className="container mx-auto flex max-w-6xl flex-col gap-8 p-4 pb-20">
      <PageHero
        badge="Simple, transparent pricing"
        title="Choose the plan"
        highlight="that fits your needs"
        highlightInline
        subtitle="Multi-model AI image detection. Change or cancel anytime."
      >
        <div
          className="animate-fade-in mt-2 flex items-center gap-3"
          style={{ animationDelay: "0.1s" }}
        >
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              !annual ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Monthly
          </span>
          <Switch
            checked={annual}
            onCheckedChange={setAnnual}
            aria-label="Annual billing"
          />
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              annual ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Annual
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            -20%
          </span>
        </div>
      </PageHero>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm">Loading plans…</span>
        </div>
      ) : error ? (
        <div className="py-20 text-center text-sm text-destructive">
          {error}
        </div>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_ORDER.map((slug, i) => {
            const meta = PLAN_META[slug]
            const plan = getPlanForInterval(plans, slug, interval)
            if (!plan || !meta) return null

            const isCurrent = activeSlug === slug
            const isHighlight = meta.highlight && !isCurrent
            const annualPlan = getPlanForInterval(plans, slug, "annually")
            const monthlyEquivalent = annualPlan
              ? annualPlan.price / 12 / 100
              : 0

            const quotaFeatures = getQuotaFeatures(plan.quota)
            const features = [...quotaFeatures, ...meta.extraFeatures]

            return (
              <div
                key={slug}
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                className={cn(
                  "animate-slide-up relative flex flex-col rounded-2xl border bg-card p-6",
                  isCurrent
                    ? "border-emerald-500/60 shadow-lg ring-1 shadow-emerald-500/10 ring-emerald-500/25"
                    : isHighlight
                      ? "border-primary shadow-lg ring-1 shadow-primary/10 ring-primary/20"
                      : "border-border"
                )}
              >
                {isCurrent ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                      <BadgeCheck className="size-3 shrink-0" />
                      Current plan
                    </span>
                  </div>
                ) : isHighlight ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md">
                      <Zap className="size-3 shrink-0" />
                      {meta.tagline}
                    </span>
                  </div>
                ) : null}

                <div className="mt-2">
                  <h3 className="font-display text-xl font-bold">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isCurrent
                      ? "Your current subscription"
                      : meta.tagline !== "Most popular" && meta.tagline}
                  </p>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold tracking-tight">
                    {plan.price === 0
                      ? "Free"
                      : formatPrice(plan.price, plan.currency)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-muted-foreground">
                      /{annual ? "year" : "month"}
                    </span>
                  )}
                </div>

                {annual && plan.price > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    About {monthlyEquivalent.toFixed(2)}
                    {"\u00A0"}€/month
                  </p>
                )}

                <p className="mt-3 min-h-10 text-sm text-muted-foreground">
                  {plan.description}
                </p>

                <Button
                  className="mt-5 w-full"
                  variant={
                    isCurrent ? "secondary" : isHighlight ? "default" : "outline"
                  }
                  disabled={isCreating || isCurrent}
                  onClick={() => void handleSelectPlan(plan.id)}
                >
                  {pendingPlanId === plan.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isCurrent ? (
                    "Current plan"
                  ) : (
                    meta.cta
                  )}
                </Button>

                <ul className="mt-6 flex flex-col gap-3">
                  {features.map((feature, idx) => {
                    const isQuota = idx < quotaFeatures.length
                    return (
                      <li key={feature} className="flex items-start gap-2.5">
                        <span
                          className={cn(
                            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                            isCurrent
                              ? "bg-emerald-500/15"
                              : isHighlight
                                ? "bg-primary/15"
                                : "bg-primary/10"
                          )}
                        >
                          <Check
                            className={cn(
                              "size-3",
                              isCurrent ? "text-emerald-600" : "text-primary"
                            )}
                          />
                        </span>
                        <span
                          className={cn(
                            "text-sm",
                            isQuota
                              ? "font-medium text-foreground"
                              : "text-foreground"
                          )}
                        >
                          {feature}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </section>
      )}

      <section className="mt-14 flex flex-col items-center gap-6">
        <div className="grid w-full gap-4 sm:grid-cols-3">
          <InfoTile
            title="No commitment"
            desc="Cancel or change plans anytime, with no hidden fees."
          />
          <InfoTile
            title="Usage-based billing"
            desc="Unused scans do not roll over to the next month."
          />
          <InfoTile
            title="Support included"
            desc="All paid plans include support, with priority from Pro."
          />
        </div>
      </section>
    </div>
  )
}

function InfoTile({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}
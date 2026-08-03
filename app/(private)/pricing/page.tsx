"use client"

import { Pricing } from "@/components/pricing"
import { useOptionalSubscription } from "@/lib/subscription/context"
import { useRouter } from "next/navigation"

export default function PricingPage() {
  const router = useRouter()
  const subscriptionContext = useOptionalSubscription()

  const currentPlanSlug =
    subscriptionContext?.subscription?.effectivePlan?.slug ??
    subscriptionContext?.subscription?.plan?.slug ??
    null

  return (
    <Pricing
      onBack={() => router.push("/")}
      currentPlanSlug={currentPlanSlug}
    />
  )
}

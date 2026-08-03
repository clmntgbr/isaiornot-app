"use client"

import { ScanProvider } from "@/lib/scan/provider"
import { UserCentrifugeListener } from "@/lib/centrifugo/user-centrifuge-listener"
import { PlanProvider } from "@/lib/plan/provider"
import { StatisticsProvider } from "@/lib/statistics/provider"
import { SubscriptionProvider } from "@/lib/subscription/provider"
import { useUser } from "@/lib/user/context"
import { Loader2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useUser()
  const isSetupRoute = pathname.startsWith("/account/setup")
  const isReady = Boolean(user?.id)

  useEffect(() => {
    if (isLoading) return

    if (!isReady && !isSetupRoute) {
      router.replace("/account/setup")
      return
    }

    if (isReady && isSetupRoute) {
      router.replace("/")
    }
  }, [isLoading, isReady, isSetupRoute, router])

  if (isSetupRoute) {
    return <div className="mx-auto bg-background px-0">{children}</div>
  }

  if (isLoading || !isReady) {
    return (
      <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <PlanProvider>
      <SubscriptionProvider>
        <ScanProvider>
          <StatisticsProvider>
            <UserCentrifugeListener />
            <div className="mx-auto bg-background px-0">{children}</div>
          </StatisticsProvider>
        </ScanProvider>
      </SubscriptionProvider>
    </PlanProvider>
  )
}

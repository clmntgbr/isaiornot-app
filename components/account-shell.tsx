"use client"

import { ScanProvider } from "@/lib/scan/provider"
import { UserCentrifugeListener } from "@/lib/centrifugo/user-centrifuge-listener"
import { PlanProvider } from "@/lib/plan/provider"
import { StatisticsProvider } from "@/lib/statistics/provider"
import { SubscriptionProvider } from "@/lib/subscription/provider"
import { useUser } from "@/lib/user/context"
import { useAuth } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

function isPublicAppRoute(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/pricing")
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()
  const { user, isLoading } = useUser()
  const isSetupRoute = pathname.startsWith("/account/setup")
  const isPublicRoute = isPublicAppRoute(pathname)
  const isReady = Boolean(user?.id)

  useEffect(() => {
    if (!isLoaded || isLoading) return

    // Guests can browse public pages; private routes are gated by Clerk middleware.
    if (!isSignedIn) return

    if (!isReady && !isSetupRoute) {
      router.replace("/account/setup")
      return
    }

    if (isReady && isSetupRoute) {
      router.replace("/")
    }
  }, [isLoaded, isLoading, isSignedIn, isReady, isSetupRoute, router])

  if (!isLoaded) {
    return (
      <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  // Guest: public pages only need plans (pricing).
  if (!isSignedIn) {
    return (
      <PlanProvider>
        <div className="mx-auto bg-background px-0">{children}</div>
      </PlanProvider>
    )
  }

  if (isSetupRoute) {
    return <div className="mx-auto bg-background px-0">{children}</div>
  }

  if (isLoading || !isReady) {
    // On public routes, avoid blocking forever while redirecting to setup.
    if (isPublicRoute) {
      return (
        <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )
    }

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

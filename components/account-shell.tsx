"use client"

import { SubscriptionDrawerHost } from "@/components/subscription-drawer-host"
import { ScanProvider } from "@/lib/scan/provider"
import { UserCentrifugeListener } from "@/lib/centrifugo/user-centrifuge-listener"
import { PlanProvider } from "@/lib/plan/provider"
import { QuotaProvider } from "@/lib/quota/provider"
import { StatisticsProvider } from "@/lib/statistics/provider"
import { SubscriptionProvider } from "@/lib/subscription/provider"
import { useUser } from "@/lib/user/context"
import { useAuth } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

function FullPageLoader() {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()
  const { user, isLoading } = useUser()
  const isSetupRoute = pathname.startsWith("/account/setup")
  const isPaymentReturnRoute =
    pathname.startsWith("/subscription/success") ||
    pathname.startsWith("/subscription/cancel")
  const isPublicAppRoute =
    pathname === "/" || pathname.startsWith("/pricing")
  const isReady = Boolean(user?.id)

  // Once the authenticated app providers have mounted, keep them mounted for the
  // session so readiness flicker / refetch never remounts the whole data layer.
  const keepProvidersRef = useRef(false)
  if (isSignedIn && isReady && !isSetupRoute) {
    keepProvidersRef.current = true
  }
  if (!isSignedIn) {
    keepProvidersRef.current = false
  }

  const showAuthenticatedProviders =
    Boolean(isSignedIn) &&
    (isReady || keepProvidersRef.current || isPaymentReturnRoute) &&
    !isSetupRoute

  useEffect(() => {
    if (!isLoaded || isLoading) return
    if (!isSignedIn) return
    if (isPaymentReturnRoute) return

    if (!isReady && !isSetupRoute) {
      router.replace("/account/setup")
    }
  }, [
    isLoaded,
    isLoading,
    isSignedIn,
    isReady,
    isSetupRoute,
    isPaymentReturnRoute,
    router,
  ])

  if (!isLoaded) {
    return <FullPageLoader />
  }

  // Guest shell only for public app routes. Protected pages (e.g. Stripe return)
  // must wait for Clerk instead of mounting provider-dependent children unsigned.
  if (!isSignedIn) {
    if (!isPublicAppRoute) {
      return <FullPageLoader />
    }

    return (
      <PlanProvider>
        <div className="mx-auto bg-background px-0">{children}</div>
      </PlanProvider>
    )
  }

  if (isSetupRoute) {
    return <div className="mx-auto bg-background px-0">{children}</div>
  }

  if (!showAuthenticatedProviders) {
    return <FullPageLoader />
  }

  return (
    <PlanProvider>
      <SubscriptionProvider>
        <QuotaProvider>
          <ScanProvider>
            <StatisticsProvider>
              <UserCentrifugeListener />
              <SubscriptionDrawerHost />
              <div className="mx-auto bg-background px-0">
                {isReady || isPaymentReturnRoute ? (
                  children
                ) : (
                  <FullPageLoader />
                )}
              </div>
            </StatisticsProvider>
          </ScanProvider>
        </QuotaProvider>
      </SubscriptionProvider>
    </PlanProvider>
  )
}

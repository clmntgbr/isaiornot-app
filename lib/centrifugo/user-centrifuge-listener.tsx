"use client"

import { useScan } from "@/lib/scan/context"
import { useStatistics } from "@/lib/statistics/context"
import { useSubscription } from "@/lib/subscription/context"
import { useUser } from "@/lib/user/context"
import { useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import { isUserStreamEvent, shouldRefetchScans } from "./types"
import { useCentrifuge } from "./use-centrifuge"

const REFRESH_DEBOUNCE_MS = 500

export function UserCentrifugeListener() {
  const { user, isLoading } = useUser()
  const { fetchScans } = useScan()
  const { fetchStatistics } = useStatistics()
  const { fetchSubscription, markPaymentSucceeded } = useSubscription()

  const fetchScansRef = useRef(fetchScans)
  const fetchStatisticsRef = useRef(fetchStatistics)
  const fetchSubscriptionRef = useRef(fetchSubscription)
  const markPaymentSucceededRef = useRef(markPaymentSucceeded)
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  useEffect(() => {
    fetchScansRef.current = fetchScans
    fetchStatisticsRef.current = fetchStatistics
    fetchSubscriptionRef.current = fetchSubscription
    markPaymentSucceededRef.current = markPaymentSucceeded
  }, [
    fetchScans,
    fetchStatistics,
    fetchSubscription,
    markPaymentSucceeded,
  ])

  const debouncedRefreshScans = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      void fetchScansRef.current()
      void fetchStatisticsRef.current()
    }, REFRESH_DEBOUNCE_MS)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const handlePublication = useCallback((data: unknown) => {
    console.log("[Centrifugo] event received", data)

    if (!isUserStreamEvent(data)) {
      console.warn("[Centrifugo] ignored publication (unknown type)", data)
      return
    }

    if (shouldRefetchScans(data)) {
      debouncedRefreshScans()
      return
    }

    if (data.type === "subscription_updated") {
      void fetchSubscriptionRef.current()
      return
    }

    if (data.type === "payment_succeeded") {
      void fetchSubscriptionRef.current()
      markPaymentSucceededRef.current()
      toast.success("Paiement réussi", {
        description: "Votre abonnement est maintenant actif.",
      })
      return
    }

    if (data.type === "payment_failed") {
      void fetchSubscriptionRef.current()
      toast.error("Échec du paiement", {
        description: "Votre paiement n'a pas pu être traité. Veuillez réessayer.",
      })
    }
  }, [debouncedRefreshScans])

  const userId = !isLoading ? user?.id : undefined

  useCentrifuge(userId, handlePublication)

  return null
}

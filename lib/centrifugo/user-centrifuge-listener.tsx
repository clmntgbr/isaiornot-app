"use client"

import { useQuota } from "@/lib/quota/context"
import { useScan } from "@/lib/scan/context"
import { useStatistics } from "@/lib/statistics/context"
import { useSubscription } from "@/lib/subscription/context"
import { useUser } from "@/lib/user/context"
import { useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import {
  isUserLifecycleEvent,
  isUserStreamEvent,
  shouldRefetchScans,
} from "./types"
import { useCentrifuge } from "./use-centrifuge"

const REFRESH_DEBOUNCE_MS = 500

export function UserCentrifugeListener() {
  const { user, isLoading, fetchUser } = useUser()
  const { fetchScans } = useScan()
  const { fetchStatistics } = useStatistics()
  const { fetchSubscription, markPaymentSucceeded } = useSubscription()
  const { fetchQuota } = useQuota()

  const fetchUserRef = useRef(fetchUser)
  const fetchScansRef = useRef(fetchScans)
  const fetchStatisticsRef = useRef(fetchStatistics)
  const fetchSubscriptionRef = useRef(fetchSubscription)
  const fetchQuotaRef = useRef(fetchQuota)
  const markPaymentSucceededRef = useRef(markPaymentSucceeded)
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  useEffect(() => {
    fetchUserRef.current = fetchUser
    fetchScansRef.current = fetchScans
    fetchStatisticsRef.current = fetchStatistics
    fetchSubscriptionRef.current = fetchSubscription
    fetchQuotaRef.current = fetchQuota
    markPaymentSucceededRef.current = markPaymentSucceeded
  }, [
    fetchUser,
    fetchScans,
    fetchStatistics,
    fetchSubscription,
    fetchQuota,
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

    if (isUserLifecycleEvent(data)) {
      void fetchUserRef.current()
      return
    }

    if (shouldRefetchScans(data)) {
      debouncedRefreshScans()
      void fetchQuotaRef.current()
      return
    }

    if (data.type === "quota_updated") {
      void fetchQuotaRef.current()
      return
    }

    if (data.type === "subscription_updated") {
      void fetchSubscriptionRef.current()
      void fetchQuotaRef.current()
      return
    }

    if (data.type === "payment_succeeded") {
      void fetchSubscriptionRef.current()
      void fetchQuotaRef.current()
      markPaymentSucceededRef.current()
      toast.success("Payment successful", {
        description: "Your subscription is now active.",
      })
      return
    }

    if (data.type === "payment_failed") {
      void fetchSubscriptionRef.current()
      toast.error("Payment failed", {
        description:
          "Your payment could not be processed. Please try again.",
      })
    }
  }, [debouncedRefreshScans])

  const enabled = !isLoading && Boolean(user?.id)

  useCentrifuge(enabled, handlePublication)

  return null
}

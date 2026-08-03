"use client"

import { useSubscription } from "@/lib/subscription/context"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

const REDIRECT_DELAY_MS = 10000

interface PaymentSuccessProps {
  onGoDetect: () => void
}

export function PaymentSuccess({ onGoDetect }: PaymentSuccessProps) {
  const { fetchSubscription, resetPaymentSucceeded } = useSubscription()

  useEffect(() => {
    void fetchSubscription()
  }, [fetchSubscription])

  useEffect(() => {
    const timeout = setTimeout(onGoDetect, REDIRECT_DELAY_MS)
    return () => clearTimeout(timeout)
  }, [onGoDetect])

  useEffect(() => {
    return () => {
      resetPaymentSucceeded()
    }
  }, [resetPaymentSucceeded])

  return (
    <div className="relative container mx-auto flex min-h-[calc(100svh-4rem)] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10 opacity-40" />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-100 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--primary), transparent 70%)",
        }}
      />

      <div className="relative animate-in duration-300 zoom-in-95">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="relative flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Loader2 className="size-9 animate-spin" />
        </div>
      </div>

      <div
        className="animate-slide-up space-y-2"
        style={{ animationDelay: "0.15s" }}
      >
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Verifying payment…
        </h1>
        <p className="text-balance text-muted-foreground">
          We are confirming your transaction. Your subscription will be activated
          automatically.
        </p>
        <p className="text-xs text-muted-foreground">
          Redirecting automatically in a few seconds…
        </p>
      </div>
    </div>
  )
}

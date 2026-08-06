"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

const REDIRECT_DELAY_MS = 10000

interface PaymentCancelProps {
  reason?: "cancelled" | "declined"
  onGoDetect: () => void
}

export function PaymentCancel({
  reason = "cancelled",
  onGoDetect,
}: PaymentCancelProps) {
  const isDeclined = reason === "declined"

  useEffect(() => {
    const timeout = setTimeout(onGoDetect, REDIRECT_DELAY_MS)
    return () => clearTimeout(timeout)
  }, [onGoDetect])

  const styles = isDeclined
    ? {
        gradient: "var(--destructive)",
        circle: "bg-destructive text-white shadow-lg shadow-destructive/30",
        ping: "bg-destructive/20",
      }
    : {
        gradient: "#f59e0b",
        circle: "bg-amber-500 text-white shadow-lg shadow-amber-500/30",
        ping: "bg-amber-500/20",
      }

  return (
    <div className="relative container mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10 opacity-40" />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-100 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background: `radial-gradient(circle, ${styles.gradient}, transparent 70%)`,
        }}
      />

      <div className="relative animate-in duration-300 zoom-in-95">
        <div
          className={cn(
            "absolute inset-0 animate-ping rounded-full",
            styles.ping
          )}
        />
        <div
          className={cn(
            "relative flex size-20 items-center justify-center rounded-full",
            styles.circle
          )}
        >
          <Loader2 className="size-9 animate-spin" />
        </div>
      </div>

      <div
        className="animate-slide-up space-y-2"
        style={{ animationDelay: "0.15s" }}
      >
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {isDeclined ? "Payment declined" : "Payment canceled"}
        </h1>
        <p className="text-balance text-muted-foreground">
          {isDeclined
            ? "Your bank declined the payment."
            : "You canceled the payment. No amount was charged."}
        </p>
        <p className="text-xs text-muted-foreground">
          Redirecting automatically in a few seconds…
        </p>
      </div>
    </div>
  )
}

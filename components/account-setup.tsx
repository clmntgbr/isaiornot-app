"use client"

import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/user/context"
import { Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const RETRY_INTERVAL_MS = 3000

export function AccountSetup() {
  const router = useRouter()
  const { user, isLoading, fetchUser } = useUser()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const goHome = useCallback(() => {
    router.replace("/")
  }, [router])

  const checkUserReady = useCallback(async () => {
    const nextUser = await fetchUser()
    if (nextUser?.id) {
      goHome()
      return true
    }
    return false
  }, [fetchUser, goHome])

  useEffect(() => {
    if (!isLoading && user?.id) {
      goHome()
    }
  }, [isLoading, user?.id, goHome])

  useEffect(() => {
    if (user?.id) return

    const interval = setInterval(() => {
      void checkUserReady()
    }, RETRY_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [user?.id, checkUserReady])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const ready = await checkUserReady()
      if (!ready) {
        toast.message("Account is being created", {
          description:
            "Your account is not ready yet. Please try again in a moment.",
        })
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
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
        className="animate-slide-up max-w-lg space-y-2"
        style={{ animationDelay: "0.15s" }}
      >
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Creating your account…
        </h1>
        <p className="text-balance text-muted-foreground">
          We are finishing your workspace setup. This usually only takes a few
          seconds.
        </p>
        <p className="text-xs text-muted-foreground">
          Waiting for confirmation…
        </p>
      </div>

      <Button
        variant="outline"
        onClick={() => void handleRefresh()}
        disabled={isRefreshing || isLoading}
        className="animate-slide-up"
        style={{ animationDelay: "0.25s" }}
      >
        {isRefreshing || isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        Refresh
      </Button>
    </div>
  )
}

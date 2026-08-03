"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useUser } from "@/lib/user/context"
import {
  Loader2,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const RETRY_INTERVAL_MS = 3000
const MIN_DISPLAY_MS = 4000

export function AccountSetup() {
  const router = useRouter()
  const { user, isLoading, fetchUser } = useUser()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)

  const goHome = useCallback(() => {
    router.replace("/")
  }, [router])

  const checkUserReady = useCallback(async () => {
    const nextUser = await fetchUser()
    return Boolean(nextUser?.id)
  }, [fetchUser])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMinTimeElapsed(true)
    }, MIN_DISPLAY_MS)

    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (minTimeElapsed && !isLoading && user?.id) {
      goHome()
    }
  }, [minTimeElapsed, isLoading, user?.id, goHome])

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
        return
      }

      if (minTimeElapsed) {
        goHome()
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="mx-auto w-full max-w-lg">
        <section className="relative flex flex-col items-center gap-4 pb-8 text-center">
          <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10 opacity-40" />
          <div
            className="pointer-events-none absolute top-0 left-1/2 -z-10 size-100 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, var(--primary), transparent 70%)",
            }}
          />

          <div className="relative animate-in duration-300 zoom-in-95">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <MailCheck className="size-9" strokeWidth={2.5} />
            </div>
          </div>

          <div
            className="animate-slide-up space-y-2"
            style={{ animationDelay: "0.15s" }}
          >
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Account created!
            </h1>
            <p className="text-balance text-muted-foreground">
              We are finishing your account setup. You will be redirected
              automatically in a moment.
            </p>
          </div>
        </section>

        <Card
          className="animate-slide-up gap-0 overflow-hidden py-0"
          style={{ animationDelay: "0.25s" }}
        >
          <div className="flex items-center gap-3 border-b bg-primary/5 px-5 py-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Setup in progress</p>
              <p className="text-xs text-muted-foreground">
                Waiting for confirmation
              </p>
            </div>
          </div>

          <CardContent className="p-5">
            <ul className="flex flex-col gap-4">
              <StepRow label="Account created" done />
              <StepRow label="Email verification" active />
              <StepRow label="Automatic redirect" pending />
            </ul>

            <div className="mt-5 rounded-xl border bg-secondary/50 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mr-1.5 inline size-3.5 align-text-bottom" />
              Do not close this page — you will be redirected as soon as your
              account is ready.
            </div>
          </CardContent>
        </Card>

        <div
          className="mt-6 flex justify-center animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <Button
            variant="outline"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing || isLoading}
          >
            {isRefreshing || isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>
    </div>
  )
}

function StepRow({
  label,
  done,
  active,
  pending,
}: {
  label: string
  done?: boolean
  active?: boolean
  pending?: boolean
}) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={
          done
            ? "flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white"
            : active
              ? "flex size-6 items-center justify-center rounded-full border-2 border-primary bg-primary/10"
              : "flex size-6 items-center justify-center rounded-full border-2 border-border bg-secondary"
        }
      >
        {done && (
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {active && (
          <span className="size-2.5 animate-pulse rounded-full bg-primary" />
        )}
        {pending && (
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        )}
      </span>
      <span
        className={
          done || active
            ? "text-sm font-medium text-foreground"
            : "text-sm text-muted-foreground"
        }
      >
        {label}
      </span>
      {active && (
        <span className="ml-auto text-xs font-medium text-primary">
          In progress…
        </span>
      )}
    </li>
  )
}

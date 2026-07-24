"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

const RETRY_DELAYS_MS = [800, 1600, 3200, 5000]

interface MediaThumbnailProps {
  src: string
  alt: string
  className?: string
}

/**
 * Loads a media thumbnail with retries: the backend often returns a URL
 * before the file is actually available (404 on first paint after upload).
 */
export function MediaThumbnail({ src, alt, className }: MediaThumbnailProps) {
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  )

  useEffect(() => {
    setAttempt(0)
    setStatus("loading")
  }, [src])

  useEffect(() => {
    if (status !== "error") return

    const delay =
      RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)] ?? 5000

    const timeout = setTimeout(() => {
      setStatus("loading")
      setAttempt((current) => current + 1)
    }, delay)

    return () => clearTimeout(timeout)
  }, [status, attempt])

  const handleLoad = useCallback(() => {
    setStatus("loaded")
  }, [])

  const handleError = useCallback(() => {
    setStatus("error")
  }, [])

  const showLoader = status !== "loaded"
  const cacheBustedSrc =
    attempt === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}t=${attempt}`

  return (
    <div className={cn("relative size-full", className)}>
      {/* Keep requesting while retrying; hide until loaded to avoid broken icon flash */}
      {status !== "error" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={cacheBustedSrc}
          src={cacheBustedSrc}
          alt={alt}
          className={cn(
            "size-full object-cover transition-opacity",
            status === "loaded" ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

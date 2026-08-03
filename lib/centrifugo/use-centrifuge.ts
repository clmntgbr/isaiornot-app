"use client"

import { Centrifuge } from "centrifuge"
import { useEffect, useRef } from "react"
import { getRealtimeConnection } from "./api"

/**
 * Connects to Centrifugo using GET /api/realtime/connection
 * (`token`, `channel` = users:<uuid>, `wsUrl`), then subscribes to `channel`.
 */
export function useCentrifuge(
  enabled: boolean,
  onPublication: (data: unknown) => void
) {
  const onPublicationRef = useRef(onPublication)

  useEffect(() => {
    onPublicationRef.current = onPublication
  }, [onPublication])

  useEffect(() => {
    if (!enabled) return

    let centrifuge: Centrifuge | null = null
    let cancelled = false

    const connect = async () => {
      try {
        const connection = await getRealtimeConnection()
        if (cancelled) return

        centrifuge = new Centrifuge(connection.wsUrl, {
          getToken: async () => {
            const next = await getRealtimeConnection()
            return next.token
          },
        })

        const subscription = centrifuge.newSubscription(connection.channel)

        subscription.on("publication", (ctx) => {
          console.log(
            "[Centrifugo] publication",
            connection.channel,
            ctx.data
          )
          onPublicationRef.current(ctx.data)
        })

        subscription.on("subscribed", () => {
          console.log("[Centrifugo] subscribed", connection.channel)
        })

        subscription.on("error", (ctx) => {
          console.error(
            "[Centrifugo] subscription error",
            connection.channel,
            ctx
          )
        })

        centrifuge.on("connected", () => {
          console.log("[Centrifugo] connected", connection.wsUrl)
        })

        centrifuge.on("disconnected", (ctx) => {
          console.warn("[Centrifugo] disconnected", ctx)
        })

        subscription.subscribe()
        centrifuge.connect()
      } catch (error) {
        console.error("[Centrifugo] setup error", error)
      }
    }

    void connect()

    return () => {
      cancelled = true
      centrifuge?.disconnect()
    }
  }, [enabled])
}

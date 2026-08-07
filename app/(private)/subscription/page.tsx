"use client"

import { openSubscriptionDrawer } from "@/components/subscription-drawer-host"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

/** Legacy route: open the subscription drawer on home. */
export default function Page() {
  const router = useRouter()

  useEffect(() => {
    openSubscriptionDrawer()
    router.replace("/")
  }, [router])

  return null
}

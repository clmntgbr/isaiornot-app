import { createAuthHeaders } from "@/lib/create-auth-headers"
import { requireAuth } from "@/lib/require-auth"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

const FORWARD_PARAMS = [
  "page",
  "limit",
  "sortBy",
  "orderBy",
  "search",
  "tags",
  "verdict",
  "confidence",
  "status",
] as const

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if ("error" in auth) return auth.error

    const { searchParams } = request.nextUrl
    const query = new URLSearchParams()

    for (const key of FORWARD_PARAMS) {
      const value = searchParams.get(key)
      if (value) query.set(key, value)
    }

    if (!query.has("page")) query.set("page", "1")
    if (!query.has("limit")) query.set("limit", "10")
    if (!query.has("sortBy")) query.set("sortBy", "created_at")
    if (!query.has("orderBy")) query.set("orderBy", "desc")

    const response = await fetch(`${BACKEND_API_URL}/api/scans?${query}`, {
      method: "GET",
      headers: createAuthHeaders(auth.token),
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, data: await response.json() },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

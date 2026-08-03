import { createAuthHeaders } from "@/lib/create-auth-headers"
import { requireAuth } from "@/lib/require-auth"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if ("error" in auth) return auth.error

    const { searchParams } = request.nextUrl
    const query = new URLSearchParams()

    const page = searchParams.get("page")
    const limit = searchParams.get("limit")
    query.set("page", page ?? "1")
    query.set("limit", limit ?? "20")

    const response = await fetch(`${BACKEND_API_URL}/api/invoices?${query}`, {
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

import { createAuthHeaders } from "@/lib/create-auth-headers"
import { requireAuth } from "@/lib/require-auth"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if ("error" in auth) return auth.error

    const { searchParams } = request.nextUrl
    const page = searchParams.get("page") ?? "1"
    const limit = searchParams.get("limit") ?? "10"
    const sortBy = searchParams.get("sortBy") ?? "created_at"
    const orderBy = searchParams.get("orderBy") ?? "desc"

    const query = new URLSearchParams({
      page,
      limit,
      sortBy,
      orderBy,
    })

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

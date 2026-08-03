import { NextResponse } from "next/server"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/plans`, {
      method: "GET",
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

export interface RealtimeConnection {
  token: string
  channel: string
  wsUrl: string
}

export async function getRealtimeConnection(): Promise<RealtimeConnection> {
  const response = await fetch("/api/realtime/connection", {
    method: "GET",
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch realtime connection")
  }

  const data = (await response.json()) as Partial<RealtimeConnection>

  if (!data.token) {
    throw new Error("Missing realtime connection token in response")
  }

  if (!data.channel) {
    throw new Error("Missing realtime connection channel in response")
  }

  const wsUrl = data.wsUrl || process.env.NEXT_PUBLIC_CENTRIFUGO_URL
  if (!wsUrl) {
    throw new Error("Missing realtime connection wsUrl")
  }

  return {
    token: data.token,
    channel: data.channel,
    wsUrl,
  }
}

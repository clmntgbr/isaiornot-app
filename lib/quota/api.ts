import type { QuotaUsage } from "./types"

export const getQuota = async (): Promise<QuotaUsage> => {
  const response = await fetch("/api/quota", {
    method: "GET",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch quota")
  }

  return response.json()
}

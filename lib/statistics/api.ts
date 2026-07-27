import { ScanStatistics } from "./types"

export const getStatistics = async (): Promise<ScanStatistics> => {
  const response = await fetch("/api/scans/statistics", {
    method: "GET",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch statistics")
  }

  return response.json()
}

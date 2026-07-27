export interface ScanStatistics {
  scansCount: number
  realImageCount: number
  aiImageCount: number
  averageScore: number
}

export interface StatisticsState {
  statistics: ScanStatistics | null
  isLoading: boolean
  error: string | null
}

export type StatisticsAction =
  | { type: "GET_STATISTICS"; payload: ScanStatistics }
  | { type: "GET_STATISTICS_ERROR"; payload: string }
  | { type: "GET_STATISTICS_LOADING"; payload: boolean }

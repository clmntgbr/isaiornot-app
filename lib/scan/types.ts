import { Paginate } from "../paginate"

export type ScanVerdict = "likely_ai" | "likely_real" | "uncertain"
export type ScanConfidence = "low" | "medium" | "high" | "unknown"
export type ScanStatus = "pending" | "processing" | "completed" | "failed"

export interface Insight {
  noise: number
  compression: number
  frequency: number
  histogram: number
}

export type InsightKey = keyof Insight

export interface Signal {
  name: string
  score: number
  confidence: ScanConfidence
  details: string[]
}

export interface Media {
  id: string
  key: string
  filename: string
  thumbnail: string
  contentType: string
  status: ScanStatus
  signals?: Signal[]
  insight?: Insight
  size?: number
  createdAt: string
  updatedAt: string
}

export interface Scan {
  id: string
  status: ScanStatus
  statuses?: string[]
  message?: string | null
  finalScore?: number
  confidence?: ScanConfidence
  verdict?: ScanVerdict
  filename?: string
  thumbnail?: string
  insight?: Insight
  medias: Media[]
  createdAt: string
  updatedAt: string
}

export interface PresignUploadInput {
  Filename: string
  ContentType: string
}

export interface GeneratePresignedUploadUrlDetailResponse {
  uploadUrl: string
}

export interface ScanFilters {
  verdict?: ScanVerdict
  confidence?: ScanConfidence
  status?: ScanStatus
}

export interface ScanState {
  scans: Paginate<Scan>
  filters: ScanFilters
  isScansLoading: boolean
  scansError: string | null
}

export type ScanAction =
  | { type: "GET_ANALYSES"; payload: Paginate<Scan> }
  | { type: "GET_ANALYSES_ERROR"; payload: string }
  | { type: "GET_ANALYSES_LOADING"; payload: boolean }
  | { type: "SET_FILTERS"; payload: ScanFilters }

import { Paginate } from "../paginate"

export type AnalysisVerdict = "likely_ai" | "likely_real" | "uncertain"
export type AnalysisConfidence = "low" | "medium" | "high" | "unknown"
export type AnalysisStatus = "pending" | "processing" | "analyzed" | "failed"

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
  confidence: AnalysisConfidence
  details: string[]
}

export interface Media {
  id: string
  key: string
  filename: string
  thumbnail: string
  contentType: string
  status: AnalysisStatus
  signals?: Signal[]
  insight?: Insight
  size?: number
  createdAt: string
  updatedAt: string
}

export interface Analysis {
  id: string
  status: AnalysisStatus
  statuses?: string[]
  message?: string | null
  finalScore?: number
  confidence?: AnalysisConfidence
  verdict?: AnalysisVerdict
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

export interface AnalysisState {
  analyses: Paginate<Analysis>
  isAnalysesLoading: boolean
  analysesError: string | null
}

export type AnalysisAction =
  | { type: "GET_ANALYSES"; payload: Paginate<Analysis> }
  | { type: "GET_ANALYSES_ERROR"; payload: string }
  | { type: "GET_ANALYSES_LOADING"; payload: boolean }

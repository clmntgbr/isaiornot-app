export interface QuotaUsage {
  periodStart: string
  periodEnd: string
  imagesUsed: number
  imagesMax: number
  imagesLeft: number
  videosUsed: number
  videosMax: number
  videosLeft: number
  maxFileSizeImage: number
  maxFileSizeVideo: number
  fullPipeline: boolean
}

export interface QuotaState {
  quota: QuotaUsage | null
  isLoading: boolean
  error: string | null
}

export type QuotaAction =
  | { type: "GET_QUOTA"; payload: QuotaUsage }
  | { type: "GET_QUOTA_LOADING"; payload: boolean }
  | { type: "GET_QUOTA_ERROR"; payload: string }

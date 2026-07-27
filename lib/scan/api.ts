import { Paginate, PaginateQuery } from "../paginate"
import {
  Scan,
  GeneratePresignedUploadUrlDetailResponse,
  PresignUploadInput,
} from "./types"

const DEFAULT_SCAN_QUERY: Required<
  Pick<PaginateQuery, "page" | "limit" | "sortBy" | "orderBy">
> = {
  page: 1,
  limit: 10,
  sortBy: "created_at",
  orderBy: "desc",
}

export const getScans = async (
  query: PaginateQuery = {}
): Promise<Paginate<Scan>> => {
  const params = new URLSearchParams({
    page: String(query.page ?? DEFAULT_SCAN_QUERY.page),
    limit: String(query.limit ?? DEFAULT_SCAN_QUERY.limit),
    sortBy: query.sortBy ?? DEFAULT_SCAN_QUERY.sortBy,
    orderBy: query.orderBy ?? DEFAULT_SCAN_QUERY.orderBy,
  })

  if (query.search) params.set("search", query.search)
  if (query.tags) params.set("tags", query.tags)

  const response = await fetch(`/api/scans?${params}`, {
    method: "GET",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch scans")
  }

  return response.json()
}

export const getScan = async (id: string): Promise<Scan> => {
  const response = await fetch(`/api/scans/${id}`, {
    method: "GET",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch scan")
  }

  const payload = (await response.json()) as { data?: Scan } | Scan

  if ("data" in payload && payload.data) {
    return payload.data
  }

  return payload as Scan
}

export const generatePresignedUploadUrl = async (
  input: PresignUploadInput
): Promise<GeneratePresignedUploadUrlDetailResponse> => {
  const response = await fetch("/api/scans/presign-upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error("Failed to generate presigned upload url")
  }

  return response.json()
}

export const uploadFileToPresignedUrl = (
  file: File,
  presignedUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", presignedUrl)
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    )

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status < 300) {
        resolve()
        return
      }

      reject(new Error(`Upload failed: ${xhr.status}`))
    }

    xhr.onerror = () => reject(new Error("Upload failed"))
    xhr.send(file)
  })
}

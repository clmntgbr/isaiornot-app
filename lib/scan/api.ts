import { Paginate } from "../paginate"
import {
  Scan,
  GeneratePresignedUploadUrlDetailResponse,
  PresignUploadInput,
} from "./types"

export const getScans = async (): Promise<Paginate<Scan>> => {
  const response = await fetch("/api/scans", {
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

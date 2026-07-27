"use client"

import { useCallback, useEffect, useReducer } from "react"
import { initPaginate } from "../paginate"
import {
  generatePresignedUploadUrl,
  getScans,
  getScan,
  uploadFileToPresignedUrl,
} from "./api"
import { ScanContext } from "./context"
import { scanReducer } from "./reducer"
import { Scan, ScanState } from "./types"

const initialState: ScanState = {
  scans: initPaginate<Scan>(),
  isScansLoading: false,
  scansError: null,
}

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(scanReducer, initialState)

  const fetchScans = useCallback(async () => {
    try {
      dispatch({ type: "GET_ANALYSES_LOADING", payload: true })
      const scans = await getScans()
      dispatch({ type: "GET_ANALYSES", payload: scans })
    } catch {
      dispatch({
        type: "GET_ANALYSES_ERROR",
        payload: "Failed to fetch scans",
      })
    } finally {
      dispatch({ type: "GET_ANALYSES_LOADING", payload: false })
    }
  }, [])

  const fetchScan = useCallback(async (id: string) => {
    return getScan(id)
  }, [])

  const uploadFile = useCallback(
    async (file: File) => {
      const contentType = file.type || "application/octet-stream"

      try {
        const { uploadUrl } = await generatePresignedUploadUrl({
          Filename: file.name,
          ContentType: contentType,
        })

        await uploadFileToPresignedUrl(file, uploadUrl, (progress) => {
          console.log(progress)
        })

        await fetchScans()
      } catch {
        console.error("Failed to upload file")
      }
    },
    [fetchScans]
  )

  useEffect(() => {
    fetchScans()
  }, [fetchScans])

  return (
    <ScanContext.Provider
      value={{
        ...state,
        fetchScans,
        fetchScan,
        uploadFile,
      }}
    >
      {children}
    </ScanContext.Provider>
  )
}

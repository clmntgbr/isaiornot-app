"use client"

import { createContext, useContext } from "react"
import { Scan, ScanFilters, ScanState } from "./types"

export interface ScanContextType extends ScanState {
  fetchScans: (page?: number) => Promise<void>
  setFilters: (filters: ScanFilters) => Promise<void>
  fetchScan: (id: string) => Promise<Scan>
  uploadFile: (file: File) => Promise<void>
}

export const ScanContext = createContext<ScanContextType | undefined>(
  undefined
)

export const useScan = () => {
  const context = useContext(ScanContext)
  if (!context) {
    throw new Error("useScan must be used within ScanProvider")
  }
  return context
}

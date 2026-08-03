"use client"

import { createContext, useContext } from "react"
import type { InvoiceState } from "./types"

export interface InvoiceContextType extends InvoiceState {
  fetchInvoices: (page?: number) => Promise<void>
}

export const InvoiceContext = createContext<InvoiceContextType | undefined>(
  undefined
)

export const useInvoice = () => {
  const context = useContext(InvoiceContext)
  if (!context) {
    throw new Error("useInvoice must be used within InvoiceProvider")
  }
  return context
}

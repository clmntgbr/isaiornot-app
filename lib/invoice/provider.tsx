"use client"

import { initPaginate } from "@/lib/paginate"
import { useCallback, useEffect, useReducer, useRef } from "react"
import { getInvoices } from "./api"
import { InvoiceContext } from "./context"
import { invoiceReducer } from "./reducer"
import type { Invoice, InvoiceState } from "./types"

const INVOICES_PAGE_LIMIT = 20

const initialState: InvoiceState = {
  invoices: initPaginate<Invoice>(),
  isLoading: false,
  error: null,
}

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(invoiceReducer, initialState)
  const pageRef = useRef(1)

  const fetchInvoices = useCallback(async (page = pageRef.current) => {
    pageRef.current = page

    try {
      dispatch({ type: "GET_INVOICES_LOADING", payload: true })
      const invoices = await getInvoices({
        page,
        limit: INVOICES_PAGE_LIMIT,
      })
      dispatch({ type: "GET_INVOICES", payload: invoices })
    } catch {
      dispatch({
        type: "GET_INVOICES_ERROR",
        payload: "Failed to fetch invoices",
      })
    } finally {
      dispatch({ type: "GET_INVOICES_LOADING", payload: false })
    }
  }, [])

  useEffect(() => {
    fetchInvoices(1)
  }, [fetchInvoices])

  return (
    <InvoiceContext.Provider
      value={{
        ...state,
        fetchInvoices,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  )
}

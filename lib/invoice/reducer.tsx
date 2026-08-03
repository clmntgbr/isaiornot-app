import { initPaginate } from "@/lib/paginate"
import type { Invoice, InvoiceAction, InvoiceState } from "./types"

export const invoiceReducer = (
  state: InvoiceState,
  action: InvoiceAction
): InvoiceState => {
  switch (action.type) {
    case "GET_INVOICES":
      return {
        ...state,
        invoices: action.payload,
        isLoading: false,
        error: null,
      }
    case "GET_INVOICES_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }
    case "GET_INVOICES_ERROR":
      return {
        ...state,
        invoices: initPaginate<Invoice>(),
        isLoading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

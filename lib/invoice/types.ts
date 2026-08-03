import type { Paginate, PaginateQuery } from "@/lib/paginate"

export interface Invoice {
  id: string
  subscriptionId: string
  stripeInvoiceId: string
  number: string
  status: string
  currency: string
  amountDue: number
  amountPaid: number
  total: number
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
  billingReason: string | null
  description: string | null
  attemptCount: number
  periodStart: string
  periodEnd: string
  paidAt: string | null
  stripeCreatedAt: string
  createdAt: string
  updatedAt: string
}

export type InvoiceQuery = Pick<PaginateQuery, "page" | "limit">

export interface InvoiceState {
  invoices: Paginate<Invoice>
  isLoading: boolean
  error: string | null
}

export type InvoiceAction =
  | { type: "GET_INVOICES"; payload: Paginate<Invoice> }
  | { type: "GET_INVOICES_LOADING"; payload: boolean }
  | { type: "GET_INVOICES_ERROR"; payload: string }

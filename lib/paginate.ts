export interface PaginateView {
  first?: string
  last?: string
  next?: string
  previous?: string
}

export interface Paginate<TData> {
  members: TData[]
  page: number
  limit: number
  totalPages: number
  total: number
}

export interface PaginateQuery {
  page?: number
  limit?: number
  sortBy?: string
  orderBy?: string
  search?: string
  tags?: string
  verdict?: string
  confidence?: string
  status?: string
}

export const initPaginate = <TData>(): Paginate<TData> => {
  return {
    members: [],
    page: 0,
    limit: 0,
    totalPages: 0,
    total: 0,
  }
}

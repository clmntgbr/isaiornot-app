"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

function getPageItems(
  current: number,
  total: number
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, "ellipsis", total]
  }

  if (current >= total - 2) {
    return [1, "ellipsis", total - 3, total - 2, total - 1, total]
  }

  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total]
}

interface ScansPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function ScansPagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: ScansPaginationProps) {
  if (totalPages <= 1) return null

  const goToPage = (nextPage: number) => {
    if (disabled) return
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
    onPageChange(nextPage)
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text="Previous"
            aria-disabled={page <= 1 || disabled}
            className={
              page <= 1 || disabled ? "pointer-events-none opacity-50" : undefined
            }
            onClick={(event) => {
              event.preventDefault()
              goToPage(page - 1)
            }}
          />
        </PaginationItem>

        {getPageItems(page, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === page}
                aria-disabled={disabled}
                className={disabled ? "pointer-events-none opacity-50" : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  goToPage(item)
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            text="Next"
            aria-disabled={page >= totalPages || disabled}
            className={
              page >= totalPages || disabled
                ? "pointer-events-none opacity-50"
                : undefined
            }
            onClick={(event) => {
              event.preventDefault()
              goToPage(page + 1)
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

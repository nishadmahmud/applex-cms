import React from "react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

export default function PaginationBar({ pagination, onPageChange }) {
  if (!pagination || pagination.total <= pagination.per_page) return null;

  const totalPages = pagination.last_page;
  const currentPage = pagination.current_page;

  // Generate limited range around currentPage for visual neatness
  const visiblePages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i++) {
    visiblePages.push(i);
  }

  return (
    <div className="flex justify-end mt-4">
      <Pagination className="py-2">
        <PaginationContent>
          {/* Previous button */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={
                currentPage === 1 ? "opacity-50 pointer-events-none" : ""
              }
            />
          </PaginationItem>

          {/* Page numbers */}
          {start > 1 && (
            <>
              <PaginationItem>
                <PaginationLink href="#" onClick={() => onPageChange(1)}>
                  1
                </PaginationLink>
              </PaginationItem>
              {start > 2 && <span className="px-2 text-gray-400">…</span>}
            </>
          )}

          {visiblePages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && (
                <span className="px-2 text-gray-400">…</span>
              )}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={() => onPageChange(totalPages)}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          {/* Next button */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={
                currentPage === totalPages
                  ? "opacity-50 pointer-events-none"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

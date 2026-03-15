"use client";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// eslint-disable-next-line react/prop-types
export function CustomServerPagination({ totalPage, currentPage, transition }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const pages = [];
  if (totalPage <= 5) {
    for (let i = 1; i <= totalPage; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage < 3) {
      pages.push(1, 2, 3, "...", totalPage);
    } else if (currentPage >= totalPage - 2) {
      pages.push(1, "...", totalPage - 2, totalPage - 1, totalPage);
    } else {
      pages.push(
        1,
        "...",
        currentPage,
        currentPage + 1,
        currentPage + 2,
        "...",
        totalPage
      );
    }
  }

  const handlePagination = (currPage) => {
    const params = new URLSearchParams(searchParams);
    transition(() => {
      if (currPage) {
        params.set("page", currPage);
      }
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    })
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {currentPage == 1 ? (
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
              }}
            />
          ) : (
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePagination(currentPage - 1);
              }}
            />
          )}
        </PaginationItem>
        {pages.map((item, idx) =>
          item === "..." ? (
            <PaginationItem key={idx}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : currentPage == item ? (
            <PaginationItem key={idx}>
              <PaginationLink
                className={`${currentPage == item ? "bg-accent" : ""} `}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={idx}>
              <PaginationLink
                className={`${currentPage == item ? "bg-accent" : ""} `}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePagination(item);
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          {currentPage == totalPage ? (
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
              }}
            />
          ) : (
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePagination(
                  currentPage != totalPage ? currentPage + 1 : null
                );
              }}
            />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

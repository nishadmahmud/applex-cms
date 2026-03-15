'use client'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import React from 'react'

// eslint-disable-next-line react/prop-types
export default function CustomPagination({ totalPage, currentPage, setCurrentPage }) {
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
            pages.push(1, "...", currentPage, currentPage + 1, currentPage + 2,'...',totalPage);
        }
    }

    const handlePageChange = (page) => {
        if (typeof page === 'number' && page !== currentPage) {
            setCurrentPage(page)
        }
    }


    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href="#" onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }} />
                </PaginationItem>
                {
                    pages &&
                    pages.map((item,idx) =>
                        item === "..." ?
                            (<PaginationItem key={idx}>
                                <PaginationEllipsis />
                            </PaginationItem>)
                            :
                            (
                                <PaginationItem key={idx}>
                                    <PaginationLink isActive={item === currentPage} href="#" onClick={(e) => {
                                        e.preventDefault()
                                        handlePageChange(item)
                                    }}>{item}</PaginationLink>
                                </PaginationItem>
                            )
                    )
                }
                <PaginationItem>
                    <PaginationNext 
                    disabled={currentPage === totalPage}
                     href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPage) setCurrentPage(currentPage + 1)
                    }} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

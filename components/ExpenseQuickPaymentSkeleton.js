import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "./ui/table"

export default function ExpenseQuickPaymentSkeleton() {
  return (
              Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                {" "}
                {/* Prevent hover effect on skeleton */}
                <TableCell className="font-medium w-[150px]">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-20" /> {/* ID */}
                    <Skeleton className="h-5 w-24 rounded-full" /> {/* Category Badge */}
                  </div>
                </TableCell>
                <TableCell className="w-[120px]">
                  <Skeleton className="h-4 w-24" /> {/* Date */}
                </TableCell>
                <TableCell className="w-[100px]">
                  <Skeleton className="h-4 w-16" /> {/* Amount */}
                </TableCell>
                <TableCell className="flex-1">
                  <Skeleton className="h-4 w-32" /> {/* Description */}
                </TableCell>
                <TableCell className="w-[150px] text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Skeleton className="h-9 w-9 rounded-md" /> {/* View Button */}
                    <Skeleton className="h-9 w-9 rounded-md" /> {/* Edit Button */}
                    <Skeleton className="h-9 w-9 rounded-md" /> {/* Delete Button */}
                  </div>
                </TableCell>
              </TableRow>
            ))
  )
}

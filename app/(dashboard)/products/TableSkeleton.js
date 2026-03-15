import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, MoreHorizontal } from "lucide-react"

const TableSkeleton = ({ itemsPerPage = 10 }) => {
  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          {/* Table Header - Exact match with original */}
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="w-12">
                <Checkbox disabled className="opacity-30" />
              </TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">Action</TableHead>
            </TableRow>
          </TableHeader>

          {/* Table Body with Skeleton Rows */}
          <TableBody>
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <TableRow key={index} className="border-b">
                {/* Checkbox column */}
                <TableCell>
                  <Skeleton className="h-4 w-4 rounded" />
                </TableCell>

                {/* Product Name column with image and text */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-[50px] w-[50px] rounded object-cover" />
                    <Skeleton className="h-4 w-32 font-medium" />
                  </div>
                </TableCell>

                {/* Category column */}
                <TableCell className="text-gray-600">
                  <Skeleton className="h-4 w-20" />
                </TableCell>

                {/* Stock column with badge-like skeleton */}
                <TableCell>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </TableCell>

                {/* Price column */}
                <TableCell className="font-medium">
                  <Skeleton className="h-4 w-16" />
                </TableCell>

                {/* Status column with chevron */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                </TableCell>

                {/* Action column with MoreHorizontal icon */}
                <TableCell>
                  <div className="h-8 w-8 p-0 flex items-center justify-center">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default TableSkeleton

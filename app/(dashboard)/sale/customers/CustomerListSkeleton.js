import { TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export default function CustomerListSkeleton() {
  return (
    <TableRow>
      <TableCell className="py-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      </TableCell>

      <TableCell className="py-4">
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>

      <TableCell className="text-center py-4">
        <Skeleton className="h-4 w-4 mx-auto" />
      </TableCell>

      <TableCell className="text-right py-4">
        <Skeleton className="h-4 w-24 ml-auto" />
      </TableCell>

      <TableCell className="text-center py-4">
        <Skeleton className="h-8 w-16 mx-auto rounded-md" />
      </TableCell>
    </TableRow>
  )
}

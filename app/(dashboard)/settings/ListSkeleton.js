import { Skeleton } from "@/components/ui/skeleton"

export default function ListSkeleton({total}) {
  return (
    <div className="w-full  mx-auto p-6 space-y-4">
      {/* Skeleton items */}
      {Array.from({ length: total }).map((_, index) => (
        <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
          {/* Left side - Item name skeleton */}
          <div className="flex-1">
            <Skeleton className="h-5 w-32" />
          </div>

          {/* Right side - Action buttons skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-12" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"
import ListSkeleton from "./ListSkeleton"


export default function SettingsSkeleton() {
  return (
    <div className="p-6  mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar Skeleton */}
            <Skeleton className="h-16 w-16 rounded-lg" />

            {/* Profile Info */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Change Button Skeleton */}
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <ListSkeleton total={10}/>
    </div>
  )
}

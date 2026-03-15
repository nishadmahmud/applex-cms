// import React from "react";
// import CustomPagination from "@/app/utils/CustomPagination";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Import } from "lucide-react";

// export default function ProductsPagination({
//   limit,
//   setLimit,
//   currentPage,
//   setCurrentPage,
//   totalProducts,
// }) {
//   const totalPage = Math.ceil(totalProducts / limit);
//   return (
//     <div className="flex items-center justify-between mt-6">
//       {/* Results Info */}
//       <div className="flex items-center gap-4">
//         <span className="text-sm text-gray-600 text-nowrap">
//           Result {`${currentPage}-${totalPage} of ${totalPage}`}
//         </span>
//         <div className="flex items-center gap-2">
//           <Select
//             defaultValue={String(limit)}
//             onValueChange={(value) => setLimit(value)}
//           >
//             <SelectTrigger className="w-16 h-8">
//               <SelectValue placeholder={limit} />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="10">10</SelectItem>
//               <SelectItem value="20">20</SelectItem>
//               <SelectItem value="50">50</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* Pagination */}
//       <CustomPagination
//         setCurrentPage={setCurrentPage}
//         currentPage={currentPage}
//         totalPage={totalPage}
//       />
//     </div>
//   );
// }

import React from "react";
import CustomPagination from "@/app/utils/CustomPagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductsPagination({
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalProducts,
}) {
  // If "all" selected → only 1 page
  const totalPage =
    limit === "all" ? 1 : Math.ceil(totalProducts / Number(limit || 1));

  return (
    <div className="flex items-center justify-between mt-6">
      {/* Info */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 text-nowrap">
          {limit === "all"
            ? `Result 1-${totalProducts} of ${totalProducts}`
            : `Result ${currentPage}-${totalPage} of ${totalPage}`}
        </span>

        {/* Limit Selector */}
        <Select
          defaultValue={String(limit)}
          onValueChange={(value) => setLimit(value)}
        >
          <SelectTrigger className="w-20 h-8 text-sm">
            <SelectValue placeholder={limit} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pagination controls (hidden if All) */}
      {limit !== "all" && (
        <CustomPagination
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          totalPage={totalPage}
        />
      )}
    </div>
  );
}

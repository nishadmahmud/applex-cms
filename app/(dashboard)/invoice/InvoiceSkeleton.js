export default function InvoiceSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6">
    
      {/* Logo and Invoice Header */}
      <div className="flex justify-between items-center mb-8">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
          <div>
            <div className="h-6 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>

        {/* Barcode and Invoice */}
        <div className="text-right">
          <div className="h-12 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-28 animate-pulse"></div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-1 bg-gray-300 mb-6"></div>

      {/* Customer Details Section */}
      <div className="mb-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>

        <div className="flex justify-between">
          {/* Left Side - Customer Info */}
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-0 animate-pulse"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-0 animate-pulse"></div>
            </div>
          </div>

          {/* Right Side - Order Info */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-4 bg-gray-200 rounded w-18 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="border border-gray-400 mb-6">
        {/* Table Header */}
        <div className="grid bg-gray-800" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
          <div className="p-3 border-r border-gray-400">
            <div className="h-4 bg-gray-600 rounded w-28 animate-pulse"></div>
          </div>
          <div className="p-3 border-r border-gray-400 text-center">
            <div className="h-4 bg-gray-600 rounded w-12 mx-auto animate-pulse"></div>
          </div>
          <div className="p-3 border-r border-gray-400 text-center">
            <div className="h-4 bg-gray-600 rounded w-8 mx-auto animate-pulse"></div>
          </div>
          <div className="p-3 text-center">
            <div className="h-4 bg-gray-600 rounded w-20 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Table Row */}
        <div className="grid border-b border-gray-400" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
          <div className="p-3 border-r border-gray-400">
            <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
          <div className="p-3 border-r border-gray-400 text-center">
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
          </div>
          <div className="p-3 border-r border-gray-400 text-center">
            <div className="h-4 bg-gray-200 rounded w-4 mx-auto animate-pulse"></div>
          </div>
          <div className="p-3 text-center">
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="flex justify-between mb-8">
        {/* QR Code and App Store Buttons */}
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Summary Calculations */}
        <div className="space-y-2 min-w-[200px]">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="flex justify-between bg-gray-800 p-2 rounded">
            <div className="h-4 bg-gray-600 rounded w-12 animate-pulse"></div>
            <div className="h-4 bg-gray-600 rounded w-16 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Thank You Message */}
      <div className="mb-6">
        <div className="h-6 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="h-1 bg-gray-300 mt-2"></div>
      </div>

      {/* Footer Contact Information */}
      <div className="flex justify-between">
        {/* Contact Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-40 mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="max-w-xs">
          <div className="h-5 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

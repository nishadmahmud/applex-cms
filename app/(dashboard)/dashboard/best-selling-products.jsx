import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
export default function BestSellingProducts({ products }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const router = useRouter();
  const handleRedirectToProduct = (product_id) => {
    router.push(`products/${product_id}`);
  };

  return (
    <Card className="shadow-sm h-80 md:h-96 overflow-hidden bg-card border-border rounded-md flex flex-col">
      <CardHeader className="bg-[#0073B7] p-3 flex flex-row items-center gap-2 shrink-0">
        <Star className="w-5 h-5 text-white" />
        <div className="flex flex-col gap-0.5 m-0 p-0">
          <CardTitle className="text-sm font-bold text-white tracking-wider uppercase m-0 p-0">Best Selling Products List</CardTitle>
          <CardDescription className="text-[10px] text-white/80 m-0 p-0">Top products by revenue</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-1 overflow-y-auto">
        <div className="space-y-1 divide-y divide-border/50">
          {products?.slice(0, 10).map((item, index) => {
            const product = item.product_info || {};
            return (
              <div
                onClick={() => handleRedirectToProduct(item?.product_id)}
                key={index}
                className="flex items-center justify-between p-3 hover:bg-gray-50/80 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 flex-1">
                  {product.image_path ? (
                    <img
                      src={
                        product.image_path ||
                        product.image_paths[0] ||
                        "/placeholder.svg"
                      }
                      alt={product.name}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                      📦
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-[13px] text-gray-900 group-hover:text-primary transition-colors">
                      {product.name || "Product"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {product.category?.name || "General"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-2 md:ml-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Qty: {item.total_quantity_sold || 0}
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    {formatCurrency(item.total_paid_amount || 0)} BDT
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

import { useGetCustomerListQuery } from "@/app/store/api/saleCustomerApi";
import { useGetVendorListQuery } from "@/app/store/api/purchaseVendorApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users, Banknote, CreditCard } from "lucide-react";

const fmt = (num) => Number(num || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const TopTable = ({ title, icon, data, columns, isLoading }) => {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="py-3 px-4 bg-slate-50 border-b border-slate-100">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-700">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : data?.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white hover:bg-white">
                  {columns.map((col, idx) => (
                    <TableHead key={idx} className={`py-2 px-4 h-10 ${col.align === "right" ? "text-right" : ""}`}>
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50">
                    {columns.map((col, cIdx) => (
                      <TableCell key={cIdx} className={`py-2 px-4 ${col.align === "right" ? "text-right" : ""}`}>
                        {col.render ? col.render(row) : row[col.accessor]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-48 text-sm text-slate-500">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function TopTablesWidget() {
  const { data: customerData, isLoading: custLoading } = useGetCustomerListQuery({ page: 1, limit: 100 });
  const { data: vendorData, isLoading: vendLoading } = useGetVendorListQuery({ page: 1, limit: 100 });

  const customers = customerData?.data?.data || customerData?.data || [];
  const vendors = vendorData?.data?.data || vendorData?.data || [];

  const topCustomers = [...customers]
    .sort((a, b) => Number(b.total_purchase_amount || 0) - Number(a.total_purchase_amount || 0))
    .slice(0, 7)
    .filter(c => Number(c.total_purchase_amount || 0) > 0);

  const topReceivables = [...customers]
    .sort((a, b) => Number(b.total_due_amount || 0) - Number(a.total_due_amount || 0))
    .slice(0, 7)
    .filter(c => Number(c.total_due_amount || 0) > 0);

  const topPayables = [...vendors]
    .sort((a, b) => Number(b.total_due_amount || 0) - Number(a.total_due_amount || 0))
    .slice(0, 7)
    .filter(v => Number(v.total_due_amount || 0) > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
      <TopTable
        title="Top Customers"
        icon={<Users className="w-5 h-5 text-indigo-500" />}
        data={topCustomers}
        isLoading={custLoading}
        columns={[
          { header: "Name", accessor: "name", render: (r) => <div className="font-medium line-clamp-1">{r.name}</div> },
          { header: "Purchase", accessor: "total_purchase_amount", align: "right", render: (r) => <span className="font-semibold text-slate-700">৳ {fmt(r.total_purchase_amount)}</span> },
        ]}
      />
      <TopTable
        title="Top Receivables"
        icon={<Banknote className="w-5 h-5 text-emerald-500" />}
        data={topReceivables}
        isLoading={custLoading}
        columns={[
          { header: "Customer", accessor: "name", render: (r) => <div className="font-medium line-clamp-1">{r.name}</div> },
          { header: "Due", accessor: "total_due_amount", align: "right", render: (r) => <span className="font-semibold text-emerald-600">৳ {fmt(r.total_due_amount)}</span> },
        ]}
      />
      <TopTable
        title="Top Payables"
        icon={<CreditCard className="w-5 h-5 text-rose-500" />}
        data={topPayables}
        isLoading={vendLoading}
        columns={[
          { header: "Vendor", accessor: "name", render: (r) => <div className="font-medium line-clamp-1">{r.name}</div> },
          { header: "Due", accessor: "total_due_amount", align: "right", render: (r) => <span className="font-semibold text-rose-600">৳ {fmt(r.total_due_amount)}</span> },
        ]}
      />
    </div>
  );
}

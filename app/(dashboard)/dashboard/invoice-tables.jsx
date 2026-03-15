"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function InvoiceTables({ salesInvoices, purchaseInvoices }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "N/A";
    }
  };

  const getStatusBadge = (status) => {
    if (status === 1) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          Completed
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
        Pending
      </span>
    );
  };

  const getDueBadge = (due) => {
    const dueAmount = Number.parseFloat(due);
    if (dueAmount === 0) {
      return <span className="text-green-600 font-medium">Paid</span>;
    } else if (dueAmount < 0) {
      return (
        <span className="text-blue-600 font-medium">
          {formatCurrency(Math.abs(dueAmount))} BDT
        </span>
      );
    }
    return (
      <span className="text-red-600 font-medium">
        {formatCurrency(dueAmount)} BDT
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Recent Selling Invoices */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Selling Invoice
          </CardTitle>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View All <ExternalLink className="w-4 h-4" />
          </button>
        </CardHeader>
        <CardContent>
          {!salesInvoices || salesInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sales invoices available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">
                      Name
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">
                      Amount
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">
                      Due
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">
                      Date/Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesInvoices.slice(0, 7).map((invoice) => {
                    const dueAmount =
                      Number.parseFloat(invoice.sub_total || 0) -
                      Number.parseFloat(invoice.paid_amount || 0);
                    return (
                      <tr
                        key={invoice.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {invoice.invoice_id}
                            </p>
                            <p className="text-xs text-gray-500">
                              {invoice.customer_name || "N/A"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.sub_total || 0)} BDT
                        </td>
                        <td className="py-3 px-2 text-right text-sm">
                          {getDueBadge(dueAmount)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="text-sm text-gray-900">
                            {new Date(invoice.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(invoice.created_at)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Purchase Invoices */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Purchase Invoice
          </CardTitle>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View All <ExternalLink className="w-4 h-4" />
          </button>
        </CardHeader>
        <CardContent>
          {!purchaseInvoices || purchaseInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No purchase invoices available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">
                      Name
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">
                      Amount
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">
                      Due
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">
                      Date/Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseInvoices.slice(0, 7).map((invoice) => {
                    const dueAmount =
                      Number.parseFloat(invoice.sub_total || 0) -
                      Number.parseFloat(invoice.paid_amount || 0);
                    return (
                      <tr
                        key={invoice.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {invoice.invoice_id}
                            </p>
                            <p className="text-xs text-gray-500">
                              {invoice.vendor_name || "N/A"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.sub_total || 0)} BDT
                        </td>
                        <td className="py-3 px-2 text-right text-sm">
                          {getDueBadge(dueAmount)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="text-sm text-gray-900">
                            {new Date(invoice.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(invoice.created_at)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

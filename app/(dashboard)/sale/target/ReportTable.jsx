/* eslint-disable react/prop-types */
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ReportTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Target Qty</TableHead>
          <TableHead>Achieved Qty</TableHead>
          <TableHead>Qty %</TableHead>
          <TableHead>Target Amount</TableHead>
          <TableHead>Achieved Amount</TableHead>
          <TableHead>Amount %</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((item) => (
          <TableRow key={item.product_info.id}>
            <TableCell>{item.product_info.name}</TableCell>
            <TableCell>{item.target_quantity}</TableCell>
            <TableCell>{item.achieved_quantity}</TableCell>
            <TableCell>
              {Number(item.achieved_quantity_percentage).toFixed(2)}%
            </TableCell>
            <TableCell>{item.target_amount}</TableCell>
            <TableCell>{item.achieved_amount}</TableCell>
            <TableCell>
              {Number(item.achieved_amount_percentage).toFixed(2)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

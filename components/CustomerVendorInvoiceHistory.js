import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import Link from 'next/link'
import { Eye } from 'lucide-react'

export default function CustomerVendorInvoiceHistory({partyWiseInvoice}) {
    return (
        <Card >
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Invoice History</CardTitle>
                <Button variant="link" className="text-blue-600">
                    View All
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Date/Time</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {partyWiseInvoice?.data?.data && partyWiseInvoice?.data?.data?.length ?
                            partyWiseInvoice.data.data.map((invoice) => (
                                <TableRow key={invoice?.id}>
                                    <TableCell className="font-medium">{invoice?.invoice_id}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="text-sm text-muted-foreground">{
                                                invoice?.invoice_id &&
                                                new Date(
                                                    invoice.invoice_id
                                                        .split('-')
                                                        .slice(1, 4)
                                                        .join('-')
                                                ).toLocaleDateString('en-GB', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: '2-digit',
                                                })
                                            }</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold">{invoice?.sub_total?.toLocaleString()}</TableCell>
                                    <TableCell className="font-semibold">{invoice?.sub_total - invoice?.paid_amount}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                            {invoice?.status ? "Completed" : " On Hold"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/invoice/${invoice?.invoice_id}`}>
                                            <Button variant="outline" size="sm" className="text-blue-600 bg-transparent">
                                                <Eye className="w-4 h-4 mr-1" />
                                                VIEW
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            )) :
                            <TableRow>
                                <TableCell>No Invoice Available</TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </CardContent>
        </Card >
    )
}

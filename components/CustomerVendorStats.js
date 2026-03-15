import React from 'react'
import { Card, CardContent } from './ui/card'
import { Calendar, CreditCard, FileText, Package, RotateCcw, TrendingUp } from 'lucide-react'

export default function CustomerVendorStats({partyData}) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Customer History</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-green-600 font-medium">Total Purchase Amount</p>
                                <p className="text-xl font-bold text-green-700">
                                    {(partyData?.data?.invoice_list_sum_sub_total)?.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Total Due</p>
                                <p className="text-xl font-bold text-blue-700">{(partyData?.data?.due)?.toLocaleString("en-IN")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-orange-600 font-medium">Last Purchase Date</p>
                                <p className="text-lg font-bold text-orange-700">{
                                    partyData?.data?.last_invoice_list?.invoice_id &&
                                    new Date(
                                        partyData.data.last_invoice_list.invoice_id
                                            .split('-')
                                            .slice(1, 4)
                                            .join('-')
                                    ).toLocaleDateString('en-GB', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: '2-digit',
                                    })
                                }</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Package className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-purple-600 font-medium">Total Purchase Product</p>
                                <p className="text-2xl font-bold text-purple-700">
                                    {partyData?.data?.vendor_product}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <RotateCcw className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-red-600 font-medium">Number of Return Product</p>
                                <p className="text-2xl font-bold text-red-700">{partyData?.data?.return_product}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-cyan-200 bg-cyan-50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-cyan-100 rounded-lg">
                                <FileText className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-sm text-cyan-600 font-medium">Total Invoice</p>
                                <p className="text-2xl font-bold text-cyan-700">{partyData?.data?.invoice_list_count}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

'use client'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowUpLeft, DollarSign } from 'lucide-react'
import React, { useState } from 'react'
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'),{ssr : false});

export default function MonthlyEarnings() {
    const [monthlyState] = useState({
        series: [
            {
                name: "Earnings",
                data: [20, 45, 30, 55, 35, 50, 40],
            },
        ],
        options: {
            chart: {
                type: "area",
                height: 60,
                sparkline: { enabled: true },
            },
            stroke: {
                curve: "smooth",
                width: 2,
            },
            colors: ["#06B6D4"],
            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.3,
                    opacityTo: 0.1,
                    stops: [0, 90, 100],
                },
            },
        },
    })
    return (
        <div>
            <Card>
                <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Monthly Earnings</h3>
                        <div className="p-2 bg-blue-600 rounded-full">
                            <DollarSign className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">$6,820</p>
                        <div className="flex items-center gap-1 mt-1 mb-4">
                            <span className="bg-red-500/20 text-red-500 text-sm p-1 rounded-full rotate-180">
                                <ArrowUpLeft size={18} />
                            </span>
                            <span className="text-red-500 text-sm">+9%</span>
                            <span className="text-gray-500 text-sm">last year</span>
                        </div>
                    </div>
                    <div className="h-16">
                        <ReactApexChart options={monthlyState.options} series={monthlyState.series} type="area" height={60} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

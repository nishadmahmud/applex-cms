'use client'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowUpLeft } from 'lucide-react'
import React, { useState } from 'react'
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'),{ssr : false});

export default function CustomerStats() {
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
    });

    return (
        <div>
            <Card>
                <CardContent className="relative p-0">
                    <div className='p-6'>
                        <h3 className="text-sm  text-[#2A3547] text-center">Customers</h3>
                        <div className='text-center'>
                            <p className="text-[21px] font-medium text-gray-900">$36,358</p>
                            <div className="flex items-center justify-center gap-1 mt-1 mb-4">
                                <span className="bg-red-500/20 text-red-500 text-sm p-1 rounded-full rotate-180">
                                    <ArrowUpLeft size={18} />
                                </span>
                                <span className="text-red-500 text-sm"> +9%</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-16">
                        <ReactApexChart options={monthlyState.options} series={monthlyState.series} type="area" height={60} width="100%" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

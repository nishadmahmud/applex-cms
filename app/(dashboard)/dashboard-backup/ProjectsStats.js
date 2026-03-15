'use client'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowUpLeft } from 'lucide-react'
import React, { useState } from 'react'
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'),{ssr : false});

export default function ProjectsStats() {
    const [projectsState] = useState({
        series: [
            {
                name: "Projects",
                data: [20, 35, 45, 30, 40, 25, 10, 50, 30],
            },
        ],
        options: {
            chart: {
                type: "bar",
                height: 60,
                sparkline: { enabled: true },
            },
            plotOptions: {
                bar: {
                    columnWidth: "20%",
                    borderRadius: 2,
                },
            },
            colors: ["#06B6D4"],
        },
    })
    return (
        <div>
            <Card>
                <CardContent className="p-0">
                    <div className='p-6'>

                        <h3 className="text-sm  text-[#2A3547] text-center">Projects</h3>
                        <p className="text-[21px] font-medium text-gray-900 text-center">78,298</p>
                        <div className="flex items-center justify-center gap-1 mt-1 mb-4">
                            <span className="bg-green-500/20 text-green-500 text-sm p-1 rounded-full ">
                                <ArrowUpLeft size={18} />
                            </span>
                            <span className="text-green-500 text-sm"> +9%</span>
                        </div>
                        <div className="h-16">
                            <ReactApexChart options={projectsState.options} series={projectsState.series} type="bar" height={60} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

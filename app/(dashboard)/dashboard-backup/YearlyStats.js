'use client'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowUpLeft, Circle } from 'lucide-react'
import React, { useState } from 'react'
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'),{ssr : false});


export default function YearlyStats() {
    const [state] = useState({
          
            series: [44, 55, 41],
            
            tooltip : false,
            options: {
              chart: {
                type: 'donut',
                height : 200,
                width : 200
              },
              legend : {
                show : false
              },
              dataLabels : {
                enabled : false
              },
              fill : {
                colors: ['#6366F1', '#E8F7FF','#F9F9FD'],

              },
              tooltip : {
                theme : false

              },
              subtitle : {
                style : {
                    color : '#000000',
                    background : '#ffffff'
                }
              },
              responsive: [{
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }]
            },
          
          
        });
    return (
        <div className='overflow-x-hidden'>
            {/* Yearly Breakup */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className='flex flex-col gap-6'>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yearly Breakup</h3>
                            <div className='flex flex-col gap-3'>
                                <p className="text-2xl font-bold text-gray-900">$36,358</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="bg-green-500/20 text-green-500 text-sm p-1 rounded-full">
                                        <ArrowUpLeft size={18}/>
                                    </span>
                                    <span className="text-green-500 text-sm">+9%</span>
                                    <span className="text-gray-500 text-sm">last year</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                                <Circle className="h-3 w-3 text-blue-600 fill-current" />
                                <span className="text-sm text-gray-600">2025</span>
                                <span className="text-sm text-gray-900 ml-8">2025</span>
                            </div>
                        </div>
                        <div className="relative ">
                            <ReactApexChart width={200}  options={state.options}  series={state.series} type="donut" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

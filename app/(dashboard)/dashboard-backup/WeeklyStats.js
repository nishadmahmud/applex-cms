'use client'
import { Card, CardContent } from '@/components/ui/card'
import { TbGridDots } from "react-icons/tb";
import React, { useState } from 'react'
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'),{ssr : false});

export default function WeeklyStats() {
     const [weeklyState] = useState({
            series: [
                {
                    name: "Earnings",
                    data: [0,20, 45, 0, 55, 0],
                },
            ],
            options: {
                chart: {
                    type: "area",
                    height: 120,
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
                        opacityFrom: 0.5,
                        opacityTo: 0.2,
                        stops: [0, 90, 100],
                    },
                },
                yaxis : {
                    show: false,
                    min : 0,
                    max : 55
                }
            },
        })
  return (
    <div>
      <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Weekly Stats</h3>
              <p className="text-sm text-gray-500 mb-4">Average sales</p>

              <div className=" mb-4">
                <ReactApexChart options={weeklyState.options} series={weeklyState.series} type="area" height={150} width="100%" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <TbGridDots className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Top Sales</p>
                    <p className="text-sm text-gray-500">Johnathan Doe</p>
                  </div>
                  <span className="ml-auto text-sm bg-[#ECF2FF] #E6FFFA px-2 py-1 font-medium text-blue-500 rounded-md">+68</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded">
                    <TbGridDots className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Best Seller</p>
                    <p className="text-sm text-gray-500">Footware</p>
                  </div>
                  <span className="ml-auto text-sm bg-[#E6FFFA] px-2 py-1 font-medium text-green-500 rounded-md">+45</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded">
                    <TbGridDots className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Most Connected</p>
                    <p className="text-sm text-gray-500">Fashionware</p>
                  </div>
                  <span className="ml-auto text-sm bg-[#FEE2E2] px-2 py-1 font-medium text-red-500 rounded-md">+14</span>
                </div>
              </div>
            </CardContent>
          </Card>
    </div>
  )
}

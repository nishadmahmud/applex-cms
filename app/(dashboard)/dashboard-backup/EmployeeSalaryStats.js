'use client'
import { Card, CardContent } from '@/components/ui/card'
import React, { useState } from 'react'
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'),{ssr : false});
import { TbGridDots } from "react-icons/tb";
export default function EmployeeSalaryStats() {
    const getCurrentMonthColors = () => {
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() // 0-11 (Jan-Dec)

        // Define our chart months (Apr=3, May=4, June=5, July=6, Aug=7, Sept=8)
        const chartMonths = [3, 4, 5, 6, 7, 8] // April to September (0-indexed)
        const monthNames = ["Apr", "May", "June", "July", "Aug", "Sept"]

        // Find current month index in our chart
        const currentChartIndex = chartMonths.indexOf(currentMonth)

        // If current month is not in chart range, you can:
        // Option 1: Default to a specific month (e.g., July)
        // Option 2: Highlight no month
        // Option 3: Use a different logic

        const highlightIndex = currentChartIndex !== -1 ? currentChartIndex : 3 // Default to July if not found

        // Generate colors array
        return Array.from({ length: 6 }, (_, index) => (index === highlightIndex ? "#6366F1" : "#E2E8F0"))
    }

    const [salaryState] = useState({
        series: [
            {
                name: "Salary",
                data: [20, 15, 30, 25, 15, 20], // All months have actual values
            },
        ],
        options: {
            chart: {
                type: "bar",
                height: 160,
                toolbar: { show: false },
            },
            plotOptions: {
                bar: {
                    columnWidth: "30%",
                    borderRadius: 4,
                    distributed: true, // Enable different colors per bar
                },
            },
            colors: getCurrentMonthColors(), // Light gray for all except current month (July)
            dataLabels: { enabled: false },
            legend: { show: false },
            grid: { show: false },
            xaxis: {
                categories: ["Apr", "May", "June", "July", "Aug", "Sept"],
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: { style: { fontSize: "10px", colors: "#9CA3AF" } },
            },
            yaxis: {
                show: false,
                min: 0,
                max: 30,
            },
            tooltip: {
                y: {
                    formatter: (val) => "$" + val + "k",
                },
            },
        },
    })

    return (
        <Card >
            <CardContent className="p-6 space-y-5 h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Salary</h3>
                <p className="text-sm text-gray-500 mb-4">Every month</p>
                <div className="h-[13.5rem]">
                    <ReactApexChart options={salaryState.options} series={salaryState.series} type="bar"  height={216}/>
                </div>
                <div className='flex justify-between items-center'>
                    <div className="flex items-center gap-5">
                        <div className="p-[6px] bg-[#ECF2FF] w-fit text-blue-500 text-2xl rounded-lg">
                            <TbGridDots />
                        </div>
                        <div>
                            <p className="text-[#2A3547] text-sm">Salary</p>
                            <p className="text-[#2A3547]  font-bold">$36,358</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="p-[6px] bg-[#ECF2FF] w-fit text-gray-700 text-2xl rounded-lg">
                            <TbGridDots />
                        </div>
                        <div>
                            <p className="text-[#2A3547] text-sm">Profit</p>
                            <p className="text-[#2A3547]  font-bold">$5,296</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

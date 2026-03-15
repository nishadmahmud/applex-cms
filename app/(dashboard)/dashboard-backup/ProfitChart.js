'use client'

import { useEffect, useRef, useState } from "react"
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'),{ssr : false});
import { TbGridDots } from "react-icons/tb";
import { RiArrowDropDownFill } from "react-icons/ri";
import { useSidebar } from "@/components/ui/sidebar";
import React from "react";
const ProfitChart = () => {

    const [profitState] = useState({
        series: [
            {
                data: [
                    {
                        x: '2008',
                        y: [2800, 4500]
                    },
                    {
                        x: '2009',
                        y: [3200, 4100]
                    },
                    {
                        x: '2010',
                        y: [2950, 7800]
                    },
                    {
                        x: '2011',
                        y: [3000, 4600]
                    },
                    {
                        x: '2012',
                        y: [3500, 4100]
                    },
                    {
                        x: '2013',
                        y: [4500, 6500]
                    },
                    {
                        x: '2014',
                        y: [4100, 5600]
                    }
                ]
            }
        ],
        options: {
            chart: {
                height: '100%',
                type: 'rangeBar',
                zoom: {
                    enabled: false
                },
                redrawOnWindowResize: true, // Enable redraw on window resize
                redrawOnParentResize: true,
            },
            plotOptions: {
                bar: {
                    isDumbbell: true,
                    columnWidth: 10, // Increased from 3 to 10 for more gap
                    dumbbellColors: [['#008FFB', '#00E396']],

                }
            },
            legend: {
                show: false,
                showForSingleSeries: true,
                position: 'right',
                horizontalAlign: 'center',
                // customLegendItems: ['Product A', 'Product B']
            },
            fill: {
                type: 'gradient',
                gradient: {
                    type: 'vertical',
                    gradientToColors: ['#00E396'],
                    inverseColors: true,
                    stops: [0, 100]
                }
            },
            grid: {
                strokeDashArray: 6,
                xaxis: {
                    lines: {
                        show: false
                    }
                },
                yaxis: {
                    lines: {
                        show: true,

                    }
                }
            },
            xaxis: {
                tickPlacement: 'on'
            },
            responsive: [
                {
                    breakpoint: 1000,
                    options: {
                        chart: {
                            width: '100%'
                        }
                    }
                }
            ]
        },
        chart: {
            redrawOnParentResize: true
        }

    });
    const { open } = useSidebar();

    const [selected, setSelected] = useState("March 2025");
    const [showOptions, setShowOptions] = useState(false);
    const dropdownRef = useRef(null);
    const handleOptionChange = (value) => {
        setShowOptions(!showOptions);
        setSelected(value);
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    
    return (
      <div className="border rounded-2xl p-5 h-full">
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-[#2A3547] text-lg font-semibold">
              Revenue Updates
            </p>
            <p>Overview of Profit</p>
          </div>
          <div
            ref={dropdownRef}
            onClick={() => setShowOptions(!showOptions)}
            className={`relative flex items-center justify-between border text-sm ${
              showOptions ? "border-2 border-blue-500" : ""
            } font-medium px-[14px] py-1 h-fit text-[#2A3547] rounded-lg cursor-pointer`}
          >
            <p>{selected}</p>
            <RiArrowDropDownFill
              size={28}
              className={`text-gray-700 ${
                showOptions ? "rotate-180" : ""
              } tranform transition-transform duration-300`}
            />
            {showOptions && (
              <div className="absolute w-full border bg-white left-0 top-10 rounded-xl">
                <div
                  className={`${
                    selected === "March 2025" ? "bg-blue-500/10" : ""
                  } hover:bg-blue-500/10 text-center rounded-t-xl`}
                >
                  <p
                    className="text-nowrap px-4 py-[2px] "
                    onClick={() => handleOptionChange("March 2025")}
                  >
                    March 2025
                  </p>
                </div>
                <div
                  className={`${
                    selected === "April 2025" ? "bg-blue-500/10" : ""
                  } hover:bg-blue-500/10 text-center`}
                >
                  <p
                    className="text-nowrap px-4 py-[2px] "
                    onClick={() => handleOptionChange("April 2025")}
                  >
                    April 2025
                  </p>
                </div>
                <div
                  className={`${
                    selected === "May 2025" ? "bg-blue-500/10" : ""
                  } hover:bg-blue-500/10 text-center rounded-b-xl`}
                >
                  <p
                    className="text-nowrap px-4 py-[2px] "
                    onClick={() => handleOptionChange("May 2025")}
                  >
                    May 2025
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div id="chart" className="flex gap-5 ">
          <div key={open} className="flex-1">
            {typeof window === "undefined" ? (
              <div className="h-[360px] w-[406px]"></div>
            ) : (
              <div className="h-[360px] ">
                <ReactApexChart
                  width={open ? 406 : 575}
                  height="360"
                  options={profitState.options}
                  series={profitState.series}
                  type="rangeBar"
                />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between">
            <div className="flex items-center gap-5">
              <div className="p-[6px] bg-[#ECF2FF] w-fit text-blue-500 text-2xl rounded-lg">
                <TbGridDots />
              </div>
              <div>
                <p className="text-[#2A3547] text-2xl font-bold">$63,489.50</p>
                <p className="text-[#2A3547] text-sm">Total Earnings</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-2 h-2 rounded-full bg-[#018FFB]"></div>
              <div>
                <p className="text-sm text-[#2A3547]">Earnings this month</p>
                <p className="text-lg text-[#2A3547] font-semibold">$48,820</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-2 h-2 rounded-full bg-[#00E396]"></div>
              <div>
                <p className="text-sm text-[#2A3547]">Expense this month</p>
                <p className="text-lg text-[#2A3547] font-semibold">$26,498</p>
              </div>
            </div>
            <button className="bg-[#5D87FF] hover:bg-[#4570EA] py-2 rounded-lg text-white">
              View Full Report
            </button>
          </div>
        </div>
      </div>
    );
}


export default ProfitChart;      
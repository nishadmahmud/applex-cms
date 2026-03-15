'use client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import React, { useEffect, useRef, useState } from 'react'
import { RiArrowDropDownFill } from 'react-icons/ri'

export default function TopProjects() {
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
        <div className="lg:col-span-2">
            <div >
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Top Projects</h3>
                                <p className="text-sm text-gray-500">Best Products</p>
                            </div>
                            <div ref={dropdownRef} onClick={() => setShowOptions(!showOptions)} className={`relative flex items-center justify-between border text-sm ${showOptions ? 'border-2 border-blue-500' : ''} font-medium px-[14px] py-1 h-fit text-[#2A3547] rounded-lg cursor-pointer`}>
                                <p >{selected}</p>
                                <RiArrowDropDownFill size={28} className={`text-gray-700 ${showOptions ? 'rotate-180' : ''} tranform transition-transform duration-300`} />
                                {
                                    showOptions &&
                                    <div className="absolute w-full border bg-white left-0 top-10 rounded-xl">
                                        <div className={`${selected === 'March 2025' ? 'bg-blue-500/10' : ''} hover:bg-blue-500/10 text-center rounded-t-xl`}>
                                            <p className="text-nowrap px-4 py-[2px] " onClick={() => handleOptionChange("March 2025")}>March 2025</p>
                                        </div>
                                        <div className={`${selected === 'April 2025' ? 'bg-blue-500/10' : ''} hover:bg-blue-500/10 text-center`}>
                                            <p className="text-nowrap px-4 py-[2px] " onClick={() => handleOptionChange("April 2025")}>April 2025</p>
                                        </div>
                                        <div className={`${selected === 'May 2025' ? 'bg-blue-500/10' : ''} hover:bg-blue-500/10 text-center rounded-b-xl`}>
                                            <p className="text-nowrap px-4 py-[2px] " onClick={() => handleOptionChange("May 2025")}>May 2025</p>
                                        </div>

                                    </div>
                                }
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 text-sm font-medium text-gray-500">Assigned</th>
                                        <th className="text-left py-3 text-sm font-medium text-gray-500">Project</th>
                                        <th className="text-left py-3 text-sm font-medium text-gray-500">Priority</th>
                                        <th className="text-left py-3 text-sm font-medium text-gray-500">Budget</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback>SJ</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">Sunil Joshi</p>
                                                    <p className="text-xs text-gray-500">Web Designer</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm">Elite Admin</td>
                                        <td className="py-4">
                                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                Low
                                            </Badge>
                                        </td>
                                        <td className="py-4 text-sm">$3.9k</td>
                                    </tr>
                                    <tr>
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback>JD</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">John Deo</p>
                                                    <p className="text-xs text-gray-500">Web Developer</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm">Flexy Admin</td>
                                        <td className="py-4">
                                            <Badge variant="secondary" className="bg-[#FEF5E5] text-yellow-500">
                                                Medium
                                            </Badge>
                                        </td>
                                        <td className="py-4 text-sm">$24.5k</td>
                                    </tr>
                                    <tr>
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback>NJ</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">Nirav Joshi</p>
                                                    <p className="text-xs text-gray-500">Web Manager</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm">Material Pro</td>
                                        <td className="py-4">
                                            <Badge variant="secondary" className="bg-[#FDEDE8] text-red-400">
                                                High
                                            </Badge>
                                        </td>
                                        <td className="py-4 text-sm">$12.8k</td>
                                    </tr>
                                    <tr>
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback>YS</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">Yuvraj Sheth</p>
                                                    <p className="text-xs text-gray-500">Project Manager</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm">Xtreme Admin</td>
                                        <td className="py-4">
                                            <Badge variant="secondary" className="bg-[#E8F7FF] text-[#49BEFF]">
                                                Very High
                                            </Badge>
                                        </td>
                                        <td className="py-4 text-sm">$2.4k</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


import Image from "next/image"
const stats = [
  {
    title: "Employees",
    value: "96",
    icon: '/icon-user-male.svg',
    bgColor: "bg-[#ECF2FF]",
    iconColor: "text-purple-600",
    textColor: "text-[#5D87FF]",
  },
  {
    title: "Clients",
    value: "3,650",
    icon: '/icon-briefcase.svg',
    bgColor: "bg-[#FEF5E5]",
    iconColor: "text-orange-600",
    textColor: "text-[#FFAE1F]",
  },
  {
    title: "Projects",
    value: "356",
    icon: '/icon-mailbox.svg',
    bgColor: "bg-[#E8F7FF]",
    iconColor: "text-cyan-600",
    textColor: "text-[#49BEFF]",
  },
  {
    title: "Events",
    value: "696",
    icon: '/icon-favorites.svg',
    bgColor: "bg-[#FDEDE8]",
    iconColor: "text-red-600",
    textColor: "text-[#FA896B]",
  },
  {
    title: "Payroll",
    value: "$96k",
    icon: '/icon-speech-bubble.svg',
    bgColor: "bg-[#E6FFFA]",
    iconColor: "text-green-600",
    textColor: "text-[#13DEB9]",
  },
  {
    title: "Reports",
    value: "59",
    icon: '/icon-connect.svg',
    bgColor: "bg-[#EBF3FE]",
    iconColor: "text-blue-600",
    textColor: "text-[#539BFF]",
  },
]
import React from "react"

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} flex flex-col justify-center items-center rounded-xl p-4 relative overflow-hidden`}>
          <div
            className={` w-12 h-12 bg-gradient-to-br  rounded-lg flex items-center justify-center`}
          >

            <Image src={stat.icon} height={60} width={60} alt={stat.title}/>
          </div>
          <div className={`${stat.textColor} mt-8 text-center`}>
            <p className="text-sm  mb-1">{stat.title}</p>
            <p className="text-2xl font-bold ">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

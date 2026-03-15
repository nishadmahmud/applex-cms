import { MessageCircle } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

export default function Notification() {
    return (
        <div>
            <div className="">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    {/* Main notification content */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                            <Image
                                src="/placeholder.svg?height=48&width=48"
                                alt="Profile avatar"
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-gray-900 font-semibold text-lg leading-tight mb-1">Super awesome, Vue coming soon!</h3>
                            <p className="text-gray-500 text-sm">22 March, 2025</p>
                        </div>
                    </div>

                    {/* Bottom section with avatars and chat icon */}
                    <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                                <Image
                                    src="/placeholder.svg?height=32&width=32"
                                    alt="User avatar"
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                                <Image
                                    src="/placeholder.svg?height=32&width=32"
                                    alt="User avatar"
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                                <Image
                                    src="/placeholder.svg?height=32&width=32"
                                    alt="User avatar"
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                                <Image
                                    src="/placeholder.svg?height=32&width=32"
                                    alt="User avatar"
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="w-10 h-10 bg-[#ECF2FF] rounded-xl flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel'
import Link from 'next/link'
import Image from 'next/image'

export default function CustomerVendorPurchaseProduct({partyWiseProduct}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Most Purchase Products</CardTitle>
                <Button variant="link" className="text-blue-600">
                    View All
                </Button>
            </CardHeader>
            <CardContent>
                {
                    partyWiseProduct?.data?.data && partyWiseProduct?.data?.data?.length ?
                        <Carousel
                            opts={{
                                loop: true
                            }}
                            className="w-full "
                        >
                            <CarouselContent className="-ml-1">
                                {
                                    partyWiseProduct.data.data.map((item) => (
                                        <CarouselItem key={item?.product_id} className="pl-1 md:basis-1/2 lg:basis-1/3">
                                            <Link href={`/products/${item?.product_id}`}>
                                                <div className="p-1">
                                                    <Card className="p-5">
                                                        <CardContent className="flex aspect-square items-center justify-center">
                                                            <Image src={item?.product_info?.image_path || `https://pos.outletexpense.com//layoutlogo.svg`} alt={item?.product_info?.name} height={100} width={200} />
                                                        </CardContent>
                                                        <div className="flex items-start gap-3 justify-between">
                                                            <CardTitle className="text-sm h-[40px] line-clamp-2 text-ellipsis">
                                                                {item?.product_info?.name}
                                                            </CardTitle>
                                                            <CardTitle className="text-sm ">
                                                                {item?.product_info?.brands?.name}
                                                            </CardTitle>
                                                        </div>
                                                        <CardDescription className="mt-2 space-y-1">
                                                            <p className="text-sm font-semibold">#{item?.product_info?.barcode}</p>
                                                            <p className="font-bold text-base text-[#000232]">{item?.product_info?.retails_price} BDT</p>
                                                        </CardDescription>
                                                    </Card>
                                                </div>
                                            </Link>
                                        </CarouselItem>

                                    ))}
                            </CarouselContent>
                            <CarouselPrevious className="-left-[1.5rem]" />
                            <CarouselNext className="-right-[1.5rem]" />
                        </Carousel> : "No Products Available"
                }

            </CardContent>
        </Card>
    )
}

'use client'
import { useState } from "react"
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { format } from "date-fns"

export default function CustomDatePicker({setValue,fieldName,type=null}) {
    const [date, setDate] = useState(Date.now());

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full pl-3 text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    {type && date? format(date, "M/d/yyyy")  : date ? format(date, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                        setDate(date);
                        setValue?.(fieldName,date)
                    }}
                    // disabled={(date) =>
                    //     date > new Date() || date < new Date("1900-01-01")
                    // }
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}

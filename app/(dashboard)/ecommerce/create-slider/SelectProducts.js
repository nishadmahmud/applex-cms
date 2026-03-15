"use client"
import { Check, ChevronsUpDown } from "lucide-react"
import { act, useState } from 'react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import useProduct from "@/apiHooks/hooks/useProduct"


export default function SelectProducts({updateSlide,id,action,selectedProduct=null}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const {data : products} = useProduct();

  


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full bg-transparent hover:bg-transparent justify-between"
        >
          {action === 'edit' ? 
          products?.data?.data?.data.find((product) => product.id == selectedProduct[0] || product.id == selectedProduct)?.name
          :
          value
            ? products?.data?.data?.data.find((product) => product.id == value)?.name
            :  "Select Product..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search product..." className="h-9" />
          <CommandList>
            <CommandEmpty>No product found.</CommandEmpty>
            <CommandGroup>
              {products?.data?.data?.data.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id.toString()}
                  onSelect={(currentValue) => {
                    setValue(currentValue == value ? "" : currentValue)
                    setOpen(false)
                    action === 'edit'? updateSlide('product_id',currentValue,id) :updateSlide(id,{product_id : currentValue})
                  }}
                >
                  {product.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      value == product.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}



import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X } from 'lucide-react';
import React from 'react'

// eslint-disable-next-line react/prop-types
export default function SelectedList({list,onRemove,setSelected,selected,getType}) {

    const onUpdateDiscount = (id,field,value,type) => {
      const updatedItem = selected.map(item => {
        if(item.type === type && item.value === id){
          return {
            ...item,
            [field]: value,
          };
        }else if(item.pivot && getType(item.pivot) === type && item.id === id){
              return {
                ...item,
                pivot: {
                  ...item.pivot,
                  [field]: value,
                },
              };
            }
          else return item;
        });
        setSelected(updatedItem);
    }

    

  return (
    <Card>
      <CardHeader>
        <CardTitle>Targeted Product & Discount Assignment</CardTitle>
        <CardDescription>
          Select categories, subcategories, child categories, or individual
          products and assign specific discounts to each
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead className="w-12">Type</TableHead>
                <TableHead className="w-32">Discount Type</TableHead>
                <TableHead className="w-32">Discount Value</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* eslint-disable-next-line react/prop-types */}
              {list.map((item) => (
                <TableRow key={item.value || item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {item.label || item.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="text-xs text-nowrap">
                      {item.pivot ? getType(item.pivot) : item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={
                        item.pivot
                        ? item.pivot.discount_type
                        : item.discount_type
                      }
                      onValueChange={(value) => {
                        // console.log(item.pivot.discount_type)
                        onUpdateDiscount(
                          item.value ? item.value : item.id,
                          "discount_type",
                          value,
                          item.pivot ? getType(item.pivot) : item.type
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Input
                        type="text"
                        onBlur={(e) =>
                          onUpdateDiscount(
                            item.value ? item.value : item.id,
                            "discount",
                            parseInt(e.target.value),
                            item.pivot ? getType(item.pivot) : item.type
                          )
                        }
                        defaultValue={item.pivot ? item.pivot.discount : ""}
                        className="w-20"
                      />
                      {/* <span className="text-sm text-muted-foreground">
                        {item.discount_type === "percentage"
                          ? "%"
                          : item.pivot.discount_type === "percentage"
                          ? "%"
                          : "$"}
                      </span> */}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      onClick={() =>
                        onRemove(
                          item.value ? item.value : item.id,
                          selected,
                          setSelected,
                          item.pivot ? getType(item.pivot) : null
                        )
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* {discountItems.length > 0 && (
          <DiscountItemsList
            items={discountItems}
            onUpdateDiscount={handleUpdateDiscount}
            onRemoveItem={handleRemoveItem}
          />
        )} */}
      </CardContent>
    </Card>
  );
}

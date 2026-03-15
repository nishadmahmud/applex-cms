import React from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { AvatarFallback } from "./ui/avatar";
import Link from "next/link";
import { Button } from "./ui/button";
import { Edit3, Mail, MessageCircle, MessageSquare, Phone } from "lucide-react";
import { Separator } from "./ui/separator";
import BalanceActions from "@/app/(dashboard)/sale/customers/customer/[id]/BalanceActions";
import CustomerVendorPaymentHistory from "./CustomerVendorPaymentHistory";
import { usePathname } from "next/navigation";

export default function CustomerVendorProfile({
  partyData,
  dueCollection,
  dueInvoiceList,
  party_id,
}) {
  const pathName = usePathname();
  const party = pathName.includes("purchase");
  return (
    <div className="lg:col-span-2 space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={partyData?.data?.image || "/placeholder.svg"}
                alt={partyData?.data?.name}
              />
              <AvatarFallback className="text-lg font-semibold">
                {partyData?.data?.name[0] || ""}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{partyData?.data?.name}</h3>
              <Link
                href={
                  !party
                    ? `/sale/customers/edit-customer/${party_id}`
                    : `/purchase/vendors/edit-vendor/${party_id}`
                }
              >
                <Button variant="link" className="text-blue-600 p-0 h-auto">
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit {party ? "Vendor" : "Customer"}
                </Button>
              </Link>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Contact Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              target="_blank"
              href={`tel:${partyData?.data?.mobile_number}`}
              className="flex-1 "
            >
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
            </Link>

            <Link
              target="_blank"
              href={`sms:${partyData?.data?.mobile_number}`}
              className="flex-1"
            >
              <Button size="sm" variant="outline" className="w-full">
                <MessageCircle className="w-4 h-4 mr-1" />
                Chat
              </Button>
            </Link>
            <Link
              target="_blank"
              href={`mailto:${partyData?.data?.email}`}
              className="flex-1"
            >
              <Button size="sm" variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
            </Link>
            <Link
              target="_blank"
              href={`https://wa.me/${partyData?.data?.mobile_number}`}
              className="flex gap-3 items-center"
            >
              <Button
                size="sm"
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 w-full"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
            </Link>
          </div>

          <Separator className="my-4" />

          {/* Balance & Actions */}
          <BalanceActions
            party={party}
            dueList={dueInvoiceList?.data}
            customer_id={party_id}
          />
        </CardContent>
      </Card>

      {/* Payment History */}
      <CustomerVendorPaymentHistory dueCollection={dueCollection} />
    </div>
  );
}

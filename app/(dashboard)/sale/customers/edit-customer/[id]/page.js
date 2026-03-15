'use client'
import { useGetCustomerDetailsQuery } from '@/app/store/api/saleCustomerApi';
import CustomerVendorForm from '@/components/CustomerVendorForm';
import { useParams } from 'next/navigation';
import React from 'react'

export default function EditCustomer() {
  const params = useParams();
  const id = params.id;
  const { data } = useGetCustomerDetailsQuery(
    { id },
  );

  return (
    <div>
      <CustomerVendorForm data={data} id={id}/>
    </div>
  )
}

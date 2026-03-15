'use client'
import { useGetVendorDetailsQuery } from '@/app/store/api/purchaseVendorApi';
import CustomerVendorForm from '@/components/CustomerVendorForm';
import { useParams } from 'next/navigation';
import React from 'react'

export default function EditVendor() {
    const params = useParams();
    const id = params.id;
    const { data } = useGetVendorDetailsQuery(
        { id },
    );
    return (
        <div>
            <CustomerVendorForm data={data} id={id} />
        </div>
    )
}

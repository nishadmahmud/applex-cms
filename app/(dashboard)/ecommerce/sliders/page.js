import { authOption } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth'
import React, { Suspense } from 'react'
import EditSliderUi from './EditSliderUi';

export default async function EditSliders() {
    const session = await getServerSession(authOption);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/public/sliders/${session?.user?.id}`,{next : {tags : ['sliders']}});
    const sliders = res.json();
  return (
    <Suspense fallback={'loading...'}>
      <EditSliderUi data={sliders}/>
    </Suspense>
  )
}

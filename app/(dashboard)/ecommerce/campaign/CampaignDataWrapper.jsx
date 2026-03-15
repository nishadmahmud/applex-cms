import React, { Suspense } from 'react'
import CampaignList from './CampaignList';
import serverFetchPromise from '@/lib/serverFetchPromise';

export default async function CampaignDataWrapper() {
  const data = serverFetchPromise(`${process.env.NEXT_PUBLIC_API}/campaigns`, {
    next: { tags: ["campaigns"],revalidate : 300},
  });
  return (
    <Suspense fallback={"loading..."}>
      <CampaignList dataPromise={data} />
    </Suspense>
  );
}

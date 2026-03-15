"use client";
import { fetcherWithToken } from "@/app/utils/constants";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";

const useProductList = (currentPage = 1, limit = 10) => {
  const { data: session, status } = useSession();
  const shouldFetch = status === "authenticated" && session?.accessToken;
  const key = shouldFetch
    ? [
        `${process.env.NEXT_PUBLIC_API}/product?page=${currentPage}&limit=${limit}`,
        session.accessToken,
      ]
    : null;
  const { data: products, isLoading } = useSWR(
    key,
    ([url, token]) => fetcherWithToken(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );

  // Revalidate all SWR caches so product list updates on every page/limit (e.g. after add/edit from another page)
  const mutateProductList = () => mutate();

  return { products, isLoading, key, mutateProductList };
};

export default useProductList;

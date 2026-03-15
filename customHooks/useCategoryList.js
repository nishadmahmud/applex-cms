"use client";
import { fetcherWithToken } from "@/app/utils/constants";
import { useSession } from "next-auth/react";
import useSWR from "swr";

const useCategoryList = () => {
  const { data: session, status } = useSession();
  const shouldFetch = status === "authenticated" && session?.accessToken;
  const key = shouldFetch
    ? [
        `${process.env.NEXT_PUBLIC_API}/get-all-category?page=1&limit=10000`,
        session?.accessToken,
      ]
    : null;
  const { data: categories, mutate } = useSWR(
    key,
    ([url, token]) => fetcherWithToken(url, token),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  const mutateCategoryList = () => mutate(key);

  return { categories, mutateCategoryList };
};

export default useCategoryList;

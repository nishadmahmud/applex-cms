import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { signOut } from "next-auth/react";

export const customBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("Content-Type", "application/json");
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await customBaseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    await signOut({ callbackUrl: "/signin" });
  }

  return result;
};

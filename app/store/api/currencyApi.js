import { apiSlice } from "../apiSlice";

const currencyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrency: builder.query({
      query: () => "/currency?page=1&limit=20",
      providesTags: ["Currency"],
    }),
  }),
});

export const { useGetCurrencyQuery } = currencyApi;

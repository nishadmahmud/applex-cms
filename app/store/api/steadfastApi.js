import { apiSlice } from "../apiSlice";

export const steadfastApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🚚 1️⃣ Create-order on Steadfast
    createSteadfastOrder: builder.mutation({
      query: (payload) => ({
        url: `courier/create-order`,
        method: "POST",
        body: payload,
      }),
    }),

    // 🚚 2️⃣ After successful creation, send to steadfast‑couriers endpoint
    saveSteadfastToCourierLog: builder.mutation({
      query: (payload) => ({
        url: `steadfast-couriers`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useCreateSteadfastOrderMutation,
  useSaveSteadfastToCourierLogMutation,
} = steadfastApi;

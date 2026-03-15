import { apiSlice } from "../apiSlice";

const unitsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUnits: builder.query({
      query: () => "/units?page=1&limit=20",
      providesTags: ["Unit"],
    }),
  }),
});

export const { useGetUnitsQuery } = unitsApi;

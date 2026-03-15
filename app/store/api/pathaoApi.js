import { apiSlice } from "../apiSlice";

export const pathaoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPathaoStores: builder.query({
      query: () => `pathao/stores`,
      providesTags: ["PathaoStores"],
    }),
    getPathaoCities: builder.query({
      query: () => `pathao/cities`,
      providesTags: ["PathaoCities"],
    }),
    getPathaoZones: builder.query({
      query: (cityId) => `pathao/zones/${cityId}`,
      providesTags: ["PathaoZones"],
    }),
    createPathaoOrder: builder.mutation({
      query: (payload) => ({
        url: `pathao/create-order`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetPathaoStoresQuery,
  useGetPathaoCitiesQuery,
  useGetPathaoZonesQuery,
  useCreatePathaoOrderMutation,
} = pathaoApi;

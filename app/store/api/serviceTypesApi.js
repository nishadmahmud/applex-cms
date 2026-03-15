import { apiSlice } from "../apiSlice";

export const serviceTypesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getServiceTypes: builder.query({
            query: () => `/service-types`,
            providesTags: ["ServiceType"],
        }),
        createServiceType: builder.mutation({
            query: (payload) => ({
                url: "/service-types",
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["ServiceType"],
        }),
        updateServiceType: builder.mutation({
            query: ({ id, ...payload }) => ({
                url: `/service-types/${id}`,
                method: "PUT",
                body: payload,
            }),
            invalidatesTags: ["ServiceType"],
        }),
        deleteServiceType: builder.mutation({
            query: (id) => ({
                url: `/service-types/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ServiceType"],
        }),
    }),
});

export const {
    useGetServiceTypesQuery,
    useCreateServiceTypeMutation,
    useUpdateServiceTypeMutation,
    useDeleteServiceTypeMutation,
} = serviceTypesApi;

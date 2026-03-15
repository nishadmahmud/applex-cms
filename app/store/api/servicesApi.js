import { apiSlice } from "../apiSlice";

export const servicesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Create a new service record
        saveService: builder.mutation({
            query: (payload) => ({
                url: "/save-service",
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["Service"],
        }),

        // Update an existing service record
        updateService: builder.mutation({
            query: (payload) => ({
                url: "/update-service",
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["Service"],
        }),

        // Search/list services with filters
        searchService: builder.query({
            query: ({ keyword = "", customerSearch = false, serviceSearch = false, page = 1, limit = 50 }) =>
                `/search-service?keyword=${encodeURIComponent(keyword)}&customerSearch=${customerSearch}&serviceSearch=${serviceSearch}&page=${page}&limit=${limit}`,
            providesTags: ["Service"],
        }),

        // Get a single service record by service_invoice_id
        getServiceDetails: builder.query({
            query: (serviceInvoiceId) => `/service-invoice-details/${serviceInvoiceId}`,
            providesTags: (result, error, id) => [{ type: "Service", id }],
        }),

        // Delete a service record
        deleteService: builder.mutation({
            query: (serviceInvoiceId) => ({
                url: "/delete-service",
                method: "DELETE",
                body: { service_invoice_id: serviceInvoiceId },
            }),
            invalidatesTags: ["Service"],
        }),
    }),
    overrideExisting: false,
});

export const {
    useSaveServiceMutation,
    useUpdateServiceMutation,
    useSearchServiceQuery,
    useGetServiceDetailsQuery,
    useDeleteServiceMutation,
} = servicesApi;

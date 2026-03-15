import { apiSlice } from "../apiSlice";

export const techniciansApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTechnicians: builder.query({
            query: () => `/technicians`,
            providesTags: ["Technician"],
        }),
        createTechnician: builder.mutation({
            query: (payload) => ({
                url: "/technicians",
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["Technician"],
        }),
        updateTechnician: builder.mutation({
            query: ({ id, ...payload }) => ({
                url: `/technicians/${id}`,
                method: "PUT",
                body: payload,
            }),
            invalidatesTags: ["Technician"],
        }),
        deleteTechnician: builder.mutation({
            query: (id) => ({
                url: `/technicians/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Technician"],
        }),
    }),
});

export const {
    useGetTechniciansQuery,
    useCreateTechnicianMutation,
    useUpdateTechnicianMutation,
    useDeleteTechnicianMutation,
} = techniciansApi;

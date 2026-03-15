import { apiSlice } from "../apiSlice";

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: (payload) => ({
        url: "/outlet-update",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Profile"],
    }),
    getProfile: builder.query({
      query: () => "/profile",
      providesTags: ["Profile"],
    }),
    getBloodGroup : builder.query({
      query : () => "get-blood-group",
      providesTags : ['BloodGroup']
    })
  }),
});

export const { useUpdateProfileMutation, useGetProfileQuery,useGetBloodGroupQuery } = profileApi;

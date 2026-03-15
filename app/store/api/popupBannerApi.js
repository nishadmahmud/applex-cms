import { apiSlice } from "../apiSlice";

export const popupBannerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPopupBanner: builder.query({
      query: () => "/popups",
      providesTags: ["PopupBanner"],
    }),

    savePopupBanner: builder.mutation({
      query: (payload) => ({
        url: "/popups",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["PopupBanner"],
    }),

    // ✅ DELETE popup banner
    deletePopupBanner: builder.mutation({
      query: (id) => ({
        url: `/popups/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PopupBanner"],
    }),
  }),
});

export const {
  useGetPopupBannerQuery,
  useSavePopupBannerMutation,
  useDeletePopupBannerMutation,
} = popupBannerApi;

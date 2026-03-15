import { apiSlice } from "../apiSlice";

export const sharedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    deleteEntity: builder.mutation({
      query: ({ endPoint, body }) => ({
        url: `/${endPoint}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => {
        console.log(result, error);
        const tag = arg.endPoint.includes("delete-brand")
          ? "Brand"
          : arg.endPoint.includes("delete-category")
          ? "Category"
          : arg.endPoint.includes("warranty-delete")
          ? "Warranty"
          : arg.endPoint.includes("delete-unit")
          ? "Unit"
          : "Subcategory";
        return [tag];
      },
    }),
  }),
});

export const { useDeleteEntityMutation } = sharedApi;

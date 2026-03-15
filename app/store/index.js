"use client";
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";
import { orderBucketApi } from "./api/orderBucketApi";
import authReducers from "./authSlice";
import imageReducer from "./imageSlice";
import variationReducer from "./pos/variationSlice";
import recentReducer from "./recentSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [orderBucketApi.reducerPath]: orderBucketApi.reducer,
    auth: authReducers,
    image: imageReducer,
    variations: variationReducer,
    recent: recentReducer,
  },

  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(orderBucketApi.middleware);
  },
});

"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";
import {
  useGetSellerReviewsQuery,
  useApproveReviewMutation,
} from "@/app/store/api/customerReviewApi";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Star, CheckCircle2, Clock, Loader2 } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import ReviewPagination from "./review-pagination";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PlayCircle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

export default function CustomerReviewPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewer, setViewer] = useState({
    open: false,
    url: "",
    isVideo: false,
  });

  const userId = session?.user?.id;

  // Load token when user authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user?.token) {
      dispatch(setToken(session.user.token));
    }
  }, [status, session, dispatch]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  const canAccessCustomerReviews =
    !isEmployee || canAccess(features, "Ecommerce", "Customer Reviews");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessCustomerReviews;

  const { data, isFetching, isError, refetch } = useGetSellerReviewsQuery(
    { userId, page, limit },
    { skip: !userId || status !== "authenticated" || !shouldFetch }
  );

  const [approveReview, { isLoading: approving }] = useApproveReviewMutation();

  const handleApprove = async (id) => {
    try {
      await approveReview({ id }).unwrap();
      toast.success("Review approved successfully!");
      refetch();
    } catch (err) {
      toast.error("Failed to approve review.");
    }
  };

  if (status === "loading")
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );

  if (isError)
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        Failed to load reviews.
      </div>
    );

  const reviews = data?.data || [];
  const pagination = data?.pagination;

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Customer Reviews">
      <div className="mx-auto max-w-[1400px] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Customer Reviews Management
          </h1>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            Refresh
          </Button>
        </div>

        {isFetching ? (
          <div className="py-20 text-center text-gray-500">
            Fetching reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            No reviews found.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <Card
                key={review.id}
                className="rounded-xl border hover:shadow-md transition-all flex flex-col"
              >
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <span>{review.customer?.name || "Unknown Customer"}</span>
                      <Badge
                        variant={review.approved ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {review.approved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      {new Array(5).fill(null).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </CardTitle>
                  <div className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleString()}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-3 flex-grow">
                  {/* Product Info */}
                  <div className="flex items-center gap-3 border-b pb-2">
                    {review.product?.image_paths && (
                      <img
                        src={review.product.image_paths[0]}
                        alt=""
                        className="w-14 h-14 rounded object-cover border"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {review.product?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        SKU: {review.product?.sku}
                      </div>
                    </div>
                  </div>

                  {/* Comment HTML */}
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(review.comment || ""),
                    }}
                  />

                  {/* Review Images */}
                  {/* Review Images / Videos Viewer */}
                  {review?.images?.length > 0 && (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {review.images.map((mediaUrl, idx) => {
                          const lower = mediaUrl.toLowerCase();
                          const isVideo =
                            lower.endsWith(".mp4") ||
                            lower.endsWith(".mov") ||
                            lower.endsWith(".webm") ||
                            lower.endsWith(".ogg");

                          return (
                            <button
                              key={idx}
                              onClick={() =>
                                setViewer({
                                  open: true,
                                  url: mediaUrl,
                                  isVideo,
                                })
                              }
                              className="relative group w-16 h-16 rounded border overflow-hidden focus:outline-none"
                            >
                              {isVideo ? (
                                <>
                                  <video
                                    src={mediaUrl}
                                    className="w-full h-full object-cover pointer-events-none"
                                  />
                                  <PlayCircle className="absolute inset-0 m-auto h-6 w-6 text-white opacity-90 drop-shadow group-hover:opacity-100" />
                                </>
                              ) : (
                                <img
                                  src={mediaUrl}
                                  alt="review-attachment"
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Popup viewer */}
                      {viewer.open && (
                        <Dialog
                          open={viewer.open}
                          onOpenChange={(v) =>
                            setViewer({ ...viewer, open: v })
                          }
                        >
                          <DialogContent className="max-w-4xl p-3 sm:p-4 bg-black/80">
                            {viewer.isVideo ? (
                              <video
                                src={viewer.url}
                                controls
                                autoPlay
                                className="w-full h-auto rounded-md"
                              />
                            ) : (
                              <img
                                src={viewer.url}
                                alt="full-preview"
                                className="w-full h-auto rounded-md"
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      )}
                    </>
                  )}

                  {/* Approve button */}
                  <div className="mt-auto flex justify-end">
                    {review.approved ? (
                      <Button
                        disabled
                        size="sm"
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Approved
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={approving}
                        onClick={() => handleApprove(review.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {approving ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Clock className="h-4 w-4 mr-1" />
                        )}
                        Approve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <ReviewPagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            perPage={pagination.per_page}
            total={pagination.total}
            from={pagination.from}
            to={pagination.to}
            onPageChange={setPage}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

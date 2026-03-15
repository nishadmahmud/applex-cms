"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, FileText, ArrowLeft } from "lucide-react";
import {
  useBlogs,
  useCreateBlog,
  useUpdateBlog,
  useDeleteBlog,
} from "@/apiHooks/hooks/useBlogsQuery";
import { BlogForm } from "./blogs-form";
import { BlogListItem } from "./blogs-list-item";

export default function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("list"); // list | create | edit
  const [selectedBlog, setSelectedBlog] = useState(null);

  const { data: blogsResponse, isLoading, error } = useBlogs();
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();

  const blogs = blogsResponse?.data || [];

  /* =======================
     SEARCH FILTER
  ======================= */
  const filteredBlogs = blogs.filter(
    (blog) =>
      blog?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog?.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* =======================
     HANDLERS
  ======================= */
  const handleCreateBlog = async (data) => {
    try {
      await createBlog.mutateAsync(data);
      setCurrentView("list");
    } catch (err) {
      console.error("Create blog error:", err);
    }
  };

  const handleUpdateBlog = async (data) => {
    if (!selectedBlog) return;

    try {
      await updateBlog.mutateAsync({
        id: selectedBlog.id,
        data,
      });
      setSelectedBlog(null);
      setCurrentView("list");
    } catch (err) {
      console.error("Update blog error:", err);
    }
  };

  const handleDeleteBlog = async (id) => {
    try {
      await deleteBlog.mutateAsync(id);
    } catch (err) {
      console.error("Delete blog error:", err);
    }
  };

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    setCurrentView("edit");
  };

  const handleCreateClick = () => {
    setSelectedBlog(null);
    setCurrentView("create");
  };

  const handleBackToList = () => {
    setSelectedBlog(null);
    setCurrentView("list");
  };

  /* =======================
     ERROR STATE
  ======================= */
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6 text-center text-destructive">
            Failed to load blogs. Please try again later.
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =======================
     CREATE / EDIT VIEW
  ======================= */
  if (currentView === "create" || currentView === "edit") {
    const isEdit = currentView === "edit";

    return (
      <div className="container mx-auto py-1 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isEdit ? "Edit Blog" : "Create New Blog"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEdit
                ? `Update blog: "${selectedBlog?.title}"`
                : "Publish a new blog article"}
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={handleBackToList}
            className="gap-2 bg-gray-100 hover:bg-gray-200 font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blogs
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blog Details</CardTitle>
          </CardHeader>
          <CardContent>
            <BlogForm
              blog={isEdit ? selectedBlog : undefined}
              onSubmit={isEdit ? handleUpdateBlog : handleCreateBlog}
              isLoading={
                isEdit ? updateBlog.isPending : createBlog.isPending
              }
              submitLabel={isEdit ? "Update Blog" : "Create Blog"}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =======================
     LIST VIEW
  ======================= */
  return (
    <div className="container mx-auto py-1 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Blog Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage articles and blog content
          </p>
        </div>

        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Blog
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Blogs ({filteredBlogs.length})</CardTitle>

            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="mt-2 text-muted-foreground">Loading blogs...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No blogs found matching your search."
                  : "No blogs published yet."}
              </p>
              {!searchTerm && (
                <Button
                  onClick={handleCreateClick}
                  variant="outline"
                  className="mt-4"
                >
                  Create Your First Blog
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              <div className="grid grid-cols-[40px_1fr_1fr_1fr_120px] gap-2 py-3 border-b-2 text-sm font-semibold text-muted-foreground">
                <div>Sl.</div>
                <div>Title</div>
                <div>Slug</div>
                <div>Published</div>
                <div className="text-right">Actions</div>
              </div>

              {filteredBlogs.map((blog, index) => (
                <BlogListItem
                  key={blog.id}
                  index={index + 1}
                  blog={blog}
                  onEdit={handleEditBlog}
                  onDelete={handleDeleteBlog}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

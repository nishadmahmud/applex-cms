"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, KeyRound, EyeOff, Eye } from "lucide-react";
import api from "@/lib/api";

export default function ResetPasswordPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill both password fields");
      return false;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setDialogOpen(true); // show confirmation dialog first
  };

  const handleConfirmSubmit = async () => {
    setDialogOpen(false);
    setLoading(true);
    toast.info("Updating password…");

    try {
      const payload = {
        email: userEmail,
        password: newPassword,
      };
      const res = await api.post("/reset-password", payload);

      if (res?.data?.success) {
        toast.success(
          res.data.message ||
            "Congratulations! Your password has been updated successfully!",
        );
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res?.data?.message || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while resetting your password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main page layout */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-white to-pink-100 p-6">
        <Card className="w-full max-w-md border-violet-100 shadow-lg backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 text-violet-700">
              <KeyRound className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Reset Password
            </CardTitle>
            <p className="text-sm text-gray-500">
              Update your password securely for{" "}
              <span className="font-medium text-gray-800">{userEmail}</span>
            </p>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {/* NEW PASSWORD FIELD */}
              <div className="space-y-1">
                <Label
                  htmlFor="newPassword"
                  className="text-gray-700 font-medium"
                >
                  New Password
                </Label>
                {/* Create a relative wrapper ONLY for Input and Button */}
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter new password (min 8 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="text-center tracking-widest pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-500 hover:text-violet-600"
                    tabIndex={-1}
                  >
                    {showNew ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD FIELD */}
              <div className="space-y-1">
                <Label
                  htmlFor="confirmPassword"
                  className="text-gray-700 font-medium"
                >
                  Confirm Password
                </Label>
                {/* Create a relative wrapper ONLY for Input and Button */}
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Retype new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="text-center tracking-widest pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-500 hover:text-violet-600"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center">
              <Button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 text-white w-full font-medium transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Updating…
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="sm:max-w-sm rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              Confirm Password Change
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to update your password? You’ll need to use
              the new one next time you sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {loading ? "Updating…" : "Yes, Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

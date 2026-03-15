"use client";
import { React, useState } from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Enter your credentials");
    }

    setLoading(true); // ✅ Start loading
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.ok) {
        router.push(
          callbackUrl ? `/verify-pin?callbackUrl=${callbackUrl}` : "/verify-pin"
        );
      } else {
        toast.error("Invalid email or password");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Blurred Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-blue-100 to-cyan-200">
        {/* Abstract shapes for background */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-blue-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-cyan-200/25 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-1/3 w-56 h-56 bg-sky-100/40 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="p-6">
          {/* <div className="flex items-center gap-2">
            <Image
              src="/gadcheap-cms-log.png" // Path to your image in the public folder
              alt="Gadcheap CMS Logo" // Descriptive alt text
              width={150} // Desired width
              height={50} // Desired height
              priority // Optional: loads image faster for important images
            />
          </div> */}
        </div>

        {/* Login Card */}
        <div className="flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/20 shadow-xl">
            <div className="p-8 space-y-6">
              {/* Login Icon */}
              {/* <div className="flex justify-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <LogIn className="w-5 h-5 text-gray-600" />
                </div>
              </div> */}

              {/* Title and Description */}
              <div className="text-center space-y-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  Sign in with email
                </h1>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Please Login with your authorized credentials
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 focus-visible:border-blue-300 bg-gray-50/80 border-gray-200/50 focus:bg-white/90 transition-colors"
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 focus-visible:border-blue-300 pr-10 bg-gray-50/80 border-gray-200/50 focus:bg-white/90 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                    Forgot password?
                  </button>
                </div>

                {/* Get Started Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="text-center relative">
                <div className="border border-dashed absolute top-[0.775rem] left-1 w-32"></div>
                <span className="text-sm text-gray-500">Or sign in with</span>
                <div className="border border-dashed absolute top-[0.775rem] right-1 w-32"></div>
              </div>

              {/* Social Login Buttons */}
              <div className="flex justify-center gap-4">
                {/* Google */}
                <button className="w-full h-12 bg-white/80 hover:bg-white border border-gray-200/50 rounded-lg flex items-center gap-5 justify-center transition-colors group">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue With Google
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

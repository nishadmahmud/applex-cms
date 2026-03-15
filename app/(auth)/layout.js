import React from "react";
import "../globals.css";
import AuthProvider from "./authProvider/AuthProvider";
import { Toaster } from "sonner";
export default function LoginLayout({ children }) {
  return (
    <AuthProvider>
      <div className="">
        <Toaster richColors />
        {children}
      </div>
    </AuthProvider>
  );
}

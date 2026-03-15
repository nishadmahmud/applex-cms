import { React, Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}

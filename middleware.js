// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";

// export const middleware = async (req) => {

//     const response = await getToken({ req});
//     const token = response?.accessToken;
//     const isPinVerified = response?.pinVerified;

//     const isPublicRoute = req.nextUrl.pathname === '/signin' || req.nextUrl.pathname === '/verify-pin';

//     if (!token && !isPublicRoute) {
//         const url = req.nextUrl.clone();
//         const callbackUrl = encodeURIComponent(url.pathname);
//         url.pathname = '/signin';
//         url.search = `callbackUrl=${callbackUrl}`;
//         return NextResponse.redirect(url);
//     }

//     if (token && !isPinVerified && req.nextUrl.pathname !== '/verify-pin') {
//         const url = req.nextUrl.clone()
//         const callbackUrl = encodeURIComponent(url.pathname);
//         url.pathname =  '/verify-pin';
//         url.search = `callbackUrl=${callbackUrl}`;
//         return NextResponse.redirect(url);
//     }

//     if (token && isPinVerified && req.nextUrl.pathname === '/verify-pin') {
//         // If a callbackUrl exists, use it. Otherwise, default to the dashboard.
//         const url = req.nextUrl.clone();
//         const redirectTo = req.nextUrl.searchParams.get('callbackUrl') || '/dashboard';
//         url.pathname = redirectTo;
//         url.search = ''; // Clear search params
//         return NextResponse.redirect(url);
//     }

//     return NextResponse.next();
// }

// export const config = {
//     // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
//     matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
// };

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export const middleware = async (req) => {
  const response = await getToken({ req });
  const token = response?.accessToken;
  const isPinVerified = response?.pinVerified;
  const isEmployee = response?.isEmployee ?? response?.user?.isEmployee;

  console.log("middleware →", { isEmployee, isPinVerified });

  const path = req.nextUrl.pathname;
  const isPublic = path === "/signin" || path === "/verify-pin";

  // 1️⃣ No token → sign in
  if (!token && !isPublic) {
    const url = req.nextUrl.clone();
    const callbackUrl = encodeURIComponent(url.pathname);
    url.pathname = "/signin";
    url.search = `callbackUrl=${callbackUrl}`;
    return NextResponse.redirect(url);
  }

  // 2️⃣ Employee safety: if employee goes to verify‑pin, skip it
  if (token && isEmployee && path === "/verify-pin") {
    const url = req.nextUrl.clone();
    const redirectTo =
      req.nextUrl.searchParams.get("callbackUrl") || "/dashboard";
    url.pathname = redirectTo;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 3️⃣ Token but pin not verified (and not employee) → verify‑pin
  if (token && !isPinVerified && !isEmployee && path !== "/verify-pin") {
    const url = req.nextUrl.clone();
    const callbackUrl = encodeURIComponent(url.pathname);
    url.pathname = "/verify-pin";
    url.search = `callbackUrl=${callbackUrl}`;
    return NextResponse.redirect(url);
  }

  // 4️⃣ Token + pin verified → prevent access to verify‑pin
  if (token && isPinVerified && path === "/verify-pin") {
    const url = req.nextUrl.clone();
    const redirectTo =
      req.nextUrl.searchParams.get("callbackUrl") || "/dashboard";
    url.pathname = redirectTo;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // ✅ Proceed normally otherwise
  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

// "use client";
// import axios from "axios";
// import React, { useState } from "react";
// import { useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";

// const VerifyPinForm = () => {
//   const inputFields = Array(6).fill(0);
//   const pinRef = useRef([]);
//   const [pin, setPin] = useState(["", "", "", "", "", ""]);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();
//   const { data: session, update: updateSession } = useSession();
//   const params = useSearchParams();
//   const callbackUrl = params.get("callbackUrl");

//   const handleChange = (e, i) => {
//     const value = e.target.value;
//     if (!/^\d?$/.test(value)) return;
//     const newPin = [...pin];
//     newPin[i] = value;
//     setPin(newPin);
//     if (value && i < inputFields.length - 1) {
//       pinRef.current[i + 1].focus();
//     }
//   };

//   const handleKeyDown = (e, i) => {
//     const key = e.key;
//     if (key === "Backspace" && i > 0 && !e.target.value) {
//       pinRef.current[i - 1].focus();
//     }
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setLoading(true); // start loading
//   //   try {
//   //     const stringPin = pin.join("");
//   //     const res = await axios.post(
//   //       `${process.env.NEXT_PUBLIC_API}/verify-pin`,
//   //       { pin: stringPin },
//   //       {
//   //         headers: {
//   //           Authorization: `Bearer ${session.accessToken}`,
//   //           "Content-Type": "application/json",
//   //         },
//   //       }
//   //     );
//   //     const data = res.data;

//   //     // Treat any status !== 200 as failure
//   //     if (data.status === 200) {
//   //       await updateSession(
//   //         {
//   //           pinVerified: true,
//   //         },
//   //         { redirect: false }
//   //       );
//   //       router.push(callbackUrl || "/dashboard");
//   //       toast.success(data?.message || "PIN verified successfully");
//   //     } else {
//   //       // Show error even if success is true but status is not 200
//   //       toast.error(data?.message || "PIN verification failed");
//   //     }
//   //   } catch (error) {
//   //     toast.error(
//   //       error?.response?.data?.message ||
//   //         error?.message ||
//   //         "An error occurred while verifying PIN"
//   //     );
//   //     console.log(error);
//   //   } finally {
//   //     setLoading(false); // stop loading
//   //   }
//   // };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true); // show loader immediately

//     try {
//       const stringPin = pin.join("");

//       const res = await axios.post(
//         `${process.env.NEXT_PUBLIC_API}/verify-pin`,
//         { pin: stringPin },
//         {
//           headers: {
//             Authorization: `Bearer ${session.accessToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const data = res.data;

//       if (data.status === 200) {
//         toast.success(data?.message || "PIN verified successfully");

//         // Update session + show loader until route changes
//         await updateSession({ pinVerified: true });

//         // Small delay (optional) to ensure visuals render smoothly
//         setTimeout(() => {
//           router.push(callbackUrl || "/dashboard");
//         }, 300);
//       } else {
//         toast.error(data?.message || "PIN verification failed");
//         setLoading(false);
//       }
//     } catch (error) {
//       toast.error(
//         error?.response?.data?.message ||
//           error?.message ||
//           "An error occurred while verifying PIN"
//       );
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative h-screen bg-white">
//       {/* Loader Overlay 👇 */}
//       {loading && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
//           <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
//         </div>
//       )}
//       {/* Blurred Background - Behind content */}
//       <div className="absolute inset-0 z-0 bg-gradient-to-br from-sky-200 via-blue-100 to-cyan-200">
//         <div className="absolute top-20 left-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
//         <div className="absolute top-40 right-20 w-48 h-48 bg-blue-200/30 rounded-full blur-2xl"></div>
//         <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-cyan-200/25 rounded-full blur-xl"></div>
//         <div className="absolute bottom-20 right-1/3 w-56 h-56 bg-sky-100/40 rounded-full blur-2xl"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-100/20 rounded-full blur-3xl"></div>
//       </div>

//       {/* Foreground content */}
//       <main className="relative z-10 flex items-center justify-center h-full">
//         <form
//           onSubmit={handleSubmit}
//           className="w-full max-w-md mx-auto p-8 bg-white shadow-lg rounded-xl space-y-8"
//         >
//           {/* Logo and heading */}
//           <div className="flex flex-col items-center">
//             <div className="mb-2">
//               <svg
//                 width="64"
//                 height="64"
//                 viewBox="0 0 64 64"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <circle
//                   cx="32"
//                   cy="32"
//                   r="28"
//                   stroke="url(#gradient)"
//                   strokeWidth="8"
//                 />
//                 <path
//                   d="M42 22L32 42L22 22"
//                   stroke="url(#gradient)"
//                   strokeWidth="6"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//                 <defs>
//                   <linearGradient
//                     id="gradient"
//                     x1="16"
//                     y1="16"
//                     x2="48"
//                     y2="48"
//                     gradientUnits="userSpaceOnUse"
//                   >
//                     <stop stopColor="#4FACFE" />
//                     <stop offset="1" stopColor="#00F2FE" />
//                   </linearGradient>
//                 </defs>
//               </svg>
//             </div>
//             <h1 className="text-xl font-bold text-[#002240] text-center">
//               Let&apos;s Verify Your PIN For More Security
//             </h1>
//             <p className="mt-2 text-sm text-center text-gray-500">
//               Verify pin for any kind of unnecessary activity from other people
//             </p>
//           </div>

//           {/* PIN Input */}
//           <div className="flex justify-center space-x-4 my-10">
//             {[...Array(6)].map((_, i) => (
//               <input
//                 key={i}
//                 onKeyDown={(e) => handleKeyDown(e, i)}
//                 onChange={(e) => handleChange(e, i)}
//                 value={pin[i]}
//                 ref={(el) => (pinRef.current[i] = el)}
//                 className="w-12 h-12 text-black font-semibold text-center rounded-full bg-gray-200 outline-none focus-visible:border-2 focus-visible:border-[#05fee7]/50"
//               />
//             ))}
//           </div>

//           {/* Button */}
//           <Button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-medium flex items-center justify-center"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin mr-2" />
//                 Verifying...
//               </>
//             ) : (
//               "Next"
//             )}
//           </Button>

//           {/* Forgot PIN */}
//           <div className="text-center mt-6">
//             <a href="#" className="text-blue-600 hover:underline">
//               Forgot Pin
//             </a>
//           </div>
//         </form>
//       </main>
//     </div>
//   );
// };

// export default VerifyPinForm;

"use client";
import axios from "axios";
import React, { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";

const VerifyPinForm = () => {
  const inputFields = Array(6).fill(0);
  const pinRef = useRef([]);
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");

  const handleChange = (e, i) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;
    const newPin = [...pin];
    newPin[i] = value;
    setPin(newPin);
    if (value && i < inputFields.length - 1) {
      pinRef.current[i + 1].focus();
    }
  };

  const handleKeyDown = (e, i) => {
    const key = e.key;
    if (key === "Backspace" && i > 0 && !e.target.value) {
      pinRef.current[i - 1].focus();
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true); // start loading
  //   try {
  //     const stringPin = pin.join("");
  //     const res = await axios.post(
  //       `${process.env.NEXT_PUBLIC_API}/verify-pin`,
  //       { pin: stringPin },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${session.accessToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     const data = res.data;

  //     // Treat any status !== 200 as failure
  //     if (data.status === 200) {
  //       await updateSession(
  //         {
  //           pinVerified: true,
  //         },
  //         { redirect: false }
  //       );
  //       router.push(callbackUrl || "/dashboard");
  //       toast.success(data?.message || "PIN verified successfully");
  //     } else {
  //       // Show error even if success is true but status is not 200
  //       toast.error(data?.message || "PIN verification failed");
  //     }
  //   } catch (error) {
  //     toast.error(
  //       error?.response?.data?.message ||
  //         error?.message ||
  //         "An error occurred while verifying PIN"
  //     );
  //     console.log(error);
  //   } finally {
  //     setLoading(false); // stop loading
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // show loader immediately

    try {
      const stringPin = pin.join("");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/verify-pin`,
        { pin: stringPin },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;

      if (data.status === 200) {
        toast.success(data?.message || "PIN verified successfully");

        // Update session + show loader until route changes
        await updateSession({ pinVerified: true });

        // Small delay (optional) to ensure visuals render smoothly
        setTimeout(() => {
          router.push(callbackUrl || "/dashboard");
        }, 300);
      } else {
        toast.error(data?.message || "PIN verification failed");
        setLoading(false);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while verifying PIN"
      );
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white">
      {/* Loader Overlay 👇 */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
        </div>
      )}

      {/* -- Header / Branding -- */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white font-semibold text-lg">
          C
        </div>
        <h1 className="text-lg font-semibold mt-3 text-white">Applex CMS</h1>
        <p className="text-sm text-gray-300">
          A Complete POS and Inventory Management Solution
        </p>
      </div>

      {/* Foreground content */}
      <main className="relative z-10 w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="mx-auto p-8 bg-white text-gray-800 shadow-2xl rounded-2xl space-y-8 "
        >
          {/* Logo and heading */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Enter PIN</h1>
            <p className="mt-1 text-sm text-gray-600 text-center">
              Welcome back,&nbsp;
              <span className="font-semibold text-violet-600">
                {session?.user?.owner_name}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Enter your 6‑digit PIN to continue
            </p>
          </div>

          {/* PIN Input */}
          <div className="flex justify-center space-x-3 my-6">
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onChange={(e) => handleChange(e, i)}
                value={pin[i]}
                ref={(el) => (pinRef.current[i] = el)}
                className="w-12 h-12 text-black font-semibold text-center border rounded-md border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-300 outline-none transition-all"
              />
            ))}
          </div>

          {/* Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-md font-medium flex items-center justify-center transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              "Verify PIN"
            )}
          </Button>

          {/* Forgot / Redirect */}
          <div className="text-center mt-4">
            <a
              href="/signin"
              className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
            >
              ← Back to login
            </a>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-xs text-gray-400">
        © {new Date().getFullYear()} Applex. All rights reserved.
      </footer>
    </div>
  );
};

export default VerifyPinForm;

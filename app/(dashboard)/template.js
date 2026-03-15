"use client";

export default function Template({ children }) {
  return (
    <div className="animate-in-page h-full w-full">
      {children}
    </div>
  );
}

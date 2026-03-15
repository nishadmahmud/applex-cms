import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "1000"],
});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: "Applex CMS",
  description: "A business management system",
  icons: {
    icon: "/logo.jpg", // or "/favicon.png"
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${jakartaSans.className} ${nunito.className}  antialiased bg-blue-50`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Google_Sans } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const googleSans = Google_Sans({
  subsets: ["latin"],
  display: "swap",
  fallback: ["false"],
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "PROIN",
  description: process.env.NEXT_PUBLIC_APP_TAGLINE || "Asset Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${googleSans.className} antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

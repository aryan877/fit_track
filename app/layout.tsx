import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FitTrack - Track Your Fitness Journey",
  description: "A fitness tracking app to help you reach your goals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Navbar />
          <main className="flex justify-center">
            <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 mt-8">
              {children}
            </div>
          </main>
          {/* <footer className="bg-gray-100 text-gray-600 py-4 px-8 text-center">
            &copy; {new Date().getFullYear()} FitTrack. All rights reserved.
          </footer> */}
        </body>
      </html>
    </ClerkProvider>
  );
}

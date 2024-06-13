import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <footer className="bg-gray-100 text-gray-600 py-4 px-8 text-center">
        &copy; {new Date().getFullYear()} FitTrack. All rights reserved.
      </footer>
    </>
  );
}

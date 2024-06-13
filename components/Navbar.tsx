"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <header className="bg-primary text-white py-4 px-8 flex items-center justify-between">
      <Link href="/" onClick={handleLogoClick}>
        <div className="text-2xl font-bold tracking-tight cursor-pointer">
          FitTrack
        </div>
      </Link>
    </header>
  );
}

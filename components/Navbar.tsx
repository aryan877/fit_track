"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { LogOutIcon } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { signOut } = useClerk();

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/signin");
  };

  return (
    <header className="py-4 px-8 flex items-center justify-between border-b border-gray-200">
      <Link href="/" onClick={handleLogoClick}>
        <div className="text-2xl font-bold tracking-tight cursor-pointer">
          FitTrack
        </div>
      </Link>
      <LogOutIcon onClick={handleSignOut} className="cursor-pointer" />
    </header>
  );
}

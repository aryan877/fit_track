"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

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
    <header className="bg-primary text-white py-4 px-8 flex items-center justify-between">
      <Link href="/" onClick={handleLogoClick}>
        <div className="text-2xl font-bold tracking-tight cursor-pointer">
          FitTrack
        </div>
      </Link>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </header>
  );
}

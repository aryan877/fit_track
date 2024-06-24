import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

function Back() {
  const router = useRouter();

  return (
    <header className="px-6 py-4">
      <nav className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </nav>
    </header>
  );
}

export default Back;

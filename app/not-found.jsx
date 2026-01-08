"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 text-center">
      <h1 className="text-8xl font-bold gradient-title mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been
        moved.
      </p>
      <div className="flex gap-4">
        <Link href="/">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            Return Home
          </Button>
        </Link>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
}

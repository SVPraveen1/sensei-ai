"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function InterviewError({ error, reset }) {
  useEffect(() => {
    console.error("Interview error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Interview Prep Error</CardTitle>
          <CardDescription>
            We couldn't load your interview preparation data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
        </CardContent>
        <CardFooter className="flex gap-2 justify-center">
          <Button onClick={() => reset()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button variant="secondary">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

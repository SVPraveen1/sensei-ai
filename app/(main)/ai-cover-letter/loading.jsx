import { Loader2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";

export default function CoverLetterLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <div className="h-14 w-72 bg-muted animate-pulse rounded" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      {/* Cover letter cards skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-6 w-64 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                </div>
                <div className="flex space-x-2">
                  <div className="h-9 w-9 bg-muted animate-pulse rounded" />
                  <div className="h-9 w-9 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Loading indicator */}
      <div className="flex justify-center mt-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

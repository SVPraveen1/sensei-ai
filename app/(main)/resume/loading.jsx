import { Loader2 } from "lucide-react";

export default function ResumeLoading() {
  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="h-14 w-72 bg-muted animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-10 w-20 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-10 w-20 bg-muted animate-pulse rounded" />
        <div className="h-10 w-24 bg-muted animate-pulse rounded" />
      </div>

      {/* Editor skeleton */}
      <div className="border rounded-lg">
        <div className="h-[800px] bg-muted animate-pulse rounded flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              Loading resume builder...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

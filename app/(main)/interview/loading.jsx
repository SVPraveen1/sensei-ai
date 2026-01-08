import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function InterviewLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="h-16 w-80 bg-muted animate-pulse rounded" />
      </div>

      <div className="space-y-6">
        {/* Stats Cards skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart skeleton */}
        <Card>
          <CardHeader>
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-40 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-muted animate-pulse rounded flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Quiz List skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 w-36 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 w-20 bg-muted animate-pulse rounded mb-2" />
                    <div className="flex justify-between w-full">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

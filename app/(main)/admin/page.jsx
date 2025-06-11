"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const triggerUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/trigger-insights", {
        method: "POST",
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Industry insights update triggered successfully!");
        setLastUpdate(new Date().toLocaleString());
      } else {
        toast.error("Failed to trigger update: " + result.error);
      }
    } catch (error) {
      toast.error("Error triggering update: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage industry insights and automated updates
        </p>
      </div>

      <div className="grid gap-6">
        {/* Manual Update Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Manual Update
            </CardTitle>
            <CardDescription>
              Trigger an immediate update of all industry insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Industry Insights</p>
                <p className="text-sm text-muted-foreground">
                  Updates salary ranges, growth rates, and market trends for all industries
                </p>
              </div>
              <Button 
                onClick={triggerUpdate} 
                disabled={loading}
                className="ml-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Now
                  </>
                )}
              </Button>
            </div>
            
            {lastUpdate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Last manual update: {lastUpdate}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Automatic Updates Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Automatic Updates
            </CardTitle>
            <CardDescription>
              Scheduled updates happen automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Schedule</p>
                  <p className="text-sm text-muted-foreground">
                    Every Sunday at 12:00 AM UTC
                  </p>
                </div>
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Next Update</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(Date.now() + (7 - new Date().getDay()) * 24 * 60 * 60 * 1000).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline">
                  Scheduled
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Data Collection</p>
                  <p className="text-muted-foreground">AI analyzes current market trends and salary data</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Insight Generation</p>
                  <p className="text-muted-foreground">Generate growth rates, demand levels, and skill recommendations</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Database Update</p>
                  <p className="text-muted-foreground">Updates are automatically saved and displayed on dashboard</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

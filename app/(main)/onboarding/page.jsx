"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/app/lib/schema";
import { industries } from "@/data/industries";
import { updateUser } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      industry: "",
      subIndustry: "",
      bio: "",
      experience: "",
      skills: "",
    },
  });

  const selectedIndustryData = industries.find(ind => ind.id === selectedIndustry);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Combine industry and subIndustry for database storage
      const industryValue = `${data.industry}-${data.subIndustry.toLowerCase().replace(/\s+/g, '-')}`;
      
      const result = await updateUser({
        industry: industryValue,
        experience: data.experience,
        bio: data.bio,
        skills: data.skills,
      });

      if (result.success) {
        toast.success("Profile setup completed successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">Welcome to SENS AI!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Let's set up your profile to provide personalized career guidance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Industry Selection */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  onValueChange={(value) => {
                    setSelectedIndustry(value);
                    setValue("industry", value);
                    setValue("subIndustry", ""); // Reset sub-industry when industry changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.id} value={industry.id}>
                        {industry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-sm text-red-500">{errors.industry.message}</p>
                )}
              </div>

              {/* Sub-Industry Selection */}
              {selectedIndustryData && (
                <div className="space-y-2">
                  <Label htmlFor="subIndustry">Specialization *</Label>
                  <Select
                    onValueChange={(value) => setValue("subIndustry", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedIndustryData.subIndustries.map((subIndustry) => (
                        <SelectItem key={subIndustry} value={subIndustry}>
                          {subIndustry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subIndustry && (
                    <p className="text-sm text-red-500">{errors.subIndustry.message}</p>
                  )}
                </div>
              )}

              {/* Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience *</Label>
                <Input
                  {...register("experience")}
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g., 3"
                />
                {errors.experience && (
                  <p className="text-sm text-red-500">{errors.experience.message}</p>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Textarea
                  {...register("skills")}
                  placeholder="e.g., JavaScript, React, Node.js, Project Management"
                  rows={3}
                />                <p className="text-sm text-muted-foreground">
                  List your key skills separated by commas
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea
                  {...register("bio")}
                  placeholder="Tell us a bit about yourself, your career goals, or background..."
                  rows={4}
                  maxLength={500}
                />                <p className="text-sm text-muted-foreground">
                  Maximum 500 characters
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up your profile...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
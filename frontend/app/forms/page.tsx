"use client";

import { useState } from "react";
import { z } from "zod";
import { CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { careersFormSchema, type CareersFormData } from "@/types/forms";

const formSchema = careersFormSchema;
type FormData = CareersFormData;

export default function CareersPage() {
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = formSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof FormData, string>> = {};
      for (const issue of result.error.issues) {
        newErrors[issue.path[0] as keyof FormData] = issue.message;
      }
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const payload = new URLSearchParams();
    for (const key in result.data) {
      const typedKey = key as keyof FormData;
      const value = result.data[typedKey];
      if (typeof value === "string") {
        payload.append(key, value);
      }
    }

    const GAS_URL =
      "https://script.google.com/macros/s/AKfycbwFGTvG3WbHXNG-zT41t4-edNX9Vvlf3rOOfVbrc9-m9AJU6wdLzYg9BheFXzfhmKUKXQ/exec";

    try {
      const res = await fetch(GAS_URL, {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      console.log(json);

      if (json?.ok) {
        setFormData({});
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setErrors({ resume: "Submission failed. Please try again." });
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
      setErrors({ resume: "Submission failed. Please try again." });
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | File) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section id="apply-today" className="px-4 py-20">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <h2 className="mb-6 text-4xl font-bold">Apply Today</h2>
            <p className="text-pretty text-lg text-gray-600">
              Ready to join our mission? Submit your application and we&apos;ll
              be in touch soon.
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--blackish)]/50">
                  <div className="mx-4 max-w-md rounded-lg bg-white p-8 shadow-xl">
                    <div className="mb-4 flex items-center gap-3">
                      <CheckCircle className="size-8 text-green-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        Success Submit
                      </h3>
                    </div>
                    <p className="mb-6 text-gray-600">
                      Your application has been submitted successfully!
                    </p>
                    <Button
                      onClick={() => setShowSuccess(false)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName || ""}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName || ""}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position of Interest</Label>
                  <Select
                    value={formData.selectedPosition || ""}
                    onValueChange={(value) =>
                      handleInputChange("selectedPosition", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Senior Backend Engineer">
                        Senior Backend Engineer
                      </SelectItem>
                      <SelectItem value="Senior Frontend Engineer">
                        Senior Frontend Engineer
                      </SelectItem>
                      <SelectItem value="Junior Backend Engineer">
                        Junior Backend Engineer
                      </SelectItem>
                      <SelectItem value="Junior Frontend Engineer">
                        Junior Frontend Engineer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.selectedPosition && (
                    <p className="text-sm text-red-600">
                      {errors.selectedPosition}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="majorGraduation">Major & Graduation</Label>
                  <Input
                    id="majorGraduation"
                    value={formData.majorGraduation || ""}
                    onChange={(e) =>
                      handleInputChange("majorGraduation", e.target.value)
                    }
                    placeholder="e.g., Computer Science, 2022"
                  />
                  {errors.majorGraduation && (
                    <p className="text-sm text-red-600">
                      {errors.majorGraduation}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="growthMetrics">
                    Growth Metrics of Previous Job
                  </Label>
                  <Input
                    id="growthMetrics"
                    value={formData.growthMetrics || ""}
                    onChange={(e) =>
                      handleInputChange("growthMetrics", e.target.value)
                    }
                    placeholder="e.g., Increased user engagement by 40%"
                  />
                  {errors.growthMetrics && (
                    <p className="text-sm text-red-600">
                      {errors.growthMetrics}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousRole">
                    Role at Previous or Current Company
                  </Label>
                  <Input
                    id="previousRole"
                    value={formData.previousRole || ""}
                    onChange={(e) =>
                      handleInputChange("previousRole", e.target.value)
                    }
                    placeholder="e.g., Senior Software Engineer at Google"
                  />
                  {errors.previousRole && (
                    <p className="text-sm text-red-600">
                      {errors.previousRole}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Resume (PDF only)</Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      handleInputChange(
                        "resume",
                        e.target.files?.[0] || new File([], "")
                      )
                    }
                  />
                  {errors.resume && (
                    <p className="text-sm text-red-600">{errors.resume}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-14 w-full text-lg font-semibold"
                >
                  Submit Application
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

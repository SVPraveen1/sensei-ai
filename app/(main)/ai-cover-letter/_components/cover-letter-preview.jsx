"use client";

import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Eye, Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const CoverLetterPreview = ({ content }) => {
  const [mode, setMode] = useState("preview");
  const [copied, setCopied] = useState(false);

  if (!content) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No cover letter content available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded!");
  };

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant={mode === "preview" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("preview")}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button
          variant={mode === "edit" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("edit")}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Editor/Preview */}
      <div data-color-mode="dark" className="border rounded-lg">
        <MDEditor
          value={content}
          preview={mode}
          height={600}
          hideToolbar={mode === "preview"}
        />
      </div>
    </div>
  );
};

export default CoverLetterPreview;

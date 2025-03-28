'use client'
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { JsonOutputProps } from "./types";

export const JsonOutput: React.FC<JsonOutputProps> = ({ jsonOutput, onCopy }) => {
  return (
    <Card className="mt-4 h-full w-full">
  <CardContent className="p-4 h-full flex flex-col">
    {/* Header Section (Non-Scrolling) */}
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium">JSON Output</span>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={async () => {
          try {
            await onCopy();
            toast.success("JSON copied to clipboard");
          } catch {
            toast.error("Failed to copy JSON");
          }
        }}
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy
      </Button>
    </div>

    {/* Scrollable JSON Output */}
    <div className="flex-1 min-h-0 overflow-auto bg-white p-2 rounded-md w-full">
      <pre className="whitespace-pre-wrap break-all font-mono text-sm w-full">
        {JSON.stringify(JSON.parse(jsonOutput), null, 2)}
      </pre>
    </div>
  </CardContent>
</Card>
  );
}; 
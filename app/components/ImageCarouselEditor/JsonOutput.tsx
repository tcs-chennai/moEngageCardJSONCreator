'use client'
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { JsonOutputProps } from "./types";

export const JsonOutput: React.FC<JsonOutputProps> = ({ jsonOutput, onCopy }) => {
  return (
    <Card className="mt-4">
      <CardContent className="p-4">
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
        <pre className="whitespace-pre-wrap overflow-auto max-h-[300px] font-mono text-sm">
          {JSON.stringify(JSON.parse(jsonOutput), null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}; 
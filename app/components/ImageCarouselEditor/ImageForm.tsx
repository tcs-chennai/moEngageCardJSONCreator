'use client'
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageFormProps } from "./types";

export const ImageForm: React.FC<ImageFormProps> = ({
  newImage,
  setNewImage,
  index,
  setIndex,
  type,
  isLoading,
  imageError,
  onAddImage,
  isValidUrl,
  setImageError
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <div className="flex-1 space-y-1.5">
          {newImage && <Label htmlFor="imageUrl">Image URL</Label>}
          <Input
            id="imageUrl"
            placeholder="Image URL"
            value={newImage}
            onChange={(e) => {
              setNewImage(e.target.value);
              if (e.target.value && !isValidUrl(e.target.value)) {
                setImageError("Please enter a valid URL");
              } else {
                setImageError("");
              }
            }}
            className={imageError ? 'border-red-500 focus-visible:ring-red-500' : ''}
            disabled={isLoading}
          />
        </div>
        {type === "carousel" && (
          <div className="space-y-1.5">
            {index && <Label htmlFor="index">Index</Label>}
            <Input
              id="index"
              placeholder="Index"
              type="number"
              min="0"
              value={index}
              onChange={(e) => {
                const newIndex = e.target.value;
                if (newIndex === "" || parseInt(newIndex, 10) >= 0) {
                  setIndex(newIndex);
                }
              }}
              disabled={isLoading}
            />
          </div>
        )}
        <Button onClick={onAddImage} disabled={isLoading}>
          {isLoading ? "Verifying..." : "Add Image"}
        </Button>
      </div>
      {imageError && <p className="text-sm text-red-500">{imageError}</p>}
    </div>
  );
}; 
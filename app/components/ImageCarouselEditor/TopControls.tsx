'use client'
import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TopControlsProps } from "./types";

export const TopControls: React.FC<TopControlsProps> = ({
  type,
  onTypeChange,
  position,
  onPositionChange,
  positionError,
  category,
  onCategoryChange,
  pageId,
  onPageIdChange,
  customPageId,
  onCustomPageIdChange,
  pageIdError,
  selectedAspectRatio,
  onAspectRatioChange,
  luxuryPageIds,
  fashionPageIds,
  aspectRatioOptions
}) => {
  return (
    <div className="flex gap-4 items-start">
      <Select onValueChange={onTypeChange} value={type}>
        <SelectTrigger>Type: {type}</SelectTrigger>
        <SelectContent>
          <SelectItem value="single">Single Image</SelectItem>
          <SelectItem value="carousel">Carousel</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-4">
        <div className="flex flex-col space-y-1">
          <div className="space-y-1.5">
            {position && <Label htmlFor="position">Position on page *</Label>}
            <Input
              id="position"
              placeholder="Position on page *"
              type="number"
              min="0"
              value={position}
              onChange={onPositionChange}
              className={positionError ? 'border-red-500 focus-visible:ring-red-500' : ''}
              required
            />
          </div>
          {positionError && <p className="text-sm text-red-500">{positionError}</p>}
        </div>

        <div className="flex flex-col space-y-1">
          <div className="space-y-1.5">
            <Label htmlFor="category">For App</Label>
            <Select onValueChange={onCategoryChange} value={category}>
              <SelectTrigger>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <div className="space-y-1.5">
            {pageId && <Label htmlFor="pageId">Page ID *</Label>}
            <Select onValueChange={onPageIdChange} value={pageId}>
              <SelectTrigger className={pageIdError ? 'border-red-500 focus-visible:ring-red-500' : ''}>
                {pageId === "other" ? "Other" : pageId || "Select Page ID *"}
              </SelectTrigger>
              <SelectContent>
                {(category === "luxury" ? luxuryPageIds : fashionPageIds).map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {pageId === "other" && (
            <div className="space-y-1.5">
              <Input
                id="customPageId"
                placeholder="Enter custom Page ID *"
                value={customPageId}
                onChange={onCustomPageIdChange}
                className={pageIdError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                required
              />
            </div>
          )}
          {pageIdError && <p className="text-sm text-red-500">{pageIdError}</p>}
        </div>

        <div className="flex flex-col space-y-1">
          <div className="space-y-1.5">
            <Label htmlFor="aspectRatio">Display Aspect Ratio</Label>
            <Select onValueChange={onAspectRatioChange} value={selectedAspectRatio}>
              <SelectTrigger>
                {selectedAspectRatio}
              </SelectTrigger>
              <SelectContent>
                {aspectRatioOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}; 
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
  aspectRatioOptions,
  priority,
  onPriorityChange
}) => {
  const [customPageIdSuggestions, setCustomPageIdSuggestions] = React.useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customPageIds');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const handleCustomPageIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCustomPageIdChange(e);
    if (e.target.value.trim() && !customPageIdSuggestions.includes(e.target.value.trim())) {
      const newSuggestions = [...customPageIdSuggestions, e.target.value.trim()].slice(-10); // Keep last 10 entries
      setCustomPageIdSuggestions(newSuggestions);
      localStorage.setItem('customPageIds', JSON.stringify(newSuggestions));
    }
  };

  const handleCustomPageIdBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value && !customPageIdSuggestions.includes(value)) {
      const newSuggestions = [...customPageIdSuggestions, value].slice(-10); // Keep last 10 entries
      setCustomPageIdSuggestions(newSuggestions);
      localStorage.setItem('customPageIds', JSON.stringify(newSuggestions));
    }
  };

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:gap-4 sm:items-start">
      <div className="w-full sm:w-auto">
        <Label>Type</Label>
        <Select onValueChange={onTypeChange} value={type}>
          <SelectTrigger className="w-full">Type: {type}</SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single Image</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-auto">
        <div className="space-y-1.5">
          <Label htmlFor="position">Position on page *</Label>
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

      <div className="w-full sm:w-auto">
        <Label htmlFor="category">For App</Label>
        <Select onValueChange={onCategoryChange} value={category}>
          <SelectTrigger className="w-full">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="luxury">Luxury</SelectItem>
            <SelectItem value="fashion">Fashion</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-auto">
        <Label htmlFor="pageId">Page ID *</Label>
        <Select onValueChange={onPageIdChange} value={pageId}>
          <SelectTrigger className={`w-full ${pageIdError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}>
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
        {pageId === "other" && (
          <div className="mt-1.5">
            <Input
              id="customPageId"
              list="customPageIdSuggestions"
              placeholder="Enter custom Page ID *"
              value={customPageId}
              onChange={onCustomPageIdChange}
              onBlur={handleCustomPageIdBlur}
              className={pageIdError ? 'border-red-500 focus-visible:ring-red-500' : ''}
              required
            />
            <datalist id="customPageIdSuggestions">
              {customPageIdSuggestions.map((suggestion, index) => (
                <option key={index} value={suggestion} />
              ))}
            </datalist>
          </div>
        )}
        {pageIdError && <p className="text-sm text-red-500">{pageIdError}</p>}
      </div>

      <div className="w-full sm:w-auto">
        <Label htmlFor="aspectRatio">Display Aspect Ratio</Label>
        <Select onValueChange={onAspectRatioChange} value={selectedAspectRatio}>
          <SelectTrigger className="w-full">
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

      <div className="w-full sm:w-auto">
        <Label htmlFor="priority">Priority (optional)</Label>
        <Input
          id="priority"
          placeholder="Enter priority (0 or positive number)"
          type="number"
          min="0"
          value={priority}
          onChange={onPriorityChange}
          className=""
        />
      </div>
    </div>
  );
}; 
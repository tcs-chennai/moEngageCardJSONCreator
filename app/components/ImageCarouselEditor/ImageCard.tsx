'use client'
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageCardProps } from "./types";

export const ImageCard: React.FC<ImageCardProps> = ({
  img,
  idx,
  onRemove,
  onUpdateCaption,
  onUpdateLink,
  onUpdateBannerId,
  hasDuplicateBannerId,
  hasAspectRatioMismatch,
  isValidUrl
}) => {
  return (
    <Card 
      className="relative cursor-move" 
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', idx.toString());
        e.currentTarget.classList.add('opacity-50');
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove('opacity-50');
      }}
    >
      <CardContent className="flex flex-col items-center p-2">
        <div className="w-full flex justify-between items-center mb-2">
          <div className="p-2 hover:bg-gray-100 rounded">
            ⋮⋮
          </div>
        </div>
        <div className="relative w-full h-[200px]">
          <Image
            src={img.url}
            alt={`Image ${idx}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Original Aspect Ratio: {img.displayAspectRatio}
        </div>
        <div className="text-xs text-muted-foreground">
          Selected Aspect Ratio: {img.aspectRatio}
        </div>
        {hasAspectRatioMismatch(img) && (
          <div className="text-xs text-yellow-600 mt-1">
            ⚠️ Warning: Selected aspect ratio doesn't match image's original aspect ratio
          </div>
        )}
        <div className="w-full space-y-1.5 mt-2">
          {img.bannerId && <Label htmlFor={`bannerId-${idx}`}>Banner ID *</Label>}
          <Input
            id={`bannerId-${idx}`}
            placeholder="Banner ID *"
            value={img.bannerId}
            onChange={(e) => {
              const isDuplicate = onUpdateBannerId(idx, e.target.value);
              if (isDuplicate) {
                toast.error("This Banner ID is already in use");
              }
            }}
            className={`${
              !img.bannerId.trim() || hasDuplicateBannerId(idx, img.bannerId)
                ? 'border-red-500 focus-visible:ring-red-500' 
                : ''
            }`}
            required
          />
          {!img.bannerId.trim() && (
            <p className="text-sm text-red-500">Banner ID is required</p>
          )}
          {hasDuplicateBannerId(idx, img.bannerId) && (
            <p className="text-sm text-red-500">This Banner ID is already in use</p>
          )}
        </div>
        <div className="w-full space-y-1.5 mt-2">
          {img.caption && <Label htmlFor={`caption-${idx}`}>Caption</Label>}
          <Input
            id={`caption-${idx}`}
            placeholder="Caption"
            value={img.caption}
            onChange={(e) => onUpdateCaption(idx, e.target.value)}
          />
        </div>
        <div className="w-full space-y-1.5 mt-2">
          {img.link && <Label htmlFor={`link-${idx}`}>Redirection Link *</Label>}
          <Input
            id={`link-${idx}`}
            placeholder="Redirection Link *"
            value={img.link}
            onChange={(e) => onUpdateLink(idx, e.target.value)}
            className={`${!img.link.trim() || !isValidUrl(img.link.trim()) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            required
          />
          {img.link.trim() && isValidUrl(img.link.trim()) && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => window.open(img.link, '_blank')}
            >
              Preview Link
            </Button>
          )}
        </div>
        {img.link.trim() && !isValidUrl(img.link.trim()) && (
          <p className="text-sm text-red-500 mt-1">Please enter a valid URL</p>
        )}
        <Button variant="ghost" onClick={() => onRemove(idx)} className="mt-2" aria-label="Delete image">
          <Trash2 className="w-5 h-5" />
        </Button>
      </CardContent>
    </Card>
  );
}; 
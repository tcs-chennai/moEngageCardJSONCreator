'use client'
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Copy } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ImageItem {
  url: string;
  caption: string;
  link: string;
  index?: number;
}

export default function ImageCarouselEditor() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [newImage, setNewImage] = useState("");
  const [index, setIndex] = useState("");
  const [type, setType] = useState("carousel");
  const [position, setPosition] = useState("");
  const [pageId, setPageId] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [imageError, setImageError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [positionError, setPositionError] = useState("");
  const [pageIdError, setPageIdError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const verifyImageLoad = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const addImage = async () => {
    if (newImage) {
      if (!isValidUrl(newImage)) {
        toast.error("Please enter a valid image URL");
        return;
      }

      // Check for duplicate images
      const isDuplicate = images.some(img => img.url === newImage);
      if (isDuplicate) {
        toast.error("This image has already been added");
        return;
      }

      setIsLoading(true);
      setImageError("Verifying image...");

      try {
        const isImageLoadable = await verifyImageLoad(newImage);
        if (!isImageLoadable) {
          setImageError("Image failed to load. Please check the URL.");
          setIsLoading(false);
          return;
        }

        const newImages = [...images];
        
        if (type === "single") {
          // For single image type, always replace the current image
          newImages.length = 0;
          newImages.push({ url: newImage, caption: "", link: "" });
        } else {
          // For carousel type
          if (index && index.trim() !== "") {
            // If index is specified, insert at that position
            const insertIndex = parseInt(index, 10);
            if (!isNaN(insertIndex)) {
              newImages.splice(insertIndex, 0, { url: newImage, caption: "", link: "" });
            } else {
              // If index is invalid, add at the end
              newImages.push({ url: newImage, caption: "", link: "" });
            }
          } else {
            // If no index specified, add at the end
            newImages.push({ url: newImage, caption: "", link: "" });
          }
        }
        
        setImages(newImages);
        setNewImage("");
        setIndex("");
        setImageError("");
        setHasChanges(true);
        toast.success("Image added successfully");
      } catch (error) {
        setImageError("Failed to verify image. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
    setHasChanges(true);
  };
  
  const updateCaption = (idx: number, caption: string) => {
    const newImages = [...images];
    newImages[idx].caption = caption;
    setImages(newImages);
    setHasChanges(true);
  };
  
  const updateLink = (idx: number, link: string) => {
    const newImages = [...images];
    newImages[idx].link = link;
    setImages(newImages);
    setHasChanges(true);
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    setHasChanges(true);
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosition(e.target.value);
    setHasChanges(true);
    if (!e.target.value.trim()) {
      setPositionError("Position is required");
    } else if (isNaN(parseInt(e.target.value, 10))) {
      setPositionError("Position must be a number");
    } else {
      setPositionError("");
    }
  };

  const handlePageIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageId(e.target.value);
    setHasChanges(true);
    if (!e.target.value.trim()) {
      setPageIdError("Page ID is required");
    } else {
      setPageIdError("");
    }
  };

  const exportJSON = () => {
    // Check if position is valid
    if (!position.trim()) {
      toast.error("Please enter a position number");
      return;
    }

    const positionNum = parseInt(position, 10);
    if (isNaN(positionNum)) {
      toast.error("Position must be a valid number");
      return;
    }

    // Check if pageId is valid
    if (!pageId.trim()) {
      toast.error("Please enter a page ID");
      return;
    }

    // Check if any image is missing a link or has invalid URLs
    const hasMissingLinks = images.some(img => !img.link.trim());
    const hasInvalidLinks = images.some(img => !isValidUrl(img.link.trim()));
    const hasInvalidImages = images.some(img => !isValidUrl(img.url));

    if (hasMissingLinks) {
      toast.error("Please add redirection links to all images before exporting");
      return;
    }

    if (hasInvalidLinks) {
      toast.error("Please ensure all redirection links are valid URLs");
      return;
    }

    if (hasInvalidImages) {
      toast.error("Please ensure all image URLs are valid");
      return;
    }

    const jsonOutput = JSON.stringify({ 
      type, 
      position: positionNum,
      pageId: pageId.trim(),
      content: images.map((img, idx) => ({ ...img })) 
    });
    setJsonOutput(jsonOutput);
    setHasChanges(false);
    console.log(jsonOutput);
  };

  const isFormValid = () => {
    return position.trim() && 
           !isNaN(parseInt(position, 10)) && 
           pageId.trim() &&
           images.length > 0 && 
           !images.some(img => !img.link.trim() || !isValidUrl(img.link.trim()) || !isValidUrl(img.url));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4 items-start">
        <Select onValueChange={handleTypeChange} value={type}>
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
                value={position}
                onChange={handlePositionChange}
                className={positionError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                required
              />
            </div>
            {positionError && <p className="text-sm text-red-500">{positionError}</p>}
          </div>

          <div className="flex flex-col space-y-1">
            <div className="space-y-1.5">
              {pageId && <Label htmlFor="pageId">Page ID *</Label>}
              <Input
                id="pageId"
                placeholder="Page ID *"
                value={pageId}
                onChange={handlePageIdChange}
                className={pageIdError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                required
              />
            </div>
            {pageIdError && <p className="text-sm text-red-500">{pageIdError}</p>}
          </div>
        </div>
      </div>

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
                value={index}
                onChange={(e) => setIndex(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
          <Button onClick={addImage} disabled={isLoading}>
            {isLoading ? "Verifying..." : "Add Image"}
          </Button>
        </div>
        {imageError && <p className="text-sm text-red-500">{imageError}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <Card key={idx} className="relative">
            <CardContent className="flex flex-col items-center p-2">
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src={img.url}
                  alt={`Image ${idx}`}
                  fill
                  className="object-contain"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    toast.error(`Failed to load image at index ${idx}`);
                  }}
                />
              </div>
              <div className="w-full space-y-1.5 mt-2">
                {img.caption && <Label htmlFor={`caption-${idx}`}>Caption</Label>}
                <Input
                  id={`caption-${idx}`}
                  placeholder="Caption"
                  value={img.caption}
                  onChange={(e) => updateCaption(idx, e.target.value)}
                />
              </div>
              <div className="w-full space-y-1.5 mt-2">
                {img.link && <Label htmlFor={`link-${idx}`}>Redirection Link *</Label>}
                <Input
                  id={`link-${idx}`}
                  placeholder="Redirection Link *"
                  value={img.link}
                  onChange={(e) => updateLink(idx, e.target.value)}
                  className={`${!img.link.trim() || !isValidUrl(img.link.trim()) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  required
                />
              </div>
              {img.link.trim() && !isValidUrl(img.link.trim()) && (
                <p className="text-sm text-red-500 mt-1">Please enter a valid URL</p>
              )}
              <Button variant="ghost" onClick={() => removeImage(idx)} className="mt-2">
                <Trash2 className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button 
        onClick={exportJSON}
        disabled={!isFormValid()}
      >
        Export JSON
      </Button>

      {jsonOutput && !hasChanges && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">JSON Output</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(jsonOutput);
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
      )}
    </div>
  );
}

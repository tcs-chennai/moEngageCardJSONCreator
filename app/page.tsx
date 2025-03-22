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
  aspectRatio: string;
  displayAspectRatio: string;
  bannerId: string;
}

export default function ImageCarouselEditor() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [newImage, setNewImage] = useState("");
  const [index, setIndex] = useState("");
  const [type, setType] = useState("carousel");
  const [position, setPosition] = useState("");
  const [category, setCategory] = useState("luxury");
  const [pageId, setPageId] = useState("");
  const [customPageId, setCustomPageId] = useState("");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("3:1");
  const [jsonOutput, setJsonOutput] = useState("");
  const [imageError, setImageError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [positionError, setPositionError] = useState("");
  const [pageIdError, setPageIdError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  
  const luxuryPageIds = [
    "men-home-page",
    "women-home-page",
    "the-watch-store",
    "beauty-home-page",
    "handbags-store",
    "footwear-store",
    "indiluxe",
    "lifestyle-home-page",
    "kids-clp",
    "the-collective"
  ];

  const fashionPageIds = [
    "beauty-homepage",
    "women-homepage",
    "footwear-homepage",
    "men-homepage",
    "westside/c-mbh11a00004",
    "home-homepage",
    "accessories-homepage",
    "kids-homepage"
  ];

  const aspectRatioOptions = [
    { value: "3:1", label: "3:1" },
    { value: "5:1", label: "5:1" },
  ];

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

  const calculateAspectRatio = (width: number, height: number): string => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    const ratioWidth = Math.round(width / divisor);
    const ratioHeight = Math.round(height / divisor);
    return `${ratioWidth}:${ratioHeight}`;
  };

  const generateDefaultBannerId = (index: number): string => {
    const finalPageId = pageId === "other" ? customPageId.trim() : pageId;
    const positionNum = position.trim() || "0";
    const carouselPosition = type === "carousel" ? `_${index}` : "";
    return `${category}_${finalPageId}_${positionNum}${carouselPosition}`;
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

        // Get image dimensions
        const img = new window.Image();
        img.src = newImage;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        const calculatedAspectRatio = calculateAspectRatio(img.width, img.height);

        const newImages = [...images];
        const newIndex = type === "carousel" && index && index.trim() !== "" 
          ? parseInt(index, 10) 
          : newImages.length;
        
        const defaultBannerId = generateDefaultBannerId(newIndex);
        
        if (type === "single") {
          newImages.length = 0;
          newImages.push({ 
            url: newImage, 
            caption: "", 
            link: "", 
            aspectRatio: selectedAspectRatio,
            displayAspectRatio: calculatedAspectRatio,
            bannerId: defaultBannerId
          });
        } else {
          // For carousel type
          if (!isNaN(newIndex)) {
            newImages.splice(newIndex, 0, { 
              url: newImage, 
              caption: "", 
              link: "", 
              aspectRatio: selectedAspectRatio,
              displayAspectRatio: calculatedAspectRatio,
              bannerId: defaultBannerId
            });
          } else {
            newImages.push({ 
              url: newImage, 
              caption: "", 
              link: "", 
              aspectRatio: selectedAspectRatio,
              displayAspectRatio: calculatedAspectRatio,
              bannerId: defaultBannerId
            });
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

  const updateBannerId = (idx: number, bannerId: string) => {
    const newImages = [...images];
    // Check if the banner ID is already used by another image
    const isDuplicate = images.some((img, i) => 
      i !== idx && img.bannerId.trim() === bannerId.trim()
    );
    newImages[idx].bannerId = bannerId;
    setImages(newImages);
    setHasChanges(true);
    return isDuplicate;
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    setHasChanges(true);
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = e.target.value;
    setPosition(newPosition);
    setHasChanges(true);
    
    // Update validation
    if (!newPosition.trim()) {
      setPositionError("Position is required");
    } else if (isNaN(parseInt(newPosition, 10))) {
      setPositionError("Position must be a number");
    } else if (parseInt(newPosition, 10) < 0) {
      setPositionError("Position cannot be negative");
    } else {
      setPositionError("");
      
      // Update Banner IDs for all images with new position
      const newImages = images.map((img, idx) => ({
        ...img,
        bannerId: `${category}_${pageId === "other" ? customPageId.trim() : pageId}_${newPosition.trim()}${type === "carousel" ? `_${idx}` : ""}`
      }));
      setImages(newImages);
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPageId("");
    setCustomPageId("");
    setHasChanges(true);
    
    // Update Banner IDs for all images with new category and empty pageId
    const newImages = images.map((img, idx) => ({
      ...img,
      bannerId: `${value}_${position.trim() || "0"}${type === "carousel" ? `_${idx}` : ""}`
    }));
    setImages(newImages);
  };

  const handlePageIdChange = (value: string) => {
    setPageId(value);
    setHasChanges(true);
    
    if (value === "other") {
      setPageIdError("");
    } else if (!value) {
      setPageIdError("Page ID is required");
    } else {
      setPageIdError("");
      
      // Update Banner IDs for all images with new page ID
      const newImages = images.map((img, idx) => ({
        ...img,
        bannerId: `${category}_${value}_${position.trim() || "0"}${type === "carousel" ? `_${idx}` : ""}`
      }));
      setImages(newImages);
    }
  };

  const handleCustomPageIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCustomPageId = e.target.value;
    setCustomPageId(newCustomPageId);
    setHasChanges(true);
    
    if (!newCustomPageId.trim()) {
      setPageIdError("Page ID is required");
    } else {
      setPageIdError("");
      
      // Update Banner IDs for all images with new custom page ID
      const newImages = images.map((img, idx) => ({
        ...img,
        bannerId: `${category}_${newCustomPageId.trim()}_${position.trim() || "0"}${type === "carousel" ? `_${idx}` : ""}`
      }));
      setImages(newImages);
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
    const finalPageId = pageId === "other" ? customPageId.trim() : pageId;
    if (!finalPageId) {
      toast.error("Please enter a page ID");
      return;
    }

    // Check if any image is missing a link, banner ID, or has invalid URLs
    const hasMissingLinks = images.some(img => !img.link.trim());
    const hasMissingBannerIds = images.some(img => !img.bannerId.trim());
    const hasDuplicateBannerIds = images.some((img, idx) => 
      images.some((otherImg, otherIdx) => 
        idx !== otherIdx && 
        img.bannerId.trim() === otherImg.bannerId.trim() && 
        img.bannerId.trim() !== ""
      )
    );
    const hasInvalidLinks = images.some(img => !isValidUrl(img.link.trim()));
    const hasInvalidImages = images.some(img => !isValidUrl(img.url));

    if (hasMissingBannerIds) {
      toast.error("Please add Banner IDs to all images before exporting");
      return;
    }

    if (hasDuplicateBannerIds) {
      toast.error("Each image must have a unique Banner ID");
      return;
    }

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
      pageId: finalPageId,
      aspectRatio: selectedAspectRatio,
      content: images.map((img, idx) => ({ 
        url: img.url,
        caption: img.caption,
        link: img.link,
        index: img.index,
        bannerId: img.bannerId
      })) 
    });
    setJsonOutput(jsonOutput);
    setHasChanges(false);
    console.log(jsonOutput);
  };

  const isFormValid = () => {
    const finalPageId = pageId === "other" ? customPageId.trim() : pageId;
    const hasDuplicateBannerIds = images.some((img, idx) => 
      images.some((otherImg, otherIdx) => 
        idx !== otherIdx && 
        img.bannerId.trim() === otherImg.bannerId.trim() && 
        img.bannerId.trim() !== ""
      )
    );
    return position.trim() && 
           !isNaN(parseInt(position, 10)) && 
           finalPageId &&
           images.length > 0 && 
           !images.some(img => 
             !img.link.trim() || 
             !img.bannerId.trim() ||
             !isValidUrl(img.link.trim()) || 
             !isValidUrl(img.url)
           ) &&
           !hasDuplicateBannerIds;
  };

  const hasInconsistentAspectRatios = () => {
    if (images.length <= 1) return false;
    const firstAspectRatio = images[0].displayAspectRatio;
    return images.some(img => img.displayAspectRatio !== firstAspectRatio);
  };

  const hasAspectRatioMismatch = (img: ImageItem) => {
    return img.displayAspectRatio !== img.aspectRatio;
  };

  return (
    <div className="p-4 space-y-4">
      {hasInconsistentAspectRatios() && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Warning: </strong>
          <span className="block sm:inline">Images have different aspect ratios. This may affect the display consistency.</span>
        </div>
      )}
      
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
                min="0"
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
              <Label htmlFor="category">For App</Label>
              <Select onValueChange={handleCategoryChange} value={category}>
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
              <Select onValueChange={handlePageIdChange} value={pageId}>
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
                  onChange={handleCustomPageIdChange}
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
              <Select onValueChange={setSelectedAspectRatio} value={selectedAspectRatio}>
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
              <div className="relative w-full h-[300px]">
                <Image
                  src={img.url}
                  alt={`Image ${idx}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    toast.error(`Failed to load image at index ${idx}`);
                  }}
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
                    const isDuplicate = updateBannerId(idx, e.target.value);
                    if (isDuplicate) {
                      toast.error("This Banner ID is already in use");
                    }
                  }}
                  className={`${
                    !img.bannerId.trim() || 
                    images.some((otherImg, otherIdx) => 
                      idx !== otherIdx && 
                      img.bannerId.trim() === otherImg.bannerId.trim() && 
                      img.bannerId.trim() !== ""
                    ) 
                      ? 'border-red-500 focus-visible:ring-red-500' 
                      : ''
                  }`}
                  required
                />
                {!img.bannerId.trim() && (
                  <p className="text-sm text-red-500">Banner ID is required</p>
                )}
                {images.some((otherImg, otherIdx) => 
                  idx !== otherIdx && 
                  img.bannerId.trim() === otherImg.bannerId.trim() && 
                  img.bannerId.trim() !== ""
                ) && (
                  <p className="text-sm text-red-500">This Banner ID is already in use</p>
                )}
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

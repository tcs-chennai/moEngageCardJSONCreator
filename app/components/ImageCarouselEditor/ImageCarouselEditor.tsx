'use client'
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImageItem, AspectRatioOption } from "./types";
import { ImageCard } from "./ImageCard";
import { ImageForm } from "./ImageForm";
import { TopControls } from "./TopControls";
import { JsonOutput } from "./JsonOutput";
import { isValidUrl, verifyImageLoad, calculateAspectRatio } from "./utils";

export const ImageCarouselEditor: React.FC = () => {
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
            // Update banner IDs for all images after insertion
            newImages.forEach((img, idx) => {
              img.bannerId = generateDefaultBannerId(idx);
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
    const newImages = images.filter((_, i) => i !== idx);
    // Update banner IDs for all remaining images
    newImages.forEach((img, index) => {
      img.bannerId = generateDefaultBannerId(index);
    });
    setImages(newImages);
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

  const handleAspectRatioChange = (value: string) => {
    setSelectedAspectRatio(value);
    setHasChanges(true);
    
    // Update aspect ratios for all images
    const newImages = images.map(img => ({
      ...img,
      aspectRatio: value
    }));
    setImages(newImages);
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

  const hasDuplicateBannerId = (idx: number, bannerId: string) => {
    return images.some((otherImg, otherIdx) => 
      idx !== otherIdx && 
      otherImg.bannerId.trim() === bannerId.trim() && 
      bannerId.trim() !== ""
    );
  };

  return (
    <div className="p-4 space-y-4">
      {hasInconsistentAspectRatios() && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Warning: </strong>
          <span className="block sm:inline">Images have different aspect ratios. This may affect the display consistency.</span>
        </div>
      )}
      
      <TopControls
        type={type}
        onTypeChange={handleTypeChange}
        position={position}
        onPositionChange={handlePositionChange}
        positionError={positionError}
        category={category}
        onCategoryChange={handleCategoryChange}
        pageId={pageId}
        onPageIdChange={handlePageIdChange}
        customPageId={customPageId}
        onCustomPageIdChange={handleCustomPageIdChange}
        pageIdError={pageIdError}
        selectedAspectRatio={selectedAspectRatio}
        onAspectRatioChange={handleAspectRatioChange}
        luxuryPageIds={luxuryPageIds}
        fashionPageIds={fashionPageIds}
        aspectRatioOptions={aspectRatioOptions}
      />

      <ImageForm
        newImage={newImage}
        setNewImage={setNewImage}
        index={index}
        setIndex={setIndex}
        type={type}
        isLoading={isLoading}
        imageError={imageError}
        setImageError={setImageError}
        onAddImage={addImage}
        isValidUrl={isValidUrl}
      />

      <div className="grid grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <ImageCard
            key={idx}
            img={img}
            idx={idx}
            onRemove={removeImage}
            onUpdateCaption={updateCaption}
            onUpdateLink={updateLink}
            onUpdateBannerId={updateBannerId}
            hasDuplicateBannerId={hasDuplicateBannerId}
            hasAspectRatioMismatch={hasAspectRatioMismatch}
            isValidUrl={isValidUrl}
          />
        ))}
      </div>

      <Button 
        onClick={exportJSON}
        disabled={!isFormValid()}
      >
        Export JSON
      </Button>

      {jsonOutput && !hasChanges && (
        <JsonOutput
          jsonOutput={jsonOutput}
          onCopy={async () => {
            await navigator.clipboard.writeText(jsonOutput);
          }}
        />
      )}
    </div>
  );
}; 
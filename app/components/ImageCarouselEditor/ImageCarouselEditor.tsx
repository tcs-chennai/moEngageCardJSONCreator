'use client'
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { ImageItem, AspectRatioOption } from "./types";
import { ImageCard } from "./ImageCard";
import { ImageForm } from "./ImageForm";
import { TopControls } from "./TopControls";
import { JsonOutput } from "./JsonOutput";
import { isValidUrl, verifyImageLoad, calculateAspectRatio } from "./utils";
import { Dialog, DialogContent } from "../ui/dialog";
import { MobilePreview } from "./MobilePreview";

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
  const [showPreview, setShowPreview] = useState(false);
  const [showJSONPreview, setShowJSONPreview] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [isJsonValid, setIsJsonValid] = useState(false);
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [showCampaignSelect, setShowCampaignSelect] = useState(false);
  const [campaigns, setCampaigns] = useState<{ name: string; data: string }[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [selectedView, setSelectedView] = useState<"create" | "importJson" | "importCampaign">("create");
  const [priority, setPriority] = useState<number | "">("");
  
  const commonPageIds = [
    "Cart",
    "Wishlist",
    "CLP",
    "PLP",
    "PDP",
    "Checkout",
    "Account",
    "CliQ Cash page",
    "Order History Page",
    "Search Home Page",
    "Order Confirmation Page"
  ]
  const luxuryPageIds = commonPageIds.concat([
    "men-home-page",
    "women-home-page",
    "the-watch-store",
    "beauty-home-page",
    "handbags-store",
    "footwear-store",
    "indiluxe",
    "lifestyle-home-page",
    "kids-clp",
    "the-collective",
    "footwear-microsite",
    "hybrid-plp-menswatches",
    "bvlgari",
    "LSH10",
    "LSH11",
    "LSH12",
    "LSH13",
    "LSH14",
    "LSH15",
    "LSH16",
    "LSH17",
    "LSH18",
    "LSH19",
    "LSH21",
    "LSH22",
    "LSH28",
    "LSH29",
    "LSH30",
    "LSH31"
  ]);

  const fashionPageIds = commonPageIds.concat([
    "beauty-homepage",
    "women-homepage",
    "footwear-homepage",
    "men-homepage",
    "westside/c-mbh11a00004",
    "home-homepage",
    "accessories-homepage",
    "kids-homepage",
    "Category",
    "MSH13",
    "MSH11",
    "MSH10",
    "MSH12",
    "MSH21",
    "MSH22",
    "MSH20",
    "MSH16",
    "MSH25",
    "MSH30",
    "MSH23",
    "MSH15",
    "MSH26",
    "MSH24",
    "MSH28",
    "MSH27"
  ]);

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

  const handlePriorityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPriority(value ? parseInt(value, 10) : "");
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
    const hasInvalidLinks = images.some(img => img.link.trim() !== "" && !isValidUrl(img.link.trim()));
    const hasInvalidImages = images.some(img => !isValidUrl(img.url));

    if (hasMissingBannerIds) {
      toast.error("Please add Banner IDs to all images before exporting");
      return;
    }

    if (hasDuplicateBannerIds) {
      toast.error("Each image must have a unique Banner ID");
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
      ...(priority !== "" && { priority }),
      aspectRatio: selectedAspectRatio,
      content: images.map((img) => ({ 
        url: img.url,
        caption: img.caption,
        link: img.link,
        bannerId: img.bannerId
      })) 
    });

    // Store the JSON in local storage
    const campaignName = prompt("Enter a name for this campaign:");
    if (campaignName) {
      const existingCampaigns = JSON.parse(localStorage.getItem("campaigns") || "[]");
      existingCampaigns.push({ name: campaignName, data: jsonOutput });
      localStorage.setItem("campaigns", JSON.stringify(existingCampaigns));
      setCampaigns(existingCampaigns); // Update the campaigns state
      toast.success("Campaign exported successfully!");
    }

    setJsonOutput(jsonOutput);
    setHasChanges(false);
    setShowJSONPreview(true);
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
             !img.bannerId.trim() ||
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

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (draggedIdx === targetIdx) return;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIdx, 1);
    newImages.splice(targetIdx, 0, draggedImage);

    // Update banner IDs for all images after reordering
    newImages.forEach((img, idx) => {
      img.bannerId = generateDefaultBannerId(idx);
    });

    setImages(newImages);
    setHasChanges(true);
  };

  const handleImportJSON = async (data: String) => {
      let jsonData;
      try {
        // First attempt at parsing JSON
        jsonData = JSON.parse(JSON.parse(data.trim()));
      } catch (error1) {
        try {
          // If first parsing fails, attempt a second-level parsing
          jsonData = JSON.parse(data.trim());
        } catch (error2) {
          throw new Error("Invalid JSON format"); // Rethrow if both fail
        }
      }

      // Ensure jsonData.content is an array before mapping
      if (!Array.isArray(jsonData.content)) {
        throw new Error("Invalid content format");
      }

      // Populate the form with the imported data
      setType(jsonData.type);
      setPosition(jsonData.position?.toString() || "");
      setPageId(jsonData.pageId);
      setSelectedAspectRatio(jsonData.aspectRatio);

      // Load images and calculate displayAspectRatio
      const newImages = await Promise.all(jsonData.content.map(async (img: any) => {
        const image = new Image();
        image.src = img.url;

        return new Promise<ImageItem>((resolve) => {
          image.onload = () => {
            const aspectRatio = calculateAspectRatio(image.width, image.height);
            resolve({
              url: img.url,
              caption: img.caption,
              link: img.link,
              bannerId: img.bannerId,
              aspectRatio: jsonData.aspectRatio, // Ensure aspect ratio is set
              displayAspectRatio: aspectRatio // Calculate display aspect ratio
            });
          };
        });
      }));

      setImages(newImages);
      setHasChanges(true);
      toast.success("JSON string imported successfully");

      // Hide the JSON input field and button after successful import
      setShowJsonInput(false);
      setJsonInput(""); // Clear the input field
  };

  // Effect to validate JSON input
  useEffect(() => {
    try {
      // Check if the input is a valid JSON string
      JSON.parse(jsonInput);
      setIsJsonValid(true);
    } catch {
      setIsJsonValid(false);
    }
  }, [jsonInput]);

  // Effect to load campaigns from local storage on component mount
  useEffect(() => {
    const storedCampaigns = JSON.parse(localStorage.getItem("campaigns") || "[]");
    setCampaigns(storedCampaigns);
  }, []);

  return (
    <div className="p-4 space-y-4">
      {hasInconsistentAspectRatios() && (
        <div className="flex justify-between items-center bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative sticky top-0 z-10" role="alert">
          <div>
            <strong className="font-bold">Warning: </strong>
            <span className="block sm:inline">Images have different aspect ratios. This may affect the display consistency.</span>
          </div>
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={images.length === 0}
            className="ml-4"
          >
            Preview
          </Button>
        </div>
      )}

<div className="flex justify-between items-center mb-4">
        <Button
          variant={selectedView === "create" ? "default" : "secondary"}
          onClick={() => setSelectedView("create")}
        >
          Create New
        </Button>
        <Button
          variant={selectedView === "importJson" ? "default" : "secondary"}
          onClick={() => {
            setSelectedView("importJson");
            setShowJsonInput(true);
            setShowCampaignSelect(false);
          }}
        >
          Import using JSON
        </Button>
        <Button
          variant={selectedView === "importCampaign" ? "default" : "secondary"}
          onClick={() => {
            setSelectedView("importCampaign");
            setShowCampaignSelect(true);
            setShowJsonInput(false);
          }}
        >
          Import Previously Created Campaigns
        </Button>
      </div>

      {selectedView === "importJson" && showJsonInput && (
        <div className="flex flex-col mt-4">
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON string here"
            rows={5}
            className="border p-2 mb-2"
          />
          <Button
            variant="outline"
            onClick={() => handleImportJSON(jsonInput)}
            disabled={!isJsonValid}
          >
            Import JSON
          </Button>
        </div>
      )}

      {selectedView === "importCampaign" && showCampaignSelect && (
        <div className="flex flex-col mt-4">
          <h3 className="font-bold">Previously Created Campaigns</h3>
          <Select onValueChange={(value) => {
            if (value !== "placeholder") {
              const campaign = campaigns.find(c => c.name === value);
              if (campaign) {
                handleImportJSON(campaign.data);
              }
              setSelectedCampaign(value);
            } else {
              setSelectedCampaign("");
            }
          }} value={selectedCampaign}>
            <SelectTrigger className="border p-2 mb-2">
              {selectedCampaign || "Select a campaign to import"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder" disabled>Select a campaign to import</SelectItem>
              {campaigns.map((campaign, idx) => (
                <SelectItem key={idx} value={campaign.name}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        priority={priority}
        onPriorityChange={handlePriorityChange}
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {images.map((img, idx) => (
          <div
            key={idx}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
          >
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
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => {
            setImages([]);
            setType("carousel");
            setPosition("");
            setCategory("luxury");
            setPageId("");
            setCustomPageId("");
            setSelectedAspectRatio("3:1");
            setPositionError("");
            setPageIdError("");
          }}
        >
          Reset
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={images.length === 0}
          >
            Preview
          </Button>
          <Button
            onClick={() => {
              exportJSON();
              navigator.clipboard.writeText(jsonOutput);
              toast.success("JSON copied to clipboard!");
            }}
            disabled={!isFormValid()}
          >
            Export JSON
          </Button>
        </div>
      </div>

      <Dialog open={showJSONPreview} onOpenChange={setShowJSONPreview}>
  <DialogContent className="max-w-[500px] h-[90vh] p-2 bg-[#f5f5f5] flex flex-col">
    {/* Ensure DialogContent takes up space properly */}
    <JsonOutput jsonOutput={jsonOutput} onCopy={async () => {
      await navigator.clipboard.writeText(jsonOutput);
    }} />
  </DialogContent>
</Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[391px] h-[90vh] p-2 bg-[#f5f5f5]">
          <MobilePreview images={images} type={type} />
        </DialogContent>
      </Dialog>
    </div>
  );
}; 
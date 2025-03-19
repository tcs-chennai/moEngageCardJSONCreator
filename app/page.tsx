'use client'
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Copy } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
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
  const [jsonOutput, setJsonOutput] = useState("");
  
  const addImage = () => {
    if (newImage) {
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
    }
  };
  
  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };
  
  const updateCaption = (idx: number, caption: string) => {
    const newImages = [...images];
    newImages[idx].caption = caption;
    setImages(newImages);
  };
  
  const updateLink = (idx: number, link: string) => {
    const newImages = [...images];
    newImages[idx].link = link;
    setImages(newImages);
  };
  
  const exportJSON = () => {
    // Check if any image is missing a link
    const hasMissingLinks = images.some(img => !img.link.trim());
    if (hasMissingLinks) {
      toast.error("Please add redirection links to all images before exporting");
      return;
    }

    const jsonOutput = JSON.stringify({ type, content: images.map((img, idx) => ({ ...img })) });
    setJsonOutput(jsonOutput);
    console.log(jsonOutput);
  };

  return (
    <div className="p-4 space-y-4">
      <Select onValueChange={setType} value={type}>
        <SelectTrigger>Type: {type}</SelectTrigger>
        <SelectContent>
          <SelectItem value="single">Single Image</SelectItem>
          <SelectItem value="carousel">Carousel</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex space-x-2">
        <Input
          placeholder="Image URL"
          value={newImage}
          onChange={(e) => setNewImage(e.target.value)}
        />
        {type === "carousel" && (
          <Input
            placeholder="Index"
            type="number"
            value={index}
            onChange={(e) => setIndex(e.target.value)}
          />
        )}
        <Button onClick={addImage}>Add Image</Button>
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
                />
              </div>
              <Input
                placeholder="Caption"
                value={img.caption}
                onChange={(e) => updateCaption(idx, e.target.value)}
                className="mt-2"
              />
              <Input
                placeholder="Redirection Link *"
                value={img.link}
                onChange={(e) => updateLink(idx, e.target.value)}
                className={`mt-2 ${!img.link.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                required
              />
              <Button variant="ghost" onClick={() => removeImage(idx)} className="mt-2">
                <Trash2 className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button 
        onClick={exportJSON}
        disabled={images.some(img => !img.link.trim())}
      >
        Export JSON
      </Button>

      {jsonOutput && (
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

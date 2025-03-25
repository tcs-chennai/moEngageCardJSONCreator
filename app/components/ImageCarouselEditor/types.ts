export interface ImageItem {
  url: string;
  caption: string;
  link: string;
  index?: number;
  aspectRatio: string;
  displayAspectRatio: string;
  bannerId: string;
}

export interface AspectRatioOption {
  value: string;
  label: string;
}

export interface ImageCardProps {
  img: ImageItem;
  idx: number;
  onRemove: (idx: number) => void;
  onUpdateCaption: (idx: number, caption: string) => void;
  onUpdateLink: (idx: number, link: string) => void;
  onUpdateBannerId: (idx: number, bannerId: string) => boolean;
  hasDuplicateBannerId: (idx: number, bannerId: string) => boolean;
  hasAspectRatioMismatch: (img: ImageItem) => boolean;
  isValidUrl: (url: string) => boolean;
}

export interface ImageFormProps {
  newImage: string;
  setNewImage: (value: string) => void;
  index: string;
  setIndex: (value: string) => void;
  type: string;
  isLoading: boolean;
  imageError: string;
  setImageError: (value: string) => void;
  onAddImage: () => void;
  isValidUrl: (url: string) => boolean;
}

export interface TopControlsProps {
  type: string;
  onTypeChange: (value: string) => void;
  position: string;
  onPositionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  positionError: string;
  category: string;
  onCategoryChange: (value: string) => void;
  pageId: string;
  onPageIdChange: (value: string) => void;
  customPageId: string;
  onCustomPageIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pageIdError: string;
  selectedAspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  luxuryPageIds: string[];
  fashionPageIds: string[];
  aspectRatioOptions: AspectRatioOption[];
  priority: number | "";
  onPriorityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface JsonOutputProps {
  jsonOutput: string;
  onCopy: () => Promise<void>;
} 
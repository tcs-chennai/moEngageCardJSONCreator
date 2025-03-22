import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageCarouselEditor } from '../ImageCarouselEditor';
import { toast } from 'sonner';

// Mock the toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, ...props }: any) => <img {...props} style={fill ? { objectFit: 'cover', width: '100%', height: '100%' } : undefined} />
}));

// Mock image verification
jest.mock('../utils', () => {
  const mockVerifyImageLoad = jest.fn().mockImplementation(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  });
  return {
    isValidUrl: (url: string) => url.startsWith('https://'),
    verifyImageLoad: mockVerifyImageLoad,
    calculateAspectRatio: () => '3:1'
  };
});

// Mock window.Image
const mockImage = {
  src: '',
  width: 1200,
  height: 400,
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null
};

Object.defineProperty(window, 'Image', {
  writable: true,
  configurable: true,
  value: jest.fn(() => {
    const img = { ...mockImage };
    setTimeout(() => {
      if (img.onload) {
        img.onload();
      }
    }, 100);
    return img;
  })
});

// Mock Radix UI components
const mockSelects: { [key: string]: string } = {};

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => {
    const selectId = React.useId();
    mockSelects[selectId] = value;
    return (
      <div data-testid="select" data-value={value}>
        <div 
          role="button"
          onClick={() => {
            let newValue = '';
            if (value === 'luxury') newValue = 'fashion';
            else if (value === 'carousel') newValue = 'single';
            else if (value === '3:1') newValue = '5:1';
            else if (!value) newValue = 'men-home-page';
            onValueChange && onValueChange(newValue);
            mockSelects[selectId] = newValue;
          }}
        >
          {value || 'Select an option'}
        </div>
        <div>{children}</div>
      </div>
    );
  },
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-value={value}>{children}</div>
  ),
}));

describe('ImageCarouselEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockSelects).forEach(key => delete mockSelects[key]);
  });

  describe('Initial Render', () => {
    it('renders all initial controls', async () => {
      render(<ImageCarouselEditor />);
      
      expect(screen.getByRole('button', { name: /carousel/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Position on page *')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Luxury/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select an option/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /3:1/i })).toBeInTheDocument();
    });
  });

  describe('Image Addition', () => {
    it('adds a single image successfully', async () => {
      render(<ImageCarouselEditor />);
      
      await userEvent.type(screen.getByPlaceholderText('Image URL'), 'https://example.com/image.jpg');
      await userEvent.click(screen.getByRole('button', { name: /Add Image/i }));
      
      // Wait for image verification to complete
      await waitFor(() => {
        expect(screen.queryByText('Verifying image...')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      await waitFor(() => {
        expect(screen.getByAltText('Image 0')).toBeInTheDocument();
      });
    });

    it('shows error for invalid image URL', async () => {
      render(<ImageCarouselEditor />);
      
      await userEvent.type(screen.getByPlaceholderText('Image URL'), 'invalid-url');
      
      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });

    it('adds image at specific index in carousel mode', async () => {
      render(<ImageCarouselEditor />);
      
      // Add first image
      await userEvent.type(screen.getByPlaceholderText('Image URL'), 'https://example.com/image1.jpg');
      await userEvent.click(screen.getByRole('button', { name: /Add Image/i }));
      
      // Wait for image verification to complete
      await waitFor(() => {
        expect(screen.queryByText('Verifying image...')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Add second image at index 0
      await userEvent.type(screen.getByPlaceholderText('Image URL'), 'https://example.com/image2.jpg');
      await userEvent.type(screen.getByPlaceholderText('Index'), '0');
      await userEvent.click(screen.getByRole('button', { name: /Add Image/i }));
      
      // Wait for image verification to complete
      await waitFor(() => {
        expect(screen.queryByText('Verifying image...')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images[0]).toHaveAttribute('src', 'https://example.com/image2.jpg');
        expect(images[1]).toHaveAttribute('src', 'https://example.com/image1.jpg');
      });
    });
  });

  describe('Image Removal', () => {
    it('removes an image and updates banner IDs', async () => {
      render(<ImageCarouselEditor />);
      
      // Add two images
      await userEvent.type(screen.getByPlaceholderText('Image URL'), 'https://example.com/image1.jpg');
      await userEvent.click(screen.getByRole('button', { name: /Add Image/i }));
       // Wait for image verification to complete
       await waitFor(() => {
        expect(screen.queryByText('Verifying image...')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      await userEvent.type(screen.getByPlaceholderText('Image URL'), 'https://example.com/image2.jpg');
      await userEvent.click(screen.getByRole('button', { name: /Add Image/i }));

       // Wait for image verification to complete
       await waitFor(() => {
        expect(screen.queryByText('Verifying image...')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Remove first image
      const removeButtons = screen.getAllByRole('button', { name: /Delete image/i });
      await userEvent.click(removeButtons[0]);
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(1);
        expect(images[0]).toHaveAttribute('src', 'https://example.com/image2.jpg');
      });
    });
  });

  describe('Top Controls', () => {
    it('updates banner IDs when position changes', async () => {
      render(<ImageCarouselEditor />);
      
      // Add an image
      await userEvent.type(screen.getByPlaceholderText('Image URL'), 'https://example.com/image1.jpg');
      await userEvent.click(screen.getByRole('button', { name: /Add Image/i }));
      await waitFor(() => {
        expect(screen.queryByText('Verifying image...')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      // Change position
      const positionInput = screen.getByPlaceholderText('Position on page *');
      await userEvent.type(positionInput, '2');
      
      await waitFor(() => {
        const bannerIdInput = screen.getByPlaceholderText('Banner ID *');
        expect(bannerIdInput).toHaveValue('luxury__2_0');
      });
    });

    it('updates banner IDs when category changes', async () => {
      render(<ImageCarouselEditor />);
      
      // Add an image
      await userEvent.type(screen.getByPlaceholderText('Image URL'), 'https://example.com/image1.jpg');
      await userEvent.click(screen.getByRole('button', { name: /Add Image/i }));
      await waitFor(() => {
        expect(screen.queryByText('Verifying image...')).not.toBeInTheDocument();
      }, { timeout: 2000 });

      // Change category using mock Select behavior
      const categorySelect = screen.getByRole('button', { name: /Luxury/i });
      await userEvent.click(categorySelect);

      await waitFor(() => {
        const bannerIdInput = screen.getByPlaceholderText('Banner ID *');
        expect(bannerIdInput).toHaveValue('fashion_0_0');
      });
    });

    it('updates banner IDs when page ID changes', async () => {
      render(<ImageCarouselEditor />);
      
      // Add an image
      await userEvent.type(screen.getByPlaceholderText('Image URL'), 'https://example.com/image1.jpg');
      await userEvent.click(screen.getByRole('button', { name: /Add Image/i }));
      await waitFor(() => {
        expect(screen.queryByText('Verifying image...')).not.toBeInTheDocument();
      }, { timeout: 2000 });

      // Change page ID using mock Select behavior
      const pageIdSelect = screen.getByRole('button', { name: /Select an option/i });
      await userEvent.click(pageIdSelect);
      
      await waitFor(() => {
        const bannerIdInput = screen.getByPlaceholderText('Banner ID *');
        expect(bannerIdInput).toHaveValue('luxury_men-home-page_0_0');
      });
    });
  });

  describe('Validation', () => {
    it('prevents export with missing required fields', async () => {
      render(<ImageCarouselEditor />);
      
      // Add an image without required fields
      await userEvent.type(screen.getByPlaceholderText('Image URL'), 'https://example.com/image1.jpg');
      const addButton = screen.getByRole('button', { name: /Add Image/i });
      await userEvent.click(addButton);
      
      // Wait for image verification to complete
      await waitFor(() => {
        expect(screen.queryByText('Verifying image...')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Check if export button is disabled
      const exportButton = screen.getByRole('button', { name: /Export JSON/i });
      expect(exportButton).toBeDisabled();
      
    });

    it('prevents export with duplicate banner IDs', async () => {
      render(<ImageCarouselEditor />);
      
      // Add first image
      await userEvent.type(screen.getByPlaceholderText('Image URL'), 'https://example.com/image1.jpg');
      const addButton = screen.getByRole('button', { name: /Add Image/i });
      await userEvent.click(addButton);
      
      // Wait for image verification to complete
      await waitFor(() => {
        expect(screen.queryByText('Verifying image...')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Add second image
      await userEvent.type(screen.getByPlaceholderText('Image URL'), 'https://example.com/image2.jpg');
      await userEvent.click(screen.getByRole('button', { name: /Add Image/i }));
      
      // Wait for image verification to complete
      await waitFor(() => {
        expect(screen.queryByText('Verifying image...')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Set same banner ID for both images
      const bannerIdInputs = screen.getAllByPlaceholderText('Banner ID *');
      await userEvent.clear(bannerIdInputs[0]);
      await userEvent.type(bannerIdInputs[0], 'same-id');
      await userEvent.clear(bannerIdInputs[1]);
      await userEvent.type(bannerIdInputs[1], 'same-id');
      
      // Try to export
      const exportButton = screen.getByRole('button', { name: /Export JSON/i });
      await userEvent.click(exportButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('This Banner ID is already in use');
      });
    });
  });

  describe('Aspect Ratio', () => {
    it('updates aspect ratio for all images when changed', async () => {
      render(<ImageCarouselEditor />);
      
      // Add first image
      await userEvent.type(screen.getByPlaceholderText('Image URL'), 'https://example.com/image1.jpg');
      const addButton = screen.getByRole('button', { name: /Add Image/i });
      await userEvent.click(addButton);
      
      // Wait for image verification to complete
      await waitFor(() => {
        expect(screen.queryByText('Verifying image...')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Add second image
      await userEvent.type(screen.getByPlaceholderText('Image URL'), 'https://example.com/image2.jpg');
      await userEvent.click(screen.getByRole('button', { name: /Add Image/i }));
      
      // Wait for image verification to complete
      await waitFor(() => {
        expect(screen.queryByText('Verifying image...')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Change aspect ratio
      const aspectRatioSelect = screen.getByRole('button', { name: /3:1/i });
      await userEvent.click(aspectRatioSelect);
      
      await waitFor(() => {
        const aspectRatioTexts = screen.getAllByText(/Selected Aspect Ratio: 5:1/);
        expect(aspectRatioTexts).toHaveLength(2);
      });
    });
  });
}); 
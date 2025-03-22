/// <reference types="@playwright/test" />
import { test, expect } from '@playwright/test';
import { getByRole } from '@testing-library/react';

const TEST_IMAGE_URLS = {
  image1: 'https://github.githubassets.com/assets/quickdraw-default-39c6aec8ff89.png',
  image2: 'https://assets.tatacliq.com/medias/sys_master/images/64250125582366.jpg'
};

test.describe('ImageCarouselEditor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Initial Render', () => {
    test('renders all initial controls', async ({ page }) => {
      await expect(page.getByPlaceholder('Position on page *')).toBeVisible();
      await expect(page.getByText('Luxury')).toBeVisible();
      await expect(page.getByText('Select Page ID')).toBeVisible();
      await expect(page.getByText(':1')).toBeVisible();
      await expect(page.getByText('Type: carousel')).toBeVisible();
    });
  });

  test.describe('Image Addition', () => {
    test('adds a single image successfully', async ({ page }) => {
      await page.getByPlaceholder('Image URL').fill(TEST_IMAGE_URLS.image1);
      await page.getByRole('button', { name: /Add Image/i }).click();
      
      // Wait for image verification to complete
      await expect(page.getByText('Verifying image...')).not.toBeVisible();
      
      await expect(page.getByAltText('Image 0')).toBeVisible();
    });

    test('shows error for invalid image URL', async ({ page }) => {
      await page.getByPlaceholder('Image URL').fill('invalid-url');
      
      await expect(page.getByText('Please enter a valid URL')).toBeVisible();
    });

    test('adds image at specific index in carousel mode', async ({ page }) => {
      // Add first image
      await page.getByPlaceholder('Image URL').fill(TEST_IMAGE_URLS.image1);
      await page.getByRole('button', { name: /Add Image/i }).click();
      
      // Wait for image verification to complete
      await expect(page.getByText('Verifying image...')).not.toBeVisible();
      
      // Add second image at index 0
      await page.getByPlaceholder('Image URL').fill(TEST_IMAGE_URLS.image2);
      await page.getByPlaceholder('Index').fill('0');
      await page.getByRole('button', { name: /Add Image/i }).click();
      
      // Wait for image verification to complete
      await expect(page.getByText('Verifying image...')).not.toBeVisible();
      
      await expect(page.getByRole('img', { name: 'Image 0' })).toHaveAttribute('src', TEST_IMAGE_URLS.image2);
      await expect(page.getByRole('img', { name: 'Image 1' })).toHaveAttribute('src', TEST_IMAGE_URLS.image1);
    });
  });

  test.describe('Image Removal', () => {
    test('removes an image and updates banner IDs', async ({ page }) => {
      // Add two images
      await page.getByPlaceholder('Image URL').fill(TEST_IMAGE_URLS.image1);
      await page.getByRole('button', { name: /Add Image/i }).click();
      
      // Wait for image verification to complete
      await expect(page.getByText('Verifying image...')).not.toBeVisible();
      
      await page.getByPlaceholder('Image URL').fill(TEST_IMAGE_URLS.image2);
      await page.getByRole('button', { name: /Add Image/i }).click();
      
      // Wait for image verification to complete
      await expect(page.getByText('Verifying image...')).not.toBeVisible();
      
      // Remove first image
      const removeButtons = await page.getByRole('button', { name: 'Delete image' }).all();
      await removeButtons[0].click();
      
      await expect(page.getByRole('img', { name: 'Image 0' })).toHaveAttribute('src', TEST_IMAGE_URLS.image2);
    });
  });

  test.describe('Top Controls', () => {
    test('updates banner IDs when position changes', async ({ page }) => {
      // Add an image
      await page.getByPlaceholder('Image URL').fill(TEST_IMAGE_URLS.image1);
      await page.getByRole('button', { name: /Add Image/i }).click();
      
      // Wait for image verification to complete
      await expect(page.getByText('Verifying image...')).not.toBeVisible();
      
      // Change position
      await page.getByPlaceholder('Position on page *').fill('2');
      
      await expect(page.getByPlaceholder('Banner ID *')).toHaveValue('luxury__2_0');
    });

    test('updates banner IDs when category changes', async ({ page }) => {
      // Add an image
      await page.getByPlaceholder('Image URL').fill(TEST_IMAGE_URLS.image1);
      await page.getByRole('button', { name: /Add Image/i }).click();
      
      // Wait for image verification to complete
      await expect(page.getByText('Verifying image...')).not.toBeVisible();
      
      // Change category
      await page.getByText('Luxury').click();
      await page.getByText('Fashion').click();
      
      await expect(page.getByPlaceholder('Banner ID *')).toHaveValue('fashion_0_0');
    });

    test('updates banner IDs when page ID changes', async ({ page }) => {
      // Add an image
      await page.getByPlaceholder('Image URL').fill(TEST_IMAGE_URLS.image1);
      await page.getByRole('button', { name: /Add Image/i }).click();
      
      // Wait for image verification to complete
      await expect(page.getByText('Verifying image...')).not.toBeVisible();
      
      // Change page ID
      await page.getByText('Select Page ID').click();
      await page.getByText('men-home-page', { exact: true }).click();
      
      await expect(page.getByPlaceholder('Banner ID *')).toHaveValue('luxury_men-home-page_0_0');
    });
  });

  test.describe('Validation', () => {
    test('prevents export with missing required fields', async ({ page }) => {
      // Add an image without required fields
      await page.getByPlaceholder('Image URL').fill(TEST_IMAGE_URLS.image1);
      await page.getByRole('button', { name: /Add Image/i }).click();
      
      // Wait for image verification to complete
      await expect(page.getByText('Verifying image...')).not.toBeVisible();
      
      // Check if export button is disabled
      const exportButton = page.getByRole('button', { name: /Export JSON/i });
      await expect(exportButton).toBeDisabled();
    });

    test('prevents export with duplicate banner IDs', async ({ page }) => {
      // Add first image
      await page.getByPlaceholder('Image URL').fill(TEST_IMAGE_URLS.image1);
      await page.getByRole('button', { name: /Add Image/i }).click();
      
      // Wait for image verification to complete
      await expect(page.getByText('Verifying image...')).not.toBeVisible();
      
      // Add second image
      await page.getByPlaceholder('Image URL').fill(TEST_IMAGE_URLS.image2);
      await page.getByRole('button', { name: /Add Image/i }).click();
      
      // Wait for image verification to complete
      await expect(page.getByText('Verifying image...')).not.toBeVisible();
      
      // Set same banner ID for both images
      const bannerIdInputs = await page.getByPlaceholder('Banner ID *').all();
      await bannerIdInputs[0].fill('');
      await bannerIdInputs[0].fill('same-id');
      await bannerIdInputs[1].fill('');
      await bannerIdInputs[1].fill('same-id');
      
      const exportButton = page.getByRole('button', { name: /Export JSON/i });
      await expect(exportButton).toBeDisabled();
    });
  });

  test.describe('Aspect Ratio', () => {
    test('updates aspect ratio for all images when changed', async ({ page }) => {
      // Add first image
      await page.getByPlaceholder('Image URL').fill(TEST_IMAGE_URLS.image1);
      await page.getByRole('button', { name: /Add Image/i }).click();
      
      // Wait for image verification to complete
      await expect(page.getByText('Verifying image...')).not.toBeVisible();
      
      // Add second image
      await page.getByPlaceholder('Image URL').fill(TEST_IMAGE_URLS.image2);
      await page.getByRole('button', { name: /Add Image/i }).click();
      
      // Wait for image verification to complete
      await expect(page.getByText('Verifying image...')).not.toBeVisible();
      
      // Change aspect ratio
      await page.getByText('3:1', { exact: true }).click();
      await page.getByRole('option', { name: '5:1' }).click();
      
      const aspectRatioTexts = await page.getByText(/Selected Aspect Ratio: 5:1/).all();
      await expect(aspectRatioTexts).toHaveLength(2);
    });
  });
}); 
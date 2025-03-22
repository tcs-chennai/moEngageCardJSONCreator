'use client'
import { ImageCarouselEditor } from "./components/ImageCarouselEditor/ImageCarouselEditor";

export default function Page() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Image Carousel Editor</h1>
      <ImageCarouselEditor />
    </main>
  );
}

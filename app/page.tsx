'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Eye, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageItem {
  id: number;
  camera_id: string;
  image_url: string;
  created_at: string;
}

interface ApiResponse {
  data: ImageItem[];
}

export default function Gallery() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ;

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/events`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data: ApiResponse = await response.json();
      setImages(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchImageDetail = async (id: number) => {
    try {
      setLoadingDetail(true);
      const response = await fetch(`${backendUrl}/api/events/${id}`);
      if (!response.ok) throw new Error('Failed to fetch image details');
      const data = await response.json();
      setSelectedImage(data.data || data);
    } catch (err) {
      console.error('[v0] Error fetching image detail:', err);
      alert(err instanceof Error ? err.message : 'Failed to fetch image details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleViewImage = async (image: ImageItem) => {
    setSelectedImage(image);
    await fetchImageDetail(image.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      setDeleting(id);
      const response = await fetch(`${backendUrl}/api/events/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete image');
      setImages(images.filter((img) => img.id !== id));
      setSelectedImage(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete image');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrentImageIndex = () => {
    return images.findIndex((img) => img.id === selectedImage?.id);
  };

  const handlePrevious = async () => {
    const currentIndex = getCurrentImageIndex();
    if (currentIndex > 0) {
      const previousImage = images[currentIndex - 1];
      setSelectedImage(previousImage);
      await fetchImageDetail(previousImage.id);
    }
  };

  const handleNext = async () => {
    const currentIndex = getCurrentImageIndex();
    if (currentIndex < images.length - 1) {
      const nextImage = images[currentIndex + 1];
      setSelectedImage(nextImage);
      await fetchImageDetail(nextImage.id);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header Section */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              Smart Agriculture
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-3xl">
              Real-time field monitoring with advanced camera systems. View, manage, and analyze agricultural data with precision.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading agricultural data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] gap-4 bg-destructive/10 rounded-lg p-8 border border-destructive/30">
            <p className="text-destructive font-semibold">Error loading images</p>
            <p className="text-destructive/80 text-sm max-w-md text-center">{error}</p>
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
            <p className="text-muted-foreground text-lg">No images available</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
                >
                  {/* Image Container */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-muted">
                    <Image
                      src={`${backendUrl}/${image.image_url}`}
                      alt={`Camera ${image.camera_id} - ${image.created_at}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      crossOrigin="anonymous"
                    />

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Action Buttons */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleViewImage(image)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {/* <button
                        onClick={() => handleDelete(image.id)}
                        disabled={deleting === image.id}
                        className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
                      >
                        {deleting === image.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Delete
                      </button> */}
                    </div>

                    {/* Camera Badge */}
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                      Camera {image.camera_id}
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <time className="text-xs sm:text-sm text-muted-foreground font-medium">
                        {formatDate(image.created_at)}
                      </time>
                      <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-md font-medium">
                        ID: {image.id}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="mt-16 pt-12 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-3 p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors">
                  <span className="text-muted-foreground text-sm font-medium">Total Images</span>
                  <span className="text-3xl sm:text-4xl font-bold text-primary">{images.length}</span>
                </div>
                <div className="flex flex-col gap-3 p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors">
                  <span className="text-muted-foreground text-sm font-medium">Active Cameras</span>
                  <span className="text-3xl sm:text-4xl font-bold text-primary">
                    {new Set(images.map((img) => img.camera_id)).size}
                  </span>
                </div>
                <div className="flex flex-col gap-3 p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors">
                  <span className="text-muted-foreground text-sm font-medium">Latest Capture</span>
                  <span className="text-sm sm:text-base font-medium text-foreground">
                    {images.length > 0 ? formatDate(images[0].created_at) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl h-full max-h-[90vh] flex items-center justify-center">
            {loadingDetail ? (
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={`${backendUrl}/${selectedImage.image_url}`}
                  alt={`Camera ${selectedImage.camera_id}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, 90vw"
                  crossOrigin="anonymous"
                  priority
                />
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous Button */}
            {getCurrentImageIndex() > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Button */}
            {getCurrentImageIndex() < images.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Camera Info Badge */}
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-10">
              <p className="text-sm font-medium">Camera {selectedImage.camera_id}</p>
              <p className="text-xs text-white/80">{formatDate(selectedImage.created_at)}</p>
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-10">
              <p className="text-sm font-medium">{getCurrentImageIndex() + 1} / {images.length}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

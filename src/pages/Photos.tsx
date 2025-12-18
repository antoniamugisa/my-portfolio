import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { photos } from '@/data/photos';

const Photos = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const selectedPhotoData = selectedPhoto ? photos.find(p => p.id === selectedPhoto) : null;

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = photos.findIndex(p => p.id === selectedPhoto);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
        setSelectedPhoto(photos[prevIndex].id);
      } else if (e.key === 'ArrowRight') {
        const currentIndex = photos.findIndex(p => p.id === selectedPhoto);
        const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
        setSelectedPhoto(photos[nextIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPhoto]);

  return (
    <div className="min-h-screen bg-background md:ml-56 md:mr-32 pt-24 md:pt-16 flex flex-col">
      {/* Main Layout */}
      <div className="container mx-auto px-4 md:px-6 max-w-5xl flex-grow">
        <div className="grid lg:grid-cols-12 gap-4 md:gap-8">
          {/* Left Side - Title Section */}
          <div className="lg:col-span-3 py-8 md:py-12">
            <div className="sticky top-20 md:top-24 pb-2 md:pb-12">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-heading mb-4 md:mb-6 bg-primary bg-clip-text text-transparent leading-[1.2] pb-2">
                Photos
              </h1>
              <p className="text-base md:text-lg text-foreground/70 leading-relaxed">
                A gallery into my love for film photography
              </p>
            </div>
          </div>

          {/* Right Side - Gallery */}
          <div className="lg:col-span-9">
            <section className="py-8 md:py-12">
              {photos.length === 0 ? (
                <div className="text-center py-16 text-foreground/60">
                  <p>Photo gallery coming soon...</p>
                  <p className="text-sm mt-2 text-foreground/50">
                    Add photos to <code className="text-xs bg-muted px-2 py-1 rounded">src/data/photos/index.ts</code>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative overflow-hidden rounded-lg cursor-pointer"
                      onClick={() => setSelectedPhoto(photo.id)}
                    >
                      <div className="aspect-square overflow-hidden bg-background border border-border/40 group-hover:border-primary/50 transition-all duration-300">
                        <img
                          src={photo.image}
                          alt={photo.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                        <div className="p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
                          <h3 className="text-white font-semibold text-sm mb-1">{photo.title}</h3>
                          {photo.location && (
                            <p className="text-white/80 text-xs">{photo.location}</p>
                          )}
                          {photo.date && (
                            <p className="text-white/70 text-xs mt-1">
                              {new Date(photo.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhotoData && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-7xl max-h-[90vh] relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-primary transition-colors z-10 p-2 rounded-full hover:bg-white/10"
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>

            {/* Navigation buttons */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = photos.findIndex(p => p.id === selectedPhoto);
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
                    setSelectedPhoto(photos[prevIndex].id);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-primary transition-colors z-10 p-3 rounded-full hover:bg-white/10"
                  aria-label="Previous photo"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = photos.findIndex(p => p.id === selectedPhoto);
                    const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
                    setSelectedPhoto(photos[nextIndex].id);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-primary transition-colors z-10 p-3 rounded-full hover:bg-white/10"
                  aria-label="Next photo"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}

            {/* Image */}
            <div
              className="max-w-full max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhotoData.image}
                alt={selectedPhotoData.title}
                className="max-w-full max-h-[90vh] object-contain"
              />
              
              {/* Photo info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">{selectedPhotoData.title}</h3>
                {selectedPhotoData.description && (
                  <p className="text-white/90 mb-2">{selectedPhotoData.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-white/80">
                  {selectedPhotoData.location && (
                    <span>📍 {selectedPhotoData.location}</span>
                  )}
                  {selectedPhotoData.date && (
                    <span>
                      {new Date(selectedPhotoData.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                </div>
                {selectedPhotoData.tags && selectedPhotoData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedPhotoData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs border border-white/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Photo counter */}
            {photos.length > 1 && (
              <div className="absolute top-4 left-4 text-white/80 text-sm z-10">
                {photos.findIndex(p => p.id === selectedPhoto) + 1} / {photos.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 bg-background pb-24 md:pb-12 mt-auto">
        <div className="container mx-auto px-6 flex flex-col items-center gap-2 text-center md:flex-row md:justify-between md:text-left">
          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/70 bg-background/60">
            Version: <span className="ml-1 font-semibold">v3</span> | Last updated: <span className="ml-1 font-semibold">18/12/2025</span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Photos;


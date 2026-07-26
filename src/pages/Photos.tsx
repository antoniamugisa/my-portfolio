import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo, memo } from 'react';
import { X, Compass } from 'lucide-react';
import { photos } from '@/data/photos';
import type { Photo } from '@/data/photos/types';

/** Grid cells per mega-tile (5×5). */
const TILE_MACRO = 5;
const GAP_PX = 12;

/** We render a 3×3 grid of mega-tiles around the camera for seamless infinite scroll. */
const RENDER_TILES = 3;

/** Pixel size of one cell given tile width. */
function cellPx(tileW: number): number {
  const contentW = tileW - GAP_PX;
  return (contentW - (TILE_MACRO - 1) * GAP_PX) / TILE_MACRO;
}

/** One mega-tile of photos (TILE_MACRO × TILE_MACRO grid). */
const MegaTile = memo(function MegaTile({
  tileW,
  offsetX,
  offsetY,
  photosList,
  onPhotoClick,
  isCenter,
  tx,
  ty,
}: {
  tileW: number;
  offsetX: number;
  offsetY: number;
  photosList: Photo[];
  onPhotoClick: (id: string) => void;
  isCenter: boolean;
  tx: number;
  ty: number;
}) {
  const total = TILE_MACRO * TILE_MACRO;
  const centerIdx = Math.floor(total / 2);
  const cell = cellPx(tileW);

  const cells: JSX.Element[] = [];
  const numPhotos = photosList.length;
  const tileOffset = ((tx * 7 + ty * 13) % numPhotos + numPhotos) % numPhotos;
  for (let i = 0; i < total; i++) {
    if (isCenter && i === centerIdx) {
      cells.push(<div key="center-hole" className="aspect-square rounded-lg bg-muted/30" aria-hidden />);
      continue;
    }
    const photoIdx = (tileOffset + i) % numPhotos;
    const photo = photosList[photoIdx];
    cells.push(
      <div
        key={`${i}-${photo.id}`}
        className="group relative overflow-hidden rounded-lg cursor-pointer"
        onClick={() => onPhotoClick(photo.id)}
      >
        <div className="aspect-square overflow-hidden bg-background border border-border/40 group-hover:border-primary/50 transition-all duration-300">
          <img
            src={photo.image}
            alt={photo.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            draggable={false}
          />
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end pointer-events-none">
          <div className="p-2 md:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
            <h3 className="text-white font-semibold text-[10px] md:text-xs mb-0.5 line-clamp-2">{photo.title}</h3>
            {photo.location && <p className="text-white/80 text-[9px] md:text-[10px]">{photo.location}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute box-border grid bg-background"
      style={{
        width: tileW,
        height: tileW,
        left: offsetX,
        top: offsetY,
        padding: `0 ${GAP_PX}px ${GAP_PX}px 0`,
        gap: GAP_PX,
        gridTemplateColumns: `repeat(${TILE_MACRO}, minmax(0, 1fr))`,
      }}
    >
      {cells}
      {isCenter && (
        <div
          className="pointer-events-none absolute z-10 flex flex-col items-center justify-center rounded-xl border border-border/60 bg-background p-2 text-center shadow-sm sm:p-3 md:p-4"
          style={{
            width: cell,
            height: cell,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          role="region"
          aria-label="Photos introduction"
        >
          <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold font-heading mb-1 md:mb-2 bg-primary bg-clip-text text-transparent leading-tight">
            Photos
          </h1>
          <p className="text-[10px] sm:text-xs md:text-sm text-foreground/75 leading-snug px-0.5">
            A gallery into my love for film photography.
          </p>
        </div>
      )}
    </div>
  );
});

const Photos = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const selectedPhotoData = selectedPhoto ? photos.find((p) => p.id === selectedPhoto) : null;
  const containerRef = useRef<HTMLDivElement>(null);

  const [tileW, setTileW] = useState(0);
  const [viewportW, setViewportW] = useState(0);
  const [viewportH, setViewportH] = useState(0);
  const [showHint, setShowHint] = useState(true);

  /** Camera position (top-left of viewport in world coords). Start centered on center tile. */
  const [camX, setCamX] = useState(0);
  const [camY, setCamY] = useState(0);
  const initializedRef = useRef(false);

  const panRef = useRef<{ x: number; y: number; camX: number; camY: number; moved: boolean; pointerId: number } | null>(null);
  const skipPhotoOpenRef = useRef(false);

  const dismissHint = useCallback(() => {
    setShowHint(false);
  }, []);

  const openPhoto = useCallback((id: string) => {
    if (skipPhotoOpenRef.current) {
      skipPhotoOpenRef.current = false;
      return;
    }
    setSelectedPhoto(id);
  }, []);

  const cyclePhotos: Photo[] = useMemo(
    () =>
      photos.length === 0
        ? []
        : Array.from({ length: Math.max(photos.length, TILE_MACRO * TILE_MACRO) }, (_, i) => photos[i % photos.length]),
    []
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      setViewportW(cw);
      setViewportH(ch);
      setTileW((prev) => {
        if (prev > 0) return prev;
        if (cw <= 0 || ch <= 0) return prev;
        const minTile = Math.max(cw, ch) + 32;
        const preferred = Math.min(1100, Math.max(480, Math.round(cw - 24)));
        return Math.round(Math.max(480, minTile, preferred));
      });
    };
    measure();
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (tileW <= 0 || viewportW <= 0 || viewportH <= 0 || initializedRef.current) return;
    initializedRef.current = true;
    setCamX(tileW / 2 - viewportW / 2);
    setCamY(tileW / 2 - viewportH / 2);
  }, [tileW, viewportW, viewportH]);

  const animationRef = useRef<number | null>(null);

  const recenter = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const targetX = tileW / 2 - viewportW / 2;
    const targetY = tileW / 2 - viewportH / 2;
    const startX = camX;
    const startY = camY;
    const duration = 400;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCamX(startX + (targetX - startX) * eased);
      setCamY(startY + (targetY - startY) * eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [tileW, viewportW, viewportH, camX, camY]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dismissHint();
      setCamX((x) => x + e.deltaX);
      setCamY((y) => y + e.deltaY);
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [dismissHint]);

  useEffect(() => {
    if (!showHint) return;
    const timer = window.setTimeout(() => setShowHint(false), 4500);
    return () => window.clearTimeout(timer);
  }, [showHint]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    panRef.current = { x: e.clientX, y: e.clientY, camX, camY, moved: false, pointerId: e.pointerId };
  }, [camX, camY]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const pan = panRef.current as { x: number; y: number; camX: number; camY: number; moved: boolean; pointerId: number } | null;
    if (!pan) return;
    const dx = e.clientX - pan.x;
    const dy = e.clientY - pan.y;
    if (!pan.moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      pan.moved = true;
      dismissHint();
      try {
        containerRef.current?.setPointerCapture(pan.pointerId);
      } catch {}
    }
    if (pan.moved) {
      setCamX(pan.camX - dx);
      setCamY(pan.camY - dy);
    }
  }, [dismissHint]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const pan = panRef.current as { x: number; y: number; camX: number; camY: number; moved: boolean; pointerId: number } | null;
    if (!pan) return;
    if (pan.moved) {
      skipPhotoOpenRef.current = true;
      try {
        containerRef.current?.releasePointerCapture(pan.pointerId);
      } catch {}
    }
    panRef.current = null;
  }, []);

  const handlePointerCancel = useCallback(() => {
    const pan = panRef.current;
    if (pan?.moved) {
      try {
        containerRef.current?.releasePointerCapture(pan.pointerId);
      } catch {}
    }
    panRef.current = null;
  }, []);

  useEffect(() => {
    if (!selectedPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      } else if (e.key === 'ArrowLeft') {
        const idx = photos.findIndex((p) => p.id === selectedPhoto);
        setSelectedPhoto(photos[idx > 0 ? idx - 1 : photos.length - 1].id);
      } else if (e.key === 'ArrowRight') {
        const idx = photos.findIndex((p) => p.id === selectedPhoto);
        setSelectedPhoto(photos[idx < photos.length - 1 ? idx + 1 : 0].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);

  useEffect(() => {
    document.body.style.overflow = selectedPhoto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedPhoto]);

  const tiles = useMemo(() => {
    if (tileW <= 0 || photos.length === 0) return [];
    const result: { tx: number; ty: number; ox: number; oy: number; isCenter: boolean }[] = [];
    const baseTileX = Math.round(camX / tileW);
    const baseTileY = Math.round(camY / tileW);
    const half = Math.floor(RENDER_TILES / 2);
    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        const tx = baseTileX + dx;
        const ty = baseTileY + dy;
        const ox = tx * tileW - camX;
        const oy = ty * tileW - camY;
        const isCenter = tx === 0 && ty === 0;
        result.push({ tx, ty, ox, oy, isCenter });
      }
    }
    return result;
  }, [camX, camY, tileW, photos.length]);

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-24 md:pt-28 flex flex-col">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl flex-grow flex flex-col items-center justify-center py-20">
          <h1 className="text-4xl font-bold font-heading mb-4 bg-primary bg-clip-text text-transparent text-center">
            Photos
          </h1>
          <p className="text-foreground/70 text-center mb-8">A gallery into my love for film photography.</p>
          <p className="text-center text-foreground/60">
            Photo gallery coming soon — add photos to{' '}
            <code className="text-xs bg-muted px-2 py-1 rounded">src/data/photos/index.ts</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] min-h-0 bg-background flex flex-col overflow-hidden relative">
      <div
        ref={containerRef}
        className="flex-1 min-h-0 w-full overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className="relative w-full h-full overflow-hidden">
          {tiles.map(({ tx, ty, ox, oy, isCenter }) => (
            <MegaTile
              key={`${tx},${ty}`}
              tileW={tileW}
              offsetX={ox}
              offsetY={oy}
              photosList={cyclePhotos}
              onPhotoClick={openPhoto}
              isCenter={isCenter}
              tx={tx}
              ty={ty}
            />
          ))}
        </div>
      </div>

      {showHint && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-24 z-30 flex justify-center px-4 md:bottom-28"
          aria-hidden
        >
          <p className="rounded-full border border-border/50 bg-background/85 px-4 py-2 text-[13px] md:text-sm text-foreground/70 shadow-sm backdrop-blur-sm animate-in fade-in duration-500">
            Drag to explore
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={recenter}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-10 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground shadow-lg backdrop-blur-sm transition hover:bg-primary hover:text-primary-foreground hover:border-primary"
        aria-label="Back to center"
        title="Back to center"
      >
        <Compass className="h-6 w-6" strokeWidth={1.75} />
      </button>

      {selectedPhotoData && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-7xl max-h-[90vh] relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-primary transition-colors z-10 p-2 rounded-full hover:bg-white/10"
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const idx = photos.findIndex((p) => p.id === selectedPhoto);
                    setSelectedPhoto(photos[idx > 0 ? idx - 1 : photos.length - 1].id);
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
                    const idx = photos.findIndex((p) => p.id === selectedPhoto);
                    setSelectedPhoto(photos[idx < photos.length - 1 ? idx + 1 : 0].id);
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

            <div className="max-w-full max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedPhotoData.image}
                alt={selectedPhotoData.title}
                className="max-w-full max-h-[90vh] object-contain"
              />

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">{selectedPhotoData.title}</h3>
                {selectedPhotoData.description && (
                  <p className="text-white/90 mb-2">{selectedPhotoData.description}</p>
                )}
                {selectedPhotoData.location && (
                  <div className="flex flex-wrap gap-4 text-sm text-white/80">
                    <span>📍 {selectedPhotoData.location}</span>
                  </div>
                )}
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

            {photos.length > 1 && (
              <div className="absolute top-4 left-4 text-white/80 text-sm z-10">
                {photos.findIndex((p) => p.id === selectedPhoto) + 1} / {photos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;

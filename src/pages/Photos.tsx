import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo, memo } from 'react';
import { X, Compass } from 'lucide-react';
import { photos } from '@/data/photos';
import type { Photo } from '@/data/photos/types';

/** Macro grid per tile: denser grid = smaller thumbnails (same tile size everywhere for seamless wrap). */
const TILE_MACRO = 5;
/** Same as grid dimension; old name kept so any stale `TILE_COLS` reference does not throw. */
const TILE_COLS = TILE_MACRO;
const GAP_PX = 20;
const TILE_PAD = 32; // matches p-8

/** Cells across the full plane (3 mega-tiles × TILE_MACRO columns each). */
const PLANE_GRID = TILE_MACRO * 3;

/**
 * One mega-tile is square: the seamless plane uses a single grid with outer padding only,
 * so cell size is derived from 3×tileW; height must match width for square cells.
 */
function computeTileHeight(tileW: number): number {
  return tileW;
}

/** Pixel size of one macro cell (matches CSS grid math for the 15×15 plane). */
function centerCellPx(tileW: number): number {
  const contentW = 3 * tileW - 2 * TILE_PAD;
  return (contentW - 14 * GAP_PX) / 15;
}

/** Global flat index of the single center cell (row 7, col 7 in 15×15). */
const CENTER_CELL_INDEX = 7 * PLANE_GRID + 7;

function PhotoCell({
  photo,
  onPhotoClick,
}: {
  photo: Photo;
  onPhotoClick: (id: string) => void;
}) {
  return (
    <div
      className="group relative min-w-0 overflow-hidden rounded-lg cursor-pointer"
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

/**
 * Photos grid + a single intro card at world center. Dimensions are fixed for the session so the
 * layout does not reflow while you pan (no infinite scroll-wrap — that caused jumpy scroll).
 */
const SeamlessPhotoPlane = memo(function SeamlessPhotoPlane({
  tileW,
  photosList,
  onPhotoClick,
}: {
  tileW: number;
  photosList: Photo[];
  onPhotoClick: (id: string) => void;
}) {
  if (photosList.length === 0) return null;
  const total = PLANE_GRID * PLANE_GRID;
  let photoIdx = 0;

  const cells: JSX.Element[] = [];
  for (let i = 0; i < total; i++) {
    if (i === CENTER_CELL_INDEX) {
      cells.push(<div key="center-hole" className="aspect-square min-h-0 rounded-lg bg-muted/30" aria-hidden />);
      continue;
    }
    const photo = photosList[photoIdx % photosList.length];
    photoIdx += 1;
    cells.push(<PhotoCell key={`cell-${i}-${photo.id}`} photo={photo} onPhotoClick={onPhotoClick} />);
  }

  const totalW = tileW * 3;
  const cellPx = centerCellPx(tileW);

  return (
    <div className="relative bg-background" style={{ width: totalW, height: totalW }}>
      <div
        className="box-border grid h-full w-full bg-background"
        style={{
          boxSizing: 'border-box',
          padding: TILE_PAD,
          gap: GAP_PX,
          gridTemplateColumns: `repeat(${PLANE_GRID}, minmax(0, 1fr))`,
        }}
      >
        {cells}
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex flex-col items-center justify-center rounded-xl border border-border/60 bg-background p-2 text-center shadow-sm sm:p-3 md:p-4"
        style={{
          width: cellPx,
          height: cellPx,
          maxWidth: '100%',
          maxHeight: '100%',
          transform: 'translate3d(-50%, -50%, 0)',
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
    </div>
  );
});

const Photos = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const selectedPhotoData = selectedPhoto ? photos.find((p) => p.id === selectedPhoto) : null;
  const scrollRef = useRef<HTMLDivElement>(null);
  /** 0 until measured — avoids centering with a wrong default width then jumping when RO runs. */
  const [tileW, setTileW] = useState(0);
  const initialScrollDoneRef = useRef(false);
  const panRef = useRef<{
    active: boolean;
    x: number;
    y: number;
    sl: number;
    st: number;
    moved: boolean;
  } | null>(null);
  const skipPhotoOpenRef = useRef(false);

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
        : Array.from({ length: Math.max(photos.length, TILE_COLS * TILE_COLS) }, (_, i) => photos[i % photos.length]),
    [photos]
  );

  const tileH = computeTileHeight(tileW);

  /**
   * Measure once and keep tile size fixed. Updating tileW on every ResizeObserver tick (scrollbars,
   * devtools, subpixel layout) was resizing the whole grid and looked like photos “rearranging”.
   */
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const updateWidth = () => {
      setTileW((prev) => {
        if (prev > 0) return prev;
        const cw = scrollEl.clientWidth;
        const ch = scrollEl.clientHeight;
        if (cw <= 0 || ch <= 0) return prev;
        const minTile = Math.max(cw, ch) + 32;
        const preferred = Math.min(1100, Math.max(480, Math.round(cw - 24)));
        return Math.round(Math.max(480, minTile, preferred));
      });
    };
    updateWidth();
    const ro = new ResizeObserver(() => requestAnimationFrame(updateWidth));
    ro.observe(scrollEl);
    return () => ro.disconnect();
  }, []);

  /** Center the viewport once after we know tile size — not on every resize (that was causing jumps / “glitching”). */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || tileW <= 0 || photos.length === 0) return;
    if (initialScrollDoneRef.current) return;
    const { clientWidth, clientHeight } = el;
    el.scrollLeft = Math.round(tileW + (tileW - clientWidth) / 2);
    el.scrollTop = Math.round(tileH + (tileH - clientHeight) / 2);
    initialScrollDoneRef.current = true;
  }, [tileW, tileH, photos.length]);

  const recenter = useCallback(() => {
    const el = scrollRef.current;
    if (!el || photos.length === 0 || tileW <= 0) return;
    const { clientWidth, clientHeight } = el;
    el.scrollTo({
      left: Math.round(tileW + (tileW - clientWidth) / 2),
      top: Math.round(tileH + (tileH - clientHeight) / 2),
      behavior: 'smooth',
    });
  }, [tileW, tileH, photos.length]);

  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = photos.findIndex((p) => p.id === selectedPhoto);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
        setSelectedPhoto(photos[prevIndex].id);
      } else if (e.key === 'ArrowRight') {
        const currentIndex = photos.findIndex((p) => p.id === selectedPhoto);
        const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
        setSelectedPhoto(photos[nextIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);

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

  const totalW = tileW * 3;
  const totalH = tileH * 3;

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-background md:ml-56 md:mr-32 pt-24 md:pt-16 flex flex-col">
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
        <footer className="py-4 bg-background border-t border-border/40 mt-auto">
          <div className="container mx-auto px-6 flex justify-center">
            <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/70 bg-background/60">
              Version: <span className="ml-1 mr-1.5 font-semibold">v3</span>| Last updated:{' '}
              <span className="ml-1 font-semibold">01/04/2026</span>
            </span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] min-h-0 bg-background md:ml-56 md:mr-32 flex flex-col overflow-hidden relative">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 w-full overflow-auto overscroll-contain touch-pan-x touch-pan-y cursor-grab active:cursor-grabbing [overflow-anchor:none]"
        onPointerDown={(e) => {
          if (e.button !== 0 || e.pointerType !== 'mouse') return;
          const el = scrollRef.current;
          if (!el) return;
          panRef.current = {
            active: true,
            x: e.clientX,
            y: e.clientY,
            sl: el.scrollLeft,
            st: el.scrollTop,
            moved: false,
          };
          el.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const pan = panRef.current;
          if (!pan?.active) return;
          const el = scrollRef.current;
          if (!el) return;
          const dx = e.clientX - pan.x;
          const dy = e.clientY - pan.y;
          if (Math.abs(dx) > 4 || Math.abs(dy) > 4) pan.moved = true;
          el.scrollLeft = pan.sl - dx;
          el.scrollTop = pan.st - dy;
        }}
        onPointerUp={(e) => {
          const pan = panRef.current;
          if (!pan?.active) return;
          if (pan.moved) skipPhotoOpenRef.current = true;
          panRef.current = null;
          try {
            scrollRef.current?.releasePointerCapture(e.pointerId);
          } catch {
            /* already released */
          }
        }}
        onPointerCancel={(e) => {
          panRef.current = null;
          try {
            scrollRef.current?.releasePointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }}
      >
        <div
          className="relative bg-background"
          style={{
            width: tileW > 0 ? totalW : undefined,
            minHeight: tileW > 0 ? totalH : undefined,
            height: tileW > 0 ? totalH : undefined,
          }}
        >
          {tileW > 0 && (
            <SeamlessPhotoPlane tileW={tileW} photosList={cyclePhotos} onPhotoClick={openPhoto} />
          )}
        </div>
      </div>

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
                    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto);
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
                    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto);
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

      <footer className="py-4 bg-background border-t border-border/40 shrink-0">
        <div className="container mx-auto px-6 flex flex-col items-center gap-2 text-center md:flex-row md:justify-between md:text-left">
          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/70 bg-background/60">
            Version: <span className="ml-1 mr-1.5 font-semibold">v3</span>| Last updated:{' '}
            <span className="ml-1 font-semibold">01/04/2026</span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Photos;

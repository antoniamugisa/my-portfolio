// Photo type definition
export interface Photo {
  id: string;
  title: string;
  description?: string;
  /** Small grid thumbnail — used in the infinite grid */
  thumb: string;
  /** Lazy-load full-size image for lightbox */
  loadFull: () => Promise<string>;
  date: string; // YYYY-MM-DD format
  location?: string;
  tags?: string[];
  aspectRatio?: 'landscape' | 'portrait' | 'square';
}

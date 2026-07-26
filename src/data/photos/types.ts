// Photo type definition
export interface Photo {
  id: string;
  title: string;
  description?: string;
  /** Full-size image for lightbox */
  image: string;
  /** Small grid thumbnail (falls back to image if omitted) */
  thumb?: string;
  date: string; // YYYY-MM-DD format
  location?: string;
  tags?: string[];
  aspectRatio?: 'landscape' | 'portrait' | 'square'; // For better grid layout
}


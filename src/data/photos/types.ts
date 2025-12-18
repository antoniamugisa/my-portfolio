// Photo type definition
export interface Photo {
  id: string;
  title: string;
  description?: string;
  image: string; // Path to image in assets folder
  date: string; // YYYY-MM-DD format
  location?: string;
  tags?: string[];
  aspectRatio?: 'landscape' | 'portrait' | 'square'; // For better grid layout
}


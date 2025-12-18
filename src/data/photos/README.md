# Photos Gallery Management

This directory contains all photo-related data for the portfolio website's photo gallery.

## Structure
```
src/data/photos/
├── index.ts              # Main aggregator file (contains all photos)
├── types.ts              # TypeScript interfaces
└── README.md             # This file

src/assets/photos/        # Store your photo images here
```

## Adding New Photos

### Step 1: Add Your Photo Image

1. Place your photo file in `src/assets/photos/`
2. Use descriptive filenames (e.g., `sunset-mountains-2024.jpg`)
3. Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`

### Step 2: Import and Add Photo Data

Open `src/data/photos/index.ts` and:

1. **Import your photo** at the top:
```typescript
import photo1 from '@/assets/photos/sunset-mountains-2024.jpg';
import photo2 from '@/assets/photos/street-life-toronto.jpg';
```

2. **Add photo entry** to the `photos` array:
```typescript
export const photos: Photo[] = [
  {
    id: 'sunset-mountains-2024',
    title: 'Sunset Over Mountains',
    description: 'A beautiful sunset captured during my trip to the mountains',
    image: photo1, // Use the imported image
    date: '2024-12-20',
    location: 'Halifax, NS',
    tags: ['nature', 'sunset', 'landscape'],
    aspectRatio: 'landscape' // 'landscape', 'portrait', or 'square'
  },
  {
    id: 'street-life-toronto',
    title: 'Street Life',
    description: 'Urban photography in downtown Toronto',
    image: photo2,
    date: '2024-12-18',
    location: 'Toronto, ON',
    tags: ['urban', 'street', 'portrait'],
    aspectRatio: 'portrait'
  },
  // Add more photos...
];
```

### Photo Properties

- **id**: Unique identifier (URL-friendly, lowercase with hyphens)
- **title**: Photo title (required)
- **description**: Optional description
- **image**: Imported image from assets (required)
- **date**: Date in YYYY-MM-DD format (required)
- **location**: Optional location where photo was taken
- **tags**: Optional array of tags for categorization
- **aspectRatio**: Optional - helps with grid layout ('landscape', 'portrait', 'square')

### Step 3: Verify

After adding photos:
1. The gallery will automatically display them
2. Click any photo to open it in the lightbox
3. Use arrow keys or navigation buttons to browse
4. Press ESC to close the lightbox

## Features

- **Responsive Grid**: Automatically adjusts for mobile, tablet, and desktop
- **Lightbox View**: Click any photo to view full-size
- **Keyboard Navigation**: Arrow keys to navigate, ESC to close
- **Lazy Loading**: Photos load as you scroll for better performance
- **Hover Effects**: Beautiful hover overlays with photo information

## Tips

- Keep image file sizes reasonable (under 2MB recommended)
- Use consistent aspect ratios for a cleaner grid
- Add meaningful titles and descriptions
- Use tags to categorize your photos
- Photos are displayed in the order they appear in the array (newest first if you sort by date)


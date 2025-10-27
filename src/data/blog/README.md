# Blog Content Management

This directory contains all blog-related data and content for the portfolio website.

## Structure
```
src/data/blog/
├── index.ts              # Main aggregator file (imports all posts)
├── types.ts              # TypeScript interfaces
├── posts/                # Individual blog post files
│   ├── first-post.ts     # First blog post
│   ├── 2nd-post.ts       # Second blog post (Moloch's Bargain)
│   └── template.ts       # Template for new posts
└── README.md             # This file
```

## Adding New Blog Posts

### Complete Workflow

**Step 1: Create Your Blog Post File**

Create a new file in `posts/` (e.g., `3rd-post.ts`):
```typescript
import { BlogPost } from '../types';

export const thirdPosts: BlogPost[] = [
  {
    id: "my-new-post-slug",
    title: "My New Post Title",
    date: "2025-10-29",
    category: "Technology",
    description: "Brief description for social media previews",
    content: `# Your markdown content here...`,
    image: "https://your-image-url.com/image.jpg",  // 1200x630px recommended
    readTime: 8,
    author: "Antonia Mugisa",
    tags: ["Technology", "AI"]
  }
];
```

**Step 2: Add to Main Aggregator**

Update `index.ts` to import and include your new post:
```typescript
import { BlogPost } from './types';
import { firstPosts } from './posts/first-post';
import { secondPosts } from './posts/2nd-post';
import { thirdPosts } from './posts/3rd-post'; // ← Add this import

// Combine all blog posts
export const blogPosts: BlogPost[] = [
  ...firstPosts,
  ...secondPosts,
  ...thirdPosts  // ← Add this
];
```

**Step 3: Build and Deploy**
```bash
npm run build    # Generates static HTML for LinkedIn/social previews
git add .
git commit -m "Add new blog post: [title]"
git push origin main
```

**Step 4: Verify**

After Netlify deploys (1-3 minutes):
- Visit: `https://antoniamugisa.com/blog/your-post-slug`
- Test LinkedIn preview: https://www.linkedin.com/post-inspector/

That's it! The build script automatically generates static HTML files with proper meta tags for all posts.

## Blog Post Structure

Each blog post must have the following properties:
```typescript
{
  id: string;           // URL-friendly identifier (e.g., "my-awesome-post")
  title: string;        // Display title
  date: string;         // YYYY-MM-DD format
  category: string;     // Post category
  description: string;  // Preview text for cards & social media
  content: string;      // Full blog post content (markdown supported)
  image: string;        // Image URL (1200x630px for best social previews)
  readTime: number;     // Estimated reading time in minutes
  author: string;       // Author name
  tags: string[];       // Array of relevant tags
}
```

## Categories

Current categories (update in `index.ts` as needed):
- All
- AI & Machine Learning
- Development
- Career & Growth
- Technology
- Personal

## Static HTML Generation

When you run `npm run build`, the build script (`scripts/generate-blog-html.js`):

1. **Reads all posts** from `blogPosts` in `index.ts`
2. **Generates static HTML files** at `dist/blog/[post-id]/index.html`
3. **Includes proper meta tags** for:
   - LinkedIn previews (Open Graph)
   - Twitter cards
   - Article metadata (author, date, tags)
   - SEO optimization

This ensures social media platforms can read your post metadata without executing JavaScript.

**You never need to edit the generation script** - just add posts to your data files!

## Best Practices

### Content
1. **Write engaging, valuable content** that provides real insights
2. **Use proper markdown formatting** for readability
3. **Include code examples** when relevant (use triple backticks)
4. **Add images** to break up text and illustrate points
5. **Keep descriptions concise** (150-200 characters) but informative

### Images
1. **Use 1200x630px** for optimal social media previews
2. **Host images externally** or in `/public/images/`
3. **Use full URLs** in the `image` field (e.g., `https://antoniamugisa.com/images/post.jpg`)
4. **Optimize file sizes** for faster loading

### Metadata
1. **Use descriptive IDs**: Make them URL-friendly and unique (lowercase, hyphens)
2. **Write compelling titles**: Clear, specific, and under 60 characters
3. **Choose relevant tags**: Help with search and filtering (2-5 tags per post)
4. **Estimate read time accurately**: ~200 words per minute

### Organization
1. **Group related posts** in the same file (e.g., all AI posts together)
2. **Use consistent naming**: `category-posts.ts` or numbered posts
3. **Keep files manageable**: Split into multiple files if one gets too large

## Content Guidelines

### Markdown Support
- Headers: `# H1`, `## H2`, `### H3`
- Bold: `**bold text**`
- Italic: `*italic text*`
- Links: `[text](url)`
- Code blocks: Triple backticks with language
- Lists: `-` or `1.` for bullets/numbered
- Blockquotes: `>`

### HTML in Content
You can include HTML for advanced formatting:
```typescript
content: `
  <iframe src="..." width="480" height="240"></iframe>
  <a href="https://example.com" style="text-decoration: underline;">Link</a>
`
```

## Testing Your Posts

### Local Testing
```bash
npm run dev
# Visit: http://localhost:5173/blog/your-post-id
```

### Preview Build
```bash
npm run build
npm run preview
# Visit: http://localhost:4173/blog/your-post-id
# View source to check meta tags
```

### LinkedIn Preview Testing
After deploying:
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter: `https://antoniamugisa.com/blog/your-post-id`
3. Click "Clear cache and re-fetch" if needed
4. Verify title, description, and image appear correctly

## Troubleshooting

**LinkedIn shows wrong preview?**
- Check that your post is in `index.ts`
- Verify the build ran successfully
- Clear LinkedIn's cache in Post Inspector
- Wait 5 minutes for Netlify deployment to complete

**Post not appearing?**
- Ensure it's exported and imported in `index.ts`
- Check console for TypeScript errors
- Verify the `id` is unique

**Image not showing?**
- Use absolute URLs (with `https://`)
- Check image dimensions (1200x630px recommended)
- Verify image URL is accessible

## Maintenance

- **Review old posts regularly** and update outdated information
- **Update links and references** to ensure they're still valid
- **Optimize images** for performance as needed
- **Check for broken links** periodically
- **Archive or remove** posts that are no longer relevant

## Quick Reference

**Add new post:**
1. Create `posts/new-post.ts`
2. Add to `index.ts` imports
3. `npm run build && git push`

**Update existing post:**
1. Edit the post file
2. `npm run build && git push`

**Test locally:**
```bash
npm run dev  # Development server
npm run build && npm run preview  # Production preview
```
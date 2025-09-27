# Blog Content Management

This directory contains all blog-related data and content for the portfolio website.

## Structure

```
src/data/blog/
├── index.ts              # Main aggregator file
├── types.ts              # TypeScript interfaces
├── posts/                # Individual blog post files
│   ├── ai-posts.ts       # AI & Machine Learning posts
│   ├── development-posts.ts # Development posts
│   ├── career-posts.ts   # Career & Growth posts
│   └── template.ts       # Template for new posts
└── README.md             # This file
```

## Adding New Blog Posts

### Method 1: Add to Existing Category
1. Open the relevant file in `posts/` (e.g., `ai-posts.ts`)
2. Add your new blog post object to the array
3. Follow the existing format and structure

### Method 2: Create New Category
1. Create a new file in `posts/` (e.g., `new-category-posts.ts`)
2. Copy the structure from an existing file
3. Add your blog posts to the array
4. Update `index.ts` to import and include your new posts
5. Add the new category to `blogCategories` in `index.ts`

### Method 3: Use Template
1. Copy `template.ts` to a new file
2. Follow the instructions in the template
3. Update `index.ts` to include your new posts

## Blog Post Structure

Each blog post should have the following properties:

```typescript
{
  id: string;           // URL-friendly identifier (e.g., "my-awesome-post")
  title: string;        // Display title
  date: string;         // YYYY-MM-DD format
  category: string;     // Must match categories in index.ts
  description: string;  // Preview text for cards
  content: string;      // Full blog post content (markdown supported)
  image: string;        // Image URL for the post
  readTime: number;     // Estimated reading time in minutes
  author: string;       // Author name
  tags: string[];       // Array of relevant tags
}
```

## Categories

Current categories:
- AI & Machine Learning
- Development
- Career & Growth
- Technology
- Personal

## Best Practices

1. **Keep files focused**: Group related posts in the same file
2. **Use descriptive IDs**: Make them URL-friendly and unique
3. **Optimize images**: Use appropriate sizes and formats
4. **Write good descriptions**: These appear in preview cards
5. **Use relevant tags**: Help with search and filtering
6. **Estimate read time**: Help users plan their reading

## Content Guidelines

- Write engaging, valuable content
- Use proper markdown formatting
- Include code examples when relevant
- Add images to break up text
- Keep descriptions concise but informative
- Use tags that help with discoverability

## Maintenance

- Regularly review and update old posts
- Remove outdated information
- Update links and references
- Optimize images for performance
- Check for broken links

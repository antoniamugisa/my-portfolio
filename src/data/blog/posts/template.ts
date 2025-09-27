import { BlogPost } from '../types';

// Template for creating new blog posts
// Copy this template and modify it for your new post

export const templatePosts: BlogPost[] = [
  {
    id: "your-blog-post-id", // URL-friendly identifier
    title: "Your Blog Post Title",
    date: "2024-12-20", // YYYY-MM-DD format
    category: "Your Category", // Must match one of the categories in index.ts
    description: "A brief description of your blog post that will appear in the preview cards.",
    content: `# Your Blog Post Title

Your blog post content goes here. You can use markdown formatting.

## Section Headers

Use ## for section headers.

### Subsections

Use ### for subsections.

**Bold text** and *italic text* are supported.

- Bullet points
- Work great
- For lists

1. Numbered lists
2. Also work
3. Perfectly

\`\`\`javascript
// Code blocks are supported
const example = "Hello World";
console.log(example);
\`\`\`

> Blockquotes are also supported for highlighting important information.

Remember to keep your content engaging and valuable to your readers!`,
    image: "https://images.unsplash.com/photo-[ID]?w=800", // Replace with your image URL
    readTime: 5, // Estimated reading time in minutes
    author: "Antonia Mugisa",
    tags: ["Tag1", "Tag2", "Tag3"] // Add relevant tags
  }
];

// Instructions for adding new blog posts:
// 1. Copy this template file
// 2. Rename it to something descriptive (e.g., "new-topic-posts.ts")
// 3. Update the export name (e.g., "newTopicPosts")
// 4. Fill in your blog post data
// 5. Import and add it to the main index.ts file
// 6. Delete this template file when you're done

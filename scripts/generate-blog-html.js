import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import firstPostImage from '@/assets/firstPost.jpg';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually list your blog posts here
// Update this array whenever you add a new post
const blogPosts = [
  {
    id: 'molochs-bargain-ai-misalignment',
    title: "Moloch's Bargain: When AI Optimization Goes Wrong",
    description: "After reading Stanford's new research on competitive AI optimization, we should be worried.",
    image: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1200&h=630&fit=crop",
    author: "Antonia Mugisa",
    date: "2025-10-18",
    tags: ["AI Safety", "Machine Learning"]
  },
  {
    id: 'first-post',
    title: "Endings Are Just Beginnings",
    description: "Change is exciting",
    image: firstPostImage,
    author: "Antonia Mugisa",
    date: "2025-10-01",
    tags: ["Personal", "Lessons"],

    
  }
  // Add new posts here following the same format
];

function generateBlogHTML(post) {
    // Convert relative image paths to absolute URLs
  const imageUrl = post.image.startsWith('http') 
    ? post.image 
    : `https://antoniamugisa.com${post.image}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Primary Meta Tags -->
  <title>${post.title} | Antonia Mugisa</title>
  <meta name="title" content="${post.title} | Antonia Mugisa" />
  <meta name="description" content="${post.description}" />
  <meta name="author" content="${post.author}" />
  
  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://antoniamugisa.com/blog/${post.id}" />
  <meta property="og:title" content="${post.title}" />
  <meta property="og:description" content="${post.description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Antonia Mugisa" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="https://antoniamugisa.com/blog/${post.id}" />
  <meta name="twitter:title" content="${post.title}" />
  <meta name="twitter:description" content="${post.description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  
  <!-- Article Metadata -->
  <meta property="article:published_time" content="${post.date}" />
  <meta property="article:author" content="${post.author}" />
  ${post.tags ? post.tags.map(tag => `<meta property="article:tag" content="${tag}" />`).join('\n  ') : ''}
  
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
}

// Generate HTML files after Vite build
const distDir = path.join(__dirname, '..', 'dist');

blogPosts.forEach(post => {
  const blogDir = path.join(distDir, 'blog', post.id);
  
  // Create directory
  fs.mkdirSync(blogDir, { recursive: true });
  
  // Write HTML file
  const html = generateBlogHTML(post);
  fs.writeFileSync(path.join(blogDir, 'index.html'), html);
  
  console.log(`✅ Generated: /blog/${post.id}/index.html`);
});

console.log(`\n🎉 Generated ${blogPosts.length} blog page(s)!`);
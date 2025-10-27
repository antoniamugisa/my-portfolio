import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { BlogPost } from '../src/data/blog/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import blog posts from the main data file
import { blogPosts } from '../src/data/blog';

// Ensure the dist directory exists
async function ensureDirExists(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

// Convert image path to URL
function getImageUrl(imagePath:string): string {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Handle paths starting with src/
  if (imagePath.startsWith('src/')) {
    const filename = path.basename(imagePath);
    return `https://antoniamugisa.com/images/${filename}`;
  }
  
  // Handle other relative paths
  return `https://antoniamugisa.com${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}

function generateBlogHTML(post:BlogPost): string {
  const imageUrl = getImageUrl(post.image);
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

// Main function to generate all blog HTML files
async function generateAllBlogHTML(): Promise<void>  {
  try {
    const distDir = path.join(__dirname, '..', 'dist');
    const blogDir = path.join(distDir, 'blog');
    
    // Ensure directories exist
    await ensureDirExists(blogDir);
    
    let successCount = 0;
    
    // Process each blog post
    for (const post of blogPosts) {
      try {
        const postDir = path.join(blogDir, post.id);
        await ensureDirExists(postDir);
        
        const html = generateBlogHTML(post);
        await fs.writeFile(path.join(postDir, 'index.html'), html);
        
        console.log(`✅ Generated: /blog/${post.id}/index.html`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Failed to generate HTML for ${post.id}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully generated ${successCount} of ${blogPosts.length} blog pages!`);
    
    if (successCount < blogPosts.length) {
      console.warn(`⚠️  ${blogPosts.length - successCount} blog posts failed to generate.`);
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Error generating blog HTML:', error.message);
    process.exit(1);
  }
}

// Run the generator
generateAllBlogHTML();
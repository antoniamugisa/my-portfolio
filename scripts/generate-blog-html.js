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
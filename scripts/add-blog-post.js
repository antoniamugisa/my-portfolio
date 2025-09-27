#!/usr/bin/env node

/**
 * Simple script to help add new blog posts
 * Usage: node scripts/add-blog-post.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function addBlogPost() {
  console.log('📝 Blog Post Creator\n');
  
  try {
    const title = await question('Blog post title: ');
    const category = await question('Category (AI & Machine Learning/Development/Career & Growth/Technology/Personal): ');
    const description = await question('Description (preview text): ');
    const tags = await question('Tags (comma-separated): ');
    const readTime = await question('Estimated read time (minutes): ');
    const imageUrl = await question('Image URL: ');
    
    // Generate ID from title
    const id = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    const date = new Date().toISOString().split('T')[0];
    
    const blogPost = {
      id,
      title,
      date,
      category,
      description,
      content: `# ${title}\n\nYour blog post content goes here...`,
      image: imageUrl,
      readTime: parseInt(readTime),
      author: "Antonia Mugisa",
      tags: tags.split(',').map(tag => tag.trim())
    };
    
    console.log('\n📋 Generated Blog Post:');
    console.log(JSON.stringify(blogPost, null, 2));
    
    const confirm = await question('\nAdd this post? (y/n): ');
    
    if (confirm.toLowerCase() === 'y') {
      // Determine which file to add to based on category
      let fileName = 'development-posts.ts';
      if (category.includes('AI')) fileName = 'ai-posts.ts';
      else if (category.includes('Career')) fileName = 'career-posts.ts';
      
      const filePath = path.join(__dirname, '..', 'src', 'data', 'blog', 'posts', fileName);
      
      console.log(`\n✅ Blog post template created!`);
      console.log(`📁 Add it to: src/data/blog/posts/${fileName}`);
      console.log(`🔗 Post ID: ${id}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

addBlogPost();

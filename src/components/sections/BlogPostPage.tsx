// src/components/sections/BlogPostPage.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Helmet } from 'react-helmet-async';
import { BlogPost } from '../../data/blog/types';

interface BlogPostPageProps {
  post: BlogPost;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post }) => {
  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{post.title} | Antonia Mugisa</title>
        <meta name="title" content={`${post.title} | Antonia Mugisa`} />
        <meta name="description" content={post.description} />
        <meta name="author" content={post.author} />

        {/* Open Graph / Facebook / LinkedIn */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://antoniamugisa.com/blog/${post.id}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:image" content={`https://antoniamugisa.com${post.image}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Antonia Mugisa" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://antoniamugisa.com/blog/${post.id}`} />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={`https://antoniamugisa.com${post.image}`} />

        {/* Article Metadata */}
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        {post.tags?.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
      </Helmet>

      <article className="prose prose-lg max-w-none">
        <h1>{post.title}</h1>
        <p className="text-gray-500">{post.date}</p>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </article>
    </>
  );
};

export default BlogPostPage;

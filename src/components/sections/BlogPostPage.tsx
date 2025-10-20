// src/components/sections/BlogPostPage.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BlogPost } from '../../data/blog/types';
import { useParams } from 'react-router-dom';

interface BlogPostPageProps {
  post: BlogPost;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post }) => {
  return (
    <article className="prose prose-lg max-w-none">
      <h1>{post.title}</h1>
      <p className="text-gray-500">{post.date}</p>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {post.content}
      </ReactMarkdown>
    </article>
  );
};

export default BlogPostPage;

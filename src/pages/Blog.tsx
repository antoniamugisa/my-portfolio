import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '@/data/blog';

const Blog = () => {

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28 flex flex-col">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6 flex-grow">
        <section className="py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {blogPosts.map((post, index) => (
              <div key={post.id} className="py-px">
                <Link to={`/blog/${post.id}`}>
                  <div
                    className="group relative h-64 md:h-72 rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Dark overlay for better text readability */}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-between pb-5 md:pb-6">
                      {/* Top Right - Tags */}
                      <div className="flex justify-end">
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/30"
                            >
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/30">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Left - Date, Title, Subtitle */}
                      <div className="space-y-2.5 pb-3">
                        <div className="text-white/90 text-[15px] md:text-base font-normal">
                          {formatDate(post.date)}
                        </div>

                        <h3
                          className="text-[15px] md:text-base font-normal text-white leading-[1.5]"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxHeight: 'calc(1.5em * 2 + 0.25em)',
                            marginBottom: '6px',
                            paddingBottom: '2px',
                          }}
                        >
                          {post.title}
                        </h3>

                        <p
                          className="text-white/90 text-[15px] md:text-base font-normal leading-[1.6] line-clamp-3 md:line-clamp-2 pb-1"
                          dangerouslySetInnerHTML={{ __html: post.description }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="h-32 md:h-16"></div>
        </section>
      </div>
    </div>
  );
};

export default Blog;
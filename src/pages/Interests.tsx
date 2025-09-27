import React from 'react';
import { interestsData, type MediaItem } from '@/data/interests';

const Interests = () => {
  const allItems = interestsData.flatMap(category => category.items);

  const getTypeHighlight = (type: MediaItem['type']) => {
    switch (type) {
      case 'book':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'film':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'tv':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'anime':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'game':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'music':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
        <div className="min-h-screen bg-background pt-4 md:pt-24 pb-24 md:pb-0">
      {/* Main Layout */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-4 md:gap-8">
          {/* Left Side - Title Section */}
          <div className="lg:col-span-3 py-4 md:py-16">
            <div className="sticky top-16 md:top-32 pb-4 md:pb-16">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-heading mb-4 md:mb-6 bg-primary bg-clip-text text-transparent leading-[1.2] pb-2">
                media worth your time
              </h1>
              <p className="text-lg text-foreground/70 leading-relaxed">
                what i'm watching and reading right now
              </p>
            </div>
          </div>

          {/* Right Side - Content Section */}
          <div className="lg:col-span-9">
            {/* Content Section */}
            <section className="py-4 md:py-16">
              <ul className="space-y-2 md:space-y-3">
                {allItems.map((item) => (
                  <li key={item.id} className="py-3 md:py-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                      <div className="flex-1">
                        <span className={`font-medium px-2 py-1 rounded text-sm ${getTypeHighlight(item.type)}`}>
                          {item.title}
                          {item.author && ` – ${item.author}`}
                        </span>
                      </div>
                      <span className="text-sm italic text-foreground md:text-right">
                        – {item.description}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border pb-24 md:pb-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-foreground/70 text-sm">
            © 2025 Antonia Mugisa. Built with React, TypeScript & Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Interests;

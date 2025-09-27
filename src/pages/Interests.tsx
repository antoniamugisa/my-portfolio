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
      case 'essay':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'anime':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'game':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Main Layout */}
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Side - Title Section */}
          <div className="lg:col-span-3 py-16">
            <div className="sticky top-32 pb-16">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-heading mb-6 bg-gradient-primary bg-clip-text text-transparent leading-[1.2] pb-2">
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
            <section className="py-16">
              <ul className="space-y-3">
                {allItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`font-medium px-2 py-1 rounded text-sm ${getTypeHighlight(item.type)}`}>
                          {item.title}
                          {item.author && ` – ${item.author}`}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm italic text-foreground">
                      – {item.description}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interests;

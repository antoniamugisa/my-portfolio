import React from 'react';
import { interestsData, type MediaItem } from '@/data/interests';

const Interests = () => {
  const allItems = interestsData.flatMap((category) => category.items);

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
    <div className="min-h-screen bg-background pt-24 md:pt-28 flex flex-col">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6 flex-grow">
        <section className="py-8 md:py-12">
          <ul className="space-y-2 md:space-y-3">
            {allItems.map((item) => (
              <li key={item.id} className="py-3 md:py-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                  <div className="flex-1">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-medium px-2 py-1 rounded text-sm ${getTypeHighlight(item.type)} hover:brightness-75 transition-all cursor-pointer`}
                      >
                        {item.title}
                        {item.author && ` – ${item.author}`}
                      </a>
                    ) : (
                      <span
                        className={`font-medium px-2 py-1 rounded text-sm ${getTypeHighlight(item.type)}`}
                      >
                        {item.title}
                        {item.author && ` – ${item.author}`}
                      </span>
                    )}
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
  );
};

export default Interests;

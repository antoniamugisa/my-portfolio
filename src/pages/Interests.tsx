import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { interestsData, type MediaItem } from '@/data/interests';

const Interests = () => {
  const allItems = interestsData.flatMap(category => category.items);
  const location = useLocation();

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

  const navItems = [
    { name: 'about', path: '/#about' },
    { name: 'experience', path: '/#experience' },
    { name: 'projects', path: '/#projects' },
    { name: 'blog', path: '/blog' },
    { name: 'interests', path: '/interests' },
    { name: 'contact', path: '/#contact' }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-background border-r border-border/50 p-8 pt-24 fixed left-0 top-0 h-full overflow-y-auto">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`block py-2 text-sm font-medium transition-colors ${
                location.pathname === item.path || 
                (item.path === '/#about' && location.pathname === '/')
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            content worth consuming
          </h1>
        </div>

        {/* Simple List */}
        <div className="max-w-4xl">
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
        </div>
      </div>
    </div>
  );
};

export default Interests;

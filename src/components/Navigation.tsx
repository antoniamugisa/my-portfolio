import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, FolderOpen, BookOpen, Heart, Camera } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Experiences', shortName: 'Experiences', path: '/experience', icon: Briefcase },
    { name: 'Projects', shortName: 'Projects', path: '/projects', icon: FolderOpen },
    { name: 'Writings', shortName: 'Writings', path: '/blog', icon: BookOpen },
    { name: 'Recs', shortName: 'Recs', path: '/interests', icon: Heart },
    { name: 'Photos', shortName: 'Photos', path: '/photos', icon: Camera },
  ];

  const isAboutActive = location.pathname === '/';
  const isItemActive = (path: string) => location.pathname.startsWith(path);

  const linkClass = (active: boolean) =>
    `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? 'bg-foreground text-background'
        : 'text-foreground/70 hover:text-foreground hover:bg-muted/60'
    }`;

  const iconClass = (active: boolean) =>
    `flex items-center justify-center rounded-full p-2 transition-colors ${
      active
        ? 'bg-foreground text-background'
        : 'text-foreground/70 hover:text-foreground hover:bg-muted/60'
    }`;

  return (
    <>
      {/* Desktop centered pill navigation */}
      <nav className="hidden md:flex fixed top-8 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2 py-1.5 shadow-sm backdrop-blur-md">
          <Link
            to="/"
            className={`${linkClass(isAboutActive)} font-bold tracking-tight`}
            aria-label="About"
          >
            AM
          </Link>

          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={linkClass(isItemActive(item.path))}
            >
              {item.shortName}
            </Link>
          ))}

          <div className="ml-1 flex items-center border-l border-border/50 pl-1">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Mobile centered pill navigation */}
      <nav className="md:hidden fixed top-5 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 pt-safe">
        <div className="flex items-center justify-between gap-0.5 rounded-full border border-border/60 bg-background/80 px-1.5 py-1.5 shadow-sm backdrop-blur-md">
          <Link
            to="/"
            className={`${linkClass(isAboutActive)} px-2.5 py-1.5 text-xs font-bold tracking-tight`}
            aria-label="About"
          >
            AM
          </Link>

          {navItems.map((item) => {
            const IconComponent = item.icon;
            const active = isItemActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={iconClass(active)}
                aria-label={item.name}
              >
                <IconComponent size={16} strokeWidth={1.75} />
              </Link>
            );
          })}

          <div className="flex items-center border-l border-border/50 pl-0.5">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;

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

      {/* Mobile top navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-lg pt-safe">
        <div className="flex items-center justify-center px-2 py-3">
          <div className="flex items-center justify-center space-x-3">
            <Link
              to="/"
              className={`flex flex-col items-center justify-center p-1 transition-all duration-200 ${
                isAboutActive ? 'text-primary' : 'text-foreground/70'
              }`}
              aria-label="About"
            >
              <div
                className={`px-2 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-200 ${
                  isAboutActive ? 'bg-primary/10' : 'hover:bg-muted/50'
                }`}
              >
                AM
              </div>
            </Link>

            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = isItemActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center p-1 transition-all duration-200 ${
                    active ? 'text-primary' : 'text-foreground/70'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-full transition-all duration-200 ${
                      active ? 'bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                  >
                    <IconComponent size={16} />
                  </div>
                </Link>
              );
            })}
            <div className="flex flex-col items-center justify-center p-1">
              <div className="p-1.5 rounded-full hover:bg-muted/50 transition-all duration-200">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;

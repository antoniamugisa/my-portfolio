import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Briefcase, FolderOpen, BookOpen, Heart, Camera } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['home', 'about', 'experience', 'projects', 'blog', 'contact'];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash navigation when component mounts or location changes
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const sectionId = location.hash.substring(1); // Remove the # symbol
      const element = document.getElementById(sectionId);
      if (element) {
        // Scroll directly to section without going to top first
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  }, [location]);

  const navItems = [
    { name: 'About', id: 'home', path: '/', icon: User },
    { name: 'Experiences', id: 'experience', path: '/', icon: Briefcase },
    { name: 'Projects', id: 'projects', path: '/projects', icon: FolderOpen },
    { name: 'Thoughts', id: 'blog', path: '/blog', icon: BookOpen },
    { name: 'Media Worth Your Time', id: 'interests', path: '/interests', icon: Heart },
    { name: 'Photos', id: 'photos', path: '/photos', icon: Camera }
  ];

  const handleNavigation = (item: typeof navItems[0]) => {
    setIsMobileMenuOpen(false);
    
    if (item.path === '/blog' || item.path === '/interests' || item.path === '/projects' || item.path === '/photos') {
      // Handle blog, interests, projects, and photos navigation - scroll to top first
      window.scrollTo(0, 0);
      return;
    } else if (item.path === '/' && location.pathname !== '/') {
      // If we're not on home page, navigate to home with hash
      // Don't scroll to top - let the hash navigation handle scrolling directly to section
      navigate(`/#${item.id}`, { replace: false });
    } else {
      // We're on home page, scroll directly to section
      const element = document.getElementById(item.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <>
      {/* Desktop Left Sidebar Navigation */}
      <nav className="hidden md:block fixed left-0 top-0 bottom-0 z-40 w-48 bg-background border-r border-border/40 ml-8">
        <div className="flex flex-col h-full px-6 py-12">
          {/* Logo */}
          <Link 
            to="/"
            className="text-2xl font-bold bg-primary bg-clip-text text-transparent mb-12"
          >
            AM
          </Link>

          {/* Navigation Items */}
          <div className="flex flex-col space-y-6">
            {navItems.map((item) => {
              const isActive = (item.path === '/blog' || item.path === '/interests' || item.path === '/projects' || item.path === '/photos') 
                ? location.pathname.startsWith(item.path)
                : activeSection === item.id && location.pathname === '/';
              
              return (item.path === '/blog' || item.path === '/interests' || item.path === '/projects' || item.path === '/photos') ? (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => window.scrollTo(0, 0)}
                  className={`transition-colors hover:text-primary ${
                    isActive ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {item.name === 'Media Worth Your Time' ? (
                    <span className="text-sm font-medium leading-relaxed block">
                      <span className="block">Media Worth</span>
                      <span className="block">Your Time</span>
                    </span>
                  ) : (
                    <span className="text-sm font-medium leading-relaxed">{item.name}</span>
                  )}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`transition-colors hover:text-primary text-left ${
                    isActive ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {item.name === 'Media Worth Your Time' ? (
                    <span className="text-sm font-medium leading-relaxed block">
                      <span className="block">Media Worth</span>
                      <span className="block">Your Time</span>
                    </span>
                  ) : (
                    <span className="text-sm font-medium leading-relaxed">{item.name}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop Theme Toggle - Right Sidebar */}
      <div className="hidden md:block fixed right-0 top-0 bottom-0 z-40 w-24 bg-background border-l border-border/40 mr-8">
        <div className="flex flex-col h-full items-end justify-start px-4 py-12">
          <div className="mt-6">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Mobile Top Navigation - Always Visible */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-lg pt-safe">
        <div className="flex items-center justify-center px-2 py-3">
          <div className="flex items-center justify-center space-x-3">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = (item.path === '/blog' || item.path === '/interests' || item.path === '/projects' || item.path === '/photos') 
                ? location.pathname.startsWith(item.path)
                : activeSection === item.id && location.pathname === '/';
              
              return (item.path === '/blog' || item.path === '/interests' || item.path === '/projects' || item.path === '/photos') ? (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => window.scrollTo(0, 0)}
                  className={`flex flex-col items-center justify-center p-1 transition-all duration-200 ${
                    isActive ? 'text-primary' : 'text-foreground/70'
                  }`}
                >
                  <div className={`p-1.5 rounded-full transition-all duration-200 ${
                    isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
                  }`}>
                    <IconComponent size={16} />
                  </div>
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`flex flex-col items-center justify-center p-1 transition-all duration-200 ${
                    isActive ? 'text-primary' : 'text-foreground/70'
                  }`}
                >
                  <div className={`p-1.5 rounded-full transition-all duration-200 ${
                    isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
                  }`}>
                    <IconComponent size={16} />
                  </div>
                </button>
              );
            })}
            {/* Theme Toggle in Mobile Top Nav */}
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
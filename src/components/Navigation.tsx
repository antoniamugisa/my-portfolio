import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, User, Briefcase, FolderOpen, BookOpen, Phone, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      const sections = ['home', 'about', 'experience', 'projects', 'contact'];
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
        // Small delay to ensure the page is fully loaded
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const navItems = [
    { name: 'Home', id: 'home', path: '/', icon: Home },
    { name: 'About', id: 'about', path: '/', icon: User },
    { name: 'Experience', id: 'experience', path: '/', icon: Briefcase },
    { name: 'Projects', id: 'projects', path: '/', icon: FolderOpen },
    { name: 'Blog', id: 'blog', path: '/blog', icon: BookOpen },
    { name: 'Interests', id: 'interests', path: '/interests', icon: Heart },
    { name: 'Contact', id: 'contact', path: '/', icon: Phone }
  ];

  const handleNavigation = (item: typeof navItems[0]) => {
    setIsMobileMenuOpen(false);
    
    if (item.path === '/blog' || item.path === '/interests') {
      // Handle blog and interests navigation - let React Router handle it
      return;
    } else if (item.path === '/' && location.pathname !== '/') {
      // If we're not on home page, navigate to home first with hash
      navigate(`/#${item.id}`);
    } else {
      // We're on home page, scroll to section
      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`hidden md:block fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/"
              className="text-2xl font-bold bg-primary bg-clip-text text-transparent"
            >
              AM
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-8">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (item.path === '/blog' || item.path === '/interests') ? (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`relative p-2 transition-colors hover:text-primary ${
                      location.pathname.startsWith(item.path) ? 'text-primary' : 'text-foreground'
                    }`}
                    title={item.name}
                  >
                    <IconComponent size={20} />
                    {location.pathname.startsWith(item.path) && (
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    className={`relative p-2 transition-colors hover:text-primary ${
                      activeSection === item.id && location.pathname === '/' ? 'text-primary' : 'text-foreground'
                    }`}
                    title={item.name}
                  >
                    <IconComponent size={20} />
                    {activeSection === item.id && location.pathname === '/' && (
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
              {/* Theme Toggle Button */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg pb-safe">
        <div className="flex items-center justify-between px-4 py-3">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = (item.path === '/blog' || item.path === '/interests') 
              ? location.pathname.startsWith(item.path)
              : activeSection === item.id && location.pathname === '/';
            
            return (item.path === '/blog' || item.path === '/interests') ? (
              <Link
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center justify-center p-1 transition-all duration-200 ${
                  isActive ? 'text-primary' : 'text-foreground/70'
                }`}
              >
                <div className={`p-2 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
                }`}>
                  <IconComponent size={18} />
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
                <div className={`p-2 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
                }`}>
                  <IconComponent size={18} />
                </div>
              </button>
            );
          })}
          {/* Theme Toggle in Mobile Bottom Nav */}
          <div className="flex flex-col items-center justify-center p-1">
            <div className="p-2 rounded-full hover:bg-muted/50 transition-all duration-200">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
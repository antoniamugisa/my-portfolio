import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, User, Briefcase, FolderOpen, BookOpen, Phone, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();

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
      // If we're not on home page, navigate to home first
      window.location.href = `/#${item.id}`;
    } else {
      // We're on home page, scroll to section
      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/"
            className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent"
          >
            AM
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (item.path === '/blog' || item.path === '/interests') ? (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`relative p-2 transition-colors hover:text-primary ${
                    location.pathname.startsWith(item.path) ? 'text-primary' : 'text-black'
                  }`}
                  title={item.name}
                >
                  <IconComponent size={20} />
                  {location.pathname.startsWith(item.path) && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-primary rounded-full" />
                  )}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`relative p-2 transition-colors hover:text-primary ${
                    activeSection === item.id && location.pathname === '/' ? 'text-primary' : 'text-black'
                  }`}
                  title={item.name}
                >
                  <IconComponent size={20} />
                  {activeSection === item.id && location.pathname === '/' && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (item.path === '/blog' || item.path === '/interests') ? (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center space-x-3 text-sm font-medium transition-colors hover:text-primary text-left ${
                      location.pathname.startsWith(item.path) ? 'text-primary' : 'text-black'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent size={18} />
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    className={`flex items-center space-x-3 text-sm font-medium transition-colors hover:text-primary text-left ${
                      activeSection === item.id && location.pathname === '/' ? 'text-primary' : 'text-black'
                    }`}
                  >
                    <IconComponent size={18} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
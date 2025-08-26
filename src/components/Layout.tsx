import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Rows, Sprout, Home, Menu, X } from 'lucide-react';
import { AuthButton } from './AuthButton';
import { applySeasonalTheme } from '../utils/seasonTheme';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Plots', href: '/plots', icon: MapPin },
    { name: 'Rows', href: '/rows', icon: Rows },
  ];
  
  useEffect(() => {
    // Apply seasonal theme when component mounts
    applySeasonalTheme();
    
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className={`bg-white shadow-sm ${isMobile ? 'sticky top-0 z-10' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Sprout className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Farm Manager</span>
              </div>
              
              {/* Desktop Navigation */}
              {!isMobile && (
                <nav className="ml-6 flex space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        location.pathname === item.href
                          ? 'border-green-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
            
            <div className="flex items-center">
              {/* Mobile menu button */}
              {isMobile && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              )}
              
              {/* Always show auth button on desktop, hide on mobile when menu is closed */}
              {(!isMobile || isMobileMenuOpen) && (
                <div className={isMobile ? 'hidden' : ''}>
                  <AuthButton />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation Menu */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-16">
          <div className="p-4">
            <nav className="space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center p-3 rounded-lg ${
                    location.pathname === item.href
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  <span className="text-lg font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
      
      <main className={isMobile ? 'pb-20' : ''}>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
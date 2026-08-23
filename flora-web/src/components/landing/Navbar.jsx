import floraLogo from '../../assets/flora-logo.png';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '../Button';

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brand-border transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Branding */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src={floraLogo} alt="Flora" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-brand-text leading-none text-base tracking-tight">Flora</span>
            <span className="text-[9px] text-accent font-bold tracking-widest uppercase mt-0.5">INTELLIGENCE</span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-brand-secondary">
          <button onClick={() => scrollToSection('platform')} className="hover:text-primary transition-colors">
            Platform
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-primary transition-colors">
            How It Works
          </button>
          <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">
            Features
          </button>
          <Link to="/about" className="hover:text-primary transition-colors">
            About
          </Link>
        </nav>

        {/* Right: Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-xs font-semibold text-brand-secondary hover:text-brand-text px-3 py-2 transition-colors">
            Sign In
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" icon={ArrowRight}>
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded text-brand-muted hover:text-brand-text"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-brand-border px-6 py-4 space-y-3 animate-fade-in-up text-left">
          <button
            onClick={() => scrollToSection('platform')}
            className="block text-sm font-semibold text-brand-secondary py-1 w-full text-left"
          >
            Platform
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="block text-sm font-semibold text-brand-secondary py-1 w-full text-left"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="block text-sm font-semibold text-brand-secondary py-1 w-full text-left"
          >
            Features
          </button>
          <Link
            to="/about"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-semibold text-brand-secondary py-1"
          >
            About
          </Link>

          <div className="pt-3 border-t border-brand-border flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full">
              <Button variant="outline" size="md" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full">
              <Button variant="primary" size="md" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

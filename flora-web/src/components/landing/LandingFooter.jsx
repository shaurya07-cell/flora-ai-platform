import floraLogo from '../../assets/flora-logo.png';
import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter = () => {
  return (
    <footer className="bg-surface border-t border-brand-border py-12 text-left text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Col 1: Logo & Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img src={floraLogo} alt="Flora" className="h-9 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="font-extrabold text-brand-text leading-none text-base tracking-tight">Flora</span>
                <span className="text-[9px] text-accent font-bold tracking-widest uppercase mt-0.5">INTELLIGENCE</span>
              </div>
            </div>
            <p className="text-brand-muted text-xs leading-relaxed max-w-sm">
              FLORA transforms unstructured catalog documents into structured, validated product intelligence using automated OCR, AI field extraction, and compliance rules.
            </p>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-2">
            <h4 className="font-bold text-brand-text uppercase text-[10px] tracking-wider">Product</h4>
            <ul className="space-y-1.5 text-brand-muted">
              <li><a href="#platform" className="hover:text-brand-text transition-colors">Platform</a></li>
              <li><a href="#features" className="hover:text-brand-text transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-brand-text transition-colors">How It Works</a></li>
            </ul>
          </div>

          {/* Col 3: Company & Legal */}
          <div className="space-y-2">
            <h4 className="font-bold text-brand-text uppercase text-[10px] tracking-wider">Company & Legal</h4>
            <ul className="space-y-1.5 text-brand-muted">
              <li><Link to="/about" className="hover:text-brand-text transition-colors">About FLORA</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-text transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-text transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Col 4: Account */}
          <div className="space-y-2">
            <h4 className="font-bold text-brand-text uppercase text-[10px] tracking-wider">Account</h4>
            <ul className="space-y-1.5 text-brand-muted">
              <li><Link to="/login" className="hover:text-brand-text transition-colors">Customer Login</Link></li>
              <li><Link to="/register" className="hover:text-brand-text transition-colors">Create Account</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between text-brand-muted text-[11px]">
          <span>© 2026 FLORA AI Platform. All rights reserved.</span>
          <span className="font-mono">FLORA Platform v1.0.0</span>
        </div>

      </div>
    </footer>
  );
};

export default LandingFooter;

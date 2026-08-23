import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../Button';

export const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-b border-brand-border text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-slate-200">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>Transform Product Catalog Data Today</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
          Ready to turn product documents into intelligence?
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Join enterprises automating catalog ingestion, multi-tier validation, and structured product record persistence with FLORA.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/register">
            <Button variant="primary" size="lg" icon={ArrowRight}>
              Get Started Free
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white">
              Sign In To Platform
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

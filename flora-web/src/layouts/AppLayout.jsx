import floraLogo from '../assets/flora-logo.png';
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FileText,
  UploadCloud,
  CheckSquare,
  BarChart3,
  Activity,
  Settings,
  Menu,
  X,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Upload', path: '/upload', icon: UploadCloud },
    { name: 'Validation', path: '/validation', icon: CheckSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Activity', path: '/activity', icon: Activity },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Helper to match active nav links
  const isActiveLink = (path) => location.pathname === path;

  // Render breadcrumbs based on pathname
  const renderBreadcrumb = () => {
    const segment = location.pathname.split('/').filter(Boolean)[0] || 'dashboard';
    const titles = {
      dashboard: 'Dashboard',
      products: 'Products',
      documents: 'Documents',
      upload: 'Upload Catalog',
      validation: 'Validation Queue',
      analytics: 'Analytics',
      activity: 'System Activity',
      settings: 'Settings',
      admin: 'Administration'
    };
    return titles[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Mobile Top Navbar */}
      <header className="lg:hidden h-14 bg-surface border-b border-brand-border flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
          <img
            src={floraLogo}
            alt="Flora"
            className="h-12 w-auto object-contain"
          />

          <span className="font-bold text-brand-text text-xl">
            Flora Intelligence
          </span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1.5 rounded-sm hover:bg-slate-100 text-brand-muted hover:text-brand-text focus:outline-none"
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      <div className="flex-1 flex relative">
        {/* Desktop Sidebar / Mobile Drawer Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-brand-border flex flex-col justify-between
            transform lg:transform-none lg:static lg:z-auto transition-transform duration-200 ease-in-out
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isMobileOpen ? 'top-14' : 'top-0'} lg:top-0
          `}
        >
          {/* Brand Header (Desktop only) */}
          <div className="hidden lg:flex h-16 items-center px-6 border-b border-brand-border gap-3">
            <img
              src={floraLogo}
              alt="Flora"
              className="h-12 w-auto object-contain"
            />

            <div className="flex flex-col">
              <span className="font-bold text-brand-text leading-none tracking-tight">
                Flora
              </span>
              <span className="text-[10px] text-accent font-semibold tracking-wider uppercase mt-0.5">
                Intelligence
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center px-3 py-2.5 text-sm font-medium rounded transition-colors
                    ${isActive
                      ? 'bg-primary-soft text-primary font-semibold'
                      : 'text-brand-muted hover:text-brand-text hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActiveLink(item.path) ? 'text-primary' : 'text-brand-muted'}`} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer Info */}
          <div className="p-4 border-t border-brand-border text-center">
            <p className="text-[11px] text-brand-muted font-medium">Flora Platform v1.0.0</p>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {isMobileOpen && (
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/30 z-30 lg:hidden"
            style={{ top: '3.5rem' }}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Navbar (Desktop only) */}
          <header className="hidden lg:flex h-16 bg-surface border-b border-brand-border items-center justify-between px-8 z-10">
            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-sm text-brand-muted">
              <span>Platform</span>
              <span>/</span>
              <span className="font-semibold text-brand-text">{renderBreadcrumb()}</span>
            </div>

            {/* Clean Operational Indicator, Theme Switcher & User Session */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-status-success border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                System Operational
              </span>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg border border-brand-border bg-surface text-brand-muted hover:text-brand-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? <Moon className="h-4 w-4 text-slate-700" /> : <Sun className="h-4 w-4 text-amber-400" />}
              </button>

              {user && (
                <div className="flex items-center gap-3 pl-3 border-l border-brand-border text-xs">
                  <div className="flex flex-col text-right">
                    <span className="font-bold text-brand-text leading-tight">{user.name}</span>
                    <span className="text-[10px] text-brand-muted">{user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded hover:bg-slate-100 text-brand-muted hover:text-status-error transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Actual Page Body container */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

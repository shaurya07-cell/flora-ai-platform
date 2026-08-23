import floraLogo from '../assets/flora-logo.png';
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Activity,
  Clock,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  SlidersHorizontal,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const AdminLayout = () => {
  const { user, adminLogout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const adminNav = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'System Health', path: '/admin/system', icon: Activity },
    { name: 'Audit Log', path: '/admin/audit', icon: Clock },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const renderTitle = () => {
    const path = location.pathname;
    if (path.endsWith('/users')) return 'User Access Management';
    if (path.endsWith('/products')) return 'Catalog Ingestion Control';
    if (path.endsWith('/system')) return 'System Microservices Health';
    if (path.endsWith('/audit')) return 'Operational Audit Log';
    if (path.endsWith('/settings')) return 'Administrative Configuration';
    return 'Control Center Overview';
  };

  return (
    <div className="min-h-screen bg-background text-brand-text flex flex-col font-sans">
      {/* Mobile Top Navbar */}
      <header className="lg:hidden h-14 bg-surface border-b border-brand-border flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
          <img src={floraLogo} alt="Flora" className="h-10 w-auto object-contain" />
          <span className="font-bold text-brand-text text-base tracking-tight">
            FLORA Admin
          </span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1.5 rounded text-brand-muted hover:text-brand-text"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      <div className="flex-1 flex relative">
        {/* Admin Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-brand-border flex flex-col justify-between
            transform lg:transform-none lg:static lg:z-auto transition-transform duration-200 ease-in-out
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isMobileOpen ? 'top-14' : 'top-0'} lg:top-0
          `}
        >
          {/* Admin Header Branding */}
          <div>
            <div className="hidden lg:flex h-16 items-center px-6 border-b border-brand-border gap-3">
              <img src={floraLogo} alt="Flora" className="h-10 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="font-bold text-brand-text text-sm tracking-tight">FLORA</span>
                <span className="text-[10px] text-accent font-semibold tracking-wider uppercase">
                  Admin Portal
                </span>
              </div>
            </div>

            {/* Admin Nav Links */}
            <nav className="px-4 py-6 space-y-1.5">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center px-3 py-2.5 text-xs font-semibold rounded transition-colors
                      ${isActive
                        ? 'bg-primary-soft text-primary font-semibold'
                        : 'text-brand-muted hover:text-brand-text hover:bg-slate-50'
                      }
                    `}
                  >
                    <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-primary' : 'text-brand-muted'}`} />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Admin Profile & Logout */}
          <div className="p-4 border-t border-brand-border bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-primary-soft border border-blue-200 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  A
                </div>
                <div className="min-w-0 text-left">
                  <span className="text-xs font-bold text-brand-text block truncate">
                    {user?.name || 'Administrator'}
                  </span>
                  <span className="text-[10px] text-brand-muted block truncate">
                    {user?.email || 'admin@flora.ai'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded hover:bg-slate-100 text-brand-muted hover:text-status-error transition-colors"
                title="Admin Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Backdrop for Mobile Menu */}
        {isMobileOpen && (
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/30 z-30 lg:hidden"
            style={{ top: '3.5rem' }}
          />
        )}

        {/* Main Admin Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Top Admin Header Bar */}
          <header className="hidden lg:flex h-16 bg-surface border-b border-brand-border items-center justify-between px-8 z-10">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm text-brand-text tracking-wide">{renderTitle()}</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-status-success border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Control Center Online
              </span>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg border border-brand-border bg-surface text-brand-muted hover:text-brand-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? <Moon className="h-4 w-4 text-slate-700" /> : <Sun className="h-4 w-4 text-amber-400" />}
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-brand-border bg-surface text-brand-text hover:bg-slate-50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </header>

          {/* Admin Body Container */}
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

export default AdminLayout;

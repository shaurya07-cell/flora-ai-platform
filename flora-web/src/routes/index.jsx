import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminProtectedRoute } from './AdminProtectedRoute';

// Public Pages
import { Landing } from '../pages/Landing';
import { About } from '../pages/About';
import { Privacy } from '../pages/Privacy';
import { Terms } from '../pages/Terms';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { AdminLogin } from '../pages/AdminLogin';

// Protected Customer Pages
import { Dashboard } from '../pages/Dashboard';
import { Products } from '../pages/Products';
import { Documents } from '../pages/Documents';
import { Upload } from '../pages/Upload';
import { Validation } from '../pages/Validation';
import { Analytics } from '../pages/Analytics';
import { Activity } from '../pages/Activity';
import { Settings } from '../pages/Settings';

// Protected Admin Pages
import { Admin } from '../pages/Admin';
import { AdminUsers } from '../pages/AdminUsers';

export const router = createBrowserRouter([
  // Public Landing & Info Routes
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/privacy',
    element: <Privacy />,
  },
  {
    path: '/terms',
    element: <Terms />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },

  // Protected Customer Application
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'products',
            element: <Products />,
          },
          {
            path: 'documents',
            element: <Documents />,
          },
          {
            path: 'upload',
            element: <Upload />,
          },
          {
            path: 'validation',
            element: <Validation />,
          },
          {
            path: 'analytics',
            element: <Analytics />,
          },
          {
            path: 'activity',
            element: <Activity />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
        ]
      }
    ]
  },

  // Protected Separate Admin Portal
  {
    element: <AdminProtectedRoute />,
    children: [
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Admin />,
          },
          {
            path: 'users',
            element: <AdminUsers />,
          },
          {
            path: 'products',
            element: <Admin />,
          },
          {
            path: 'system',
            element: <Admin />,
          },
          {
            path: 'audit',
            element: <Admin />,
          },
          {
            path: 'settings',
            element: <Admin />,
          },
        ]
      }
    ]
  },

  // Catch-all redirect to Landing
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);

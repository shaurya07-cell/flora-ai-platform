import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { Dashboard } from '../pages/Dashboard';
import { Products } from '../pages/Products';
import { Documents } from '../pages/Documents';
import { Upload } from '../pages/Upload';
import { Validation } from '../pages/Validation';
import { Settings } from '../pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
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
        path: 'settings',
        element: <Settings />,
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      }
    ],
  },
]);

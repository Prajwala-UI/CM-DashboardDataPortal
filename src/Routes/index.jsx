// src/Routes/index.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Loader from '../Layout/Loader';

// Lazy loaded page components (code splitting)
const Login = lazy(() => import('../Pages/Login'));
const Home = lazy(() => import('../Pages/Home'));
const ProjectDetail = lazy(() => import('../Pages/ProjectDetail'));
const NodalDashboard = lazy(() => import('../Pages/NodalDashboard'));
const NodalUsermgt = lazy(() => import('../Pages/NodalUsermgt'));

// Same paths as the Angular app-routing.module.ts
const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* User Modules */}
        {/* add some baseURL */}
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/project/:id" element={<ProtectedRoute element={<ProjectDetail variant="user" />} />} />

        {/* Nodal Modules */}
        <Route path="/NodalDashboard" element={<ProtectedRoute element={<NodalDashboard />} />} />
        <Route path="/NodalUsermgt" element={<ProtectedRoute element={<NodalUsermgt />} />} />
        <Route path="/NodalProjectDetailspage/:id" element={<ProtectedRoute element={<ProjectDetail variant="nodal" />} />} />

        {/* Angular's unused "dashboard" route and unknown paths (R10) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

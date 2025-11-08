import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LoginView } from './views/LoginView.jsx';
import { AppLayout } from './components/AppLayout.jsx';
import { AdminDashboard } from './views/AdminDashboard.jsx';
import { AdminUsers } from './views/AdminUsers.jsx';
import { AdminProducts } from './views/AdminProducts.jsx';
import { AdminLogs } from './views/AdminLogs.jsx';
import { AdminSettings } from './views/AdminSettings.jsx';
import { StoreProducts } from './views/StoreProducts.jsx';
import { WholesalerOrders } from './views/WholesalerOrders.jsx';
import { FacilityPurchase } from './views/FacilityPurchase.jsx';
import { setAuthUser } from './api/httpClient.js';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      setAuthUser(user);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LoginView />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['je_admin']}>
              <AppLayout title="JE 管理ダッシュボード">
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="logs" element={<AdminLogs />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/store"
          element={
            <ProtectedRoute allowedRoles={['store']}>
              <StoreProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wholesaler"
          element={
            <ProtectedRoute allowedRoles={['wholesaler']}>
              <WholesalerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/facility"
          element={
            <ProtectedRoute allowedRoles={['facility']}>
              <FacilityPurchase />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IsEmirleri from './pages/IsEmirleri';
import IsEmriForm from './pages/IsEmriForm';
import IsEmriDetay from './pages/IsEmriDetay';
import Musteriler from './pages/Musteriler';
import Raporlar from './pages/Raporlar';
import Giderler from './pages/Giderler';
import Kullanicilar from './pages/Kullanicilar';

// Components
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Only Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<IsEmirleri />} />
        <Route path="is-emirleri" element={<IsEmirleri />} />
        <Route path="is-emirleri/yeni" element={<IsEmriForm />} />
        <Route path="is-emirleri/:id" element={<IsEmriDetay />} />
        <Route path="is-emirleri/:id/duzenle" element={<IsEmriForm />} />
        <Route path="musteriler" element={<Musteriler />} />
        <Route 
          path="raporlar" 
          element={
            <AdminRoute>
              <Raporlar />
            </AdminRoute>
          } 
        />
        <Route 
          path="kullanicilar" 
          element={
            <AdminRoute>
              <Kullanicilar />
            </AdminRoute>
          } 
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

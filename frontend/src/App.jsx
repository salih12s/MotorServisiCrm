import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { CustomThemeProvider, useCustomTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import HakkimizdaPage from './pages/HakkimizdaPage';
import BasindaPage from './pages/BasindaPage';
import MotorlarPage from './pages/MotorlarPage';
import Dashboard from './pages/Dashboard';
import IsEmirleri from './pages/IsEmirleri';
import IsEmriForm from './pages/IsEmriForm';
import IsEmriDetay from './pages/IsEmriDetay';
import Musteriler from './pages/Musteriler';
import Raporlar from './pages/Raporlar';
import Giderler from './pages/Giderler';
import Kullanicilar from './pages/Kullanicilar';
import Aksesuarlar from './pages/Aksesuarlar';
import AksesuarStok from './pages/AksesuarStok';
import MotorSatislari from './pages/MotorSatislari';

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

// Root Route - giriş yapmamışsa Landing Page, yapmışsa Layout
const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <LandingPage />;
  }

  return <Layout />;
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

// Aksesuar Only Route - aksesuar_yetkisi olanlar sadece bu sayfayı görebilir
const AksesuarRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin her zaman erişebilir
  if (user.role === 'admin') {
    return children;
  }

  // Aksesuar yetkisi olmayanlar erişemez
  if (!user.aksesuar_yetkisi) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Motor Satış Route - motor_satis_yetkisi olanlar sadece bu sayfayı görebilir
const MotorSatisRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin her zaman erişebilir
  if (user.role === 'admin') {
    return children;
  }

  // Motor satış yetkisi olmayanlar erişemez
  if (!user.motor_satis_yetkisi) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Normal sayfalar için route - aksesuar_yetkisi veya motor_satis_yetkisi olanlar erişemez
const NormalRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin her zaman erişebilir
  if (user.role === 'admin') {
    return children;
  }

  // Sadece aksesuar yetkisi olanlar aksesuar sayfasına yönlendirilir
  if (user.aksesuar_yetkisi && !user.motor_satis_yetkisi) {
    return <Navigate to="/aksesuarlar" replace />;
  }

  // Sadece motor satış yetkisi olanlar motor satış sayfasına yönlendirilir
  if (user.motor_satis_yetkisi && !user.aksesuar_yetkisi) {
    return <Navigate to="/motor-satislari" replace />;
  }

  // Her iki yetkisi de olanlar da normal sayfalara erişemez
  if (user.aksesuar_yetkisi && user.motor_satis_yetkisi) {
    return <Navigate to="/aksesuarlar" replace />;
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

      {/* Tanıtım sayfaları - herkese açık */}
      <Route path="/hakkimizda" element={<HakkimizdaPage />} />
      <Route path="/basinda" element={<BasindaPage />} />
      <Route path="/motorlar" element={<MotorlarPage />} />

      <Route
        path="/"
        element={<RootRoute />}
      >
        <Route index element={<NormalRoute><IsEmirleri /></NormalRoute>} />
        <Route path="is-emirleri" element={<NormalRoute><IsEmirleri /></NormalRoute>} />
        <Route path="is-emirleri/yeni" element={<NormalRoute><IsEmriForm /></NormalRoute>} />
        <Route path="is-emirleri/:id" element={<NormalRoute><IsEmriDetay /></NormalRoute>} />
        <Route path="is-emirleri/:id/duzenle" element={<NormalRoute><IsEmriForm /></NormalRoute>} />
        <Route path="musteriler" element={<NormalRoute><Musteriler /></NormalRoute>} />
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
        <Route 
          path="motor-satislari" 
          element={
            <MotorSatisRoute>
              <MotorSatislari />
            </MotorSatisRoute>
          } 
        />
        <Route path="aksesuarlar" element={<AksesuarRoute><Aksesuarlar /></AksesuarRoute>} />
        <Route path="aksesuar-stok" element={<AksesuarRoute><AksesuarStok /></AksesuarRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Theme wrapper component
function ThemedApp() {
  const { theme } = useCustomTheme();
  
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

function App() {
  return (
    <CustomThemeProvider>
      <ThemedApp />
    </CustomThemeProvider>
  );
}

export default App;

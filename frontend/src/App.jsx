import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { CustomThemeProvider, useCustomTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/public/Login';
import LandingPage from './pages/public/LandingPage';
import HakkimizdaPage from './pages/public/HakkimizdaPage';
import BasindaPage from './pages/public/BasindaPage';
import MotorlarPage from './pages/public/MotorlarPage';
import FiyatListesiPage from './pages/public/FiyatListesiPage';
import AksesuarSatisPage from './pages/public/AksesuarSatisPage';
import Dashboard from './pages/dashboard/Dashboard';
import IsEmirleri from './pages/isEmirleri/IsEmirleri';
import IsEmriForm from './pages/isEmirleri/IsEmriForm';
import IsEmriDetay from './pages/isEmirleri/IsEmriDetay';
import Musteriler from './pages/musteriler/Musteriler';
import Raporlar from './pages/raporlar/Raporlar';
import Giderler from './pages/giderler/Giderler';
import Kullanicilar from './pages/kullanicilar/Kullanicilar';
import Aksesuarlar from './pages/aksesuarlar/Aksesuarlar';
import AksesuarStok from './pages/aksesuarlar/AksesuarStok';
import MotorSatislari from './pages/motorSatislari/MotorSatislari';

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

// Authenticated panel layout - / her zaman LandingPage'i gösterir, panel sayfaları bu route altında Layout ile sarılır
const PanelLayoutRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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
    return <Navigate to="/is-emirleri" replace />;
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
    return <Navigate to="/is-emirleri" replace />;
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
    return <Navigate to="/is-emirleri" replace />;
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
    return <Navigate to="/is-emirleri" replace />;
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
      <Route path="/" element={<LandingPage />} />
      <Route path="/hakkimizda" element={<HakkimizdaPage />} />
      <Route path="/basinda" element={<BasindaPage />} />
      <Route path="/motorlar" element={<MotorlarPage />} />
      <Route path="/fiyat-listesi" element={<FiyatListesiPage />} />
      <Route path="/aksesuarlar-satis" element={<AksesuarSatisPage />} />

      <Route element={<PanelLayoutRoute />}>
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

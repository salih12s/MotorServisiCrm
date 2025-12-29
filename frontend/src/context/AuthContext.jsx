import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authService.verify();
          const userData = response.data.user;
          
          // Backend 'rol' döndürüyor, frontend 'role' bekliyor - ikisini de ekle
          const normalizedUser = {
            ...userData,
            role: userData.rol || userData.role,
            name: userData.ad_soyad || userData.name
          };
          
          setUser(normalizedUser);
        } catch (error) {
          console.error('Token doğrulama hatası:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const { username, password } = credentials;
    
    try {
      const response = await authService.login({
        kullanici_adi: username,
        sifre: password
      });
      
      const { token, user: userData } = response.data;
      
      // Backend 'rol' döndürüyor, frontend 'role' bekliyor - ikisini de ekle
      const normalizedUser = {
        ...userData,
        role: userData.rol || userData.role,  // Frontend için role
        name: userData.ad_soyad || userData.name  // Frontend için name
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      
      return normalizedUser;
    } catch (error) {
      console.error('Login hatası:', error);
      throw new Error(error.response?.data?.message || 'Giriş yapılamadı');
    }
  };

  const logout = async () => {
    try {
      // Backend'e logout isteği gönder (aktivite loglamak için)
      await authService.logout();
    } catch (error) {
      console.error('Logout API hatası:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

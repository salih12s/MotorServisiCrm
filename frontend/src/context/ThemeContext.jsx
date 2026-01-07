import React, { createContext, useContext, useState } from 'react';
import { createTheme } from '@mui/material/styles';

// Varsayılan Turkuaz tema
const defaultTheme = {
  primary: '#04A7B8',
  primaryLight: '#36C5D3',
  primaryDark: '#038999',
  secondary: '#036B74',
  secondaryLight: '#04A7B8',
  secondaryDark: '#024E54',
};

// Aksesuar (Mor) tema
const aksesuarTheme = {
  primary: '#630094',
  primaryLight: '#8B3BB5',
  primaryDark: '#4A006F',
  secondary: '#4A006F',
  secondaryLight: '#630094',
  secondaryDark: '#320048',
};

const ThemeContext = createContext(null);

export const useCustomTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within ThemeProvider');
  }
  return context;
};

export const CustomThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');

  const themeColors = currentTheme === 'aksesuar' ? aksesuarTheme : defaultTheme;

  const setAksesuarTheme = () => setCurrentTheme('aksesuar');
  const setDefaultTheme = () => setCurrentTheme('default');

  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: themeColors.primary,
        light: themeColors.primaryLight,
        dark: themeColors.primaryDark,
        contrastText: '#ffffff',
      },
      secondary: {
        main: themeColors.secondary,
        light: themeColors.secondaryLight,
        dark: themeColors.secondaryDark,
        contrastText: '#ffffff',
      },
      success: {
        main: '#4CAF50',
        light: '#81C784',
        dark: '#388E3C',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#ff8f00',
        light: '#ffc046',
        dark: '#c56000',
        contrastText: '#000000',
      },
      error: {
        main: '#c62828',
        light: '#ff5f52',
        dark: '#8e0000',
        contrastText: '#ffffff',
      },
      info: {
        main: themeColors.primary,
        light: themeColors.primaryLight,
        dark: themeColors.primaryDark,
        contrastText: '#ffffff',
      },
      background: {
        default: '#f5f7fa',
        paper: '#ffffff',
      },
      text: {
        primary: '#1a1a2e',
        secondary: '#4a5568',
      },
      divider: 'rgba(0, 0, 0, 0.08)',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 500 },
      body1: { fontWeight: 400 },
      body2: { fontWeight: 400 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 20px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${themeColors.primaryLight} 0%, ${themeColors.primary} 100%)`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      currentTheme, 
      setAksesuarTheme, 
      setDefaultTheme,
      themeColors 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

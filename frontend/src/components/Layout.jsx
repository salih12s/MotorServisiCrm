import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Menu as MenuIcon,
  Group as GroupIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCustomTheme } from '../context/ThemeContext';
import { Outlet } from 'react-router-dom';

const drawerWidth = 260;

const menuItems = [
  { 
    title: 'İş Emirleri', 
    path: '/', 
    icon: <AssignmentIcon />,
    roles: ['admin', 'user', 'personel'],
  },
  { 
    title: 'Müşteriler', 
    path: '/musteriler', 
    icon: <PeopleIcon />,
    roles: ['admin', 'user', 'personel'],
  },
  { 
    title: 'Aksesuarlar', 
    path: '/aksesuarlar', 
    icon: <ShoppingBagIcon />,
    roles: ['admin', 'user', 'personel'],
    color: '#630094',
    requireAksesuarYetkisi: true,
  },
  { 
    title: 'Raporlar', 
    path: '/raporlar', 
    icon: <AssessmentIcon />,
    roles: ['admin'],
  },
  { 
    title: 'Kullanıcılar', 
    path: '/kullanicilar', 
    icon: <GroupIcon />,
    roles: ['admin'],
  },
];

function Layout() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { setAksesuarTheme, setDefaultTheme, themeColors } = useCustomTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Aksesuar sayfasında temayı değiştir
  useEffect(() => {
    if (location.pathname === '/aksesuarlar') {
      setAksesuarTheme();
    } else {
      setDefaultTheme();
    }
  }, [location.pathname, setAksesuarTheme, setDefaultTheme]);

  // Kullanıcı rolüne göre ve aksesuar yetkisine göre menu filtrele
  const filteredMenuItems = menuItems.filter(item => {
    // Rol kontrolü
    if (item.roles && !item.roles.includes(user?.role || 'user')) {
      return false;
    }
    // Aksesuar yetkisi kontrolü - admin her zaman görebilir
    if (item.requireAksesuarYetkisi && user?.role !== 'admin' && !user?.aksesuar_yetkisi) {
      return false;
    }
    return true;
  });

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getCurrentPageTitle = () => {
    const item = filteredMenuItems.find(item => item.path === location.pathname);
    if (item) return item.title;
    if (location.pathname.startsWith('/is-emirleri/')) return 'İş Emri Detay';
    return 'Ana Sayfa';
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: themeColors.secondary, overflow: 'hidden', transition: 'background-color 0.3s ease' }}>
      {/* Logo */}
      <Box 
        sx={{ 
          p: 2.5, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: `2px solid ${themeColors.primary}`,
            transition: 'border-color 0.3s ease',
          }}
        >
          <img 
            src="/Demirkan.jpeg" 
            alt="Logo" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
          />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} color="white" letterSpacing={0.5}>
            DEMİRKAN
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.7rem' }}>
            Motorlu Araçlar
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ py: 1.5, px: 1.5, flex: 1 }}>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.25,
                  bgcolor: isActive ? `${themeColors.primary}40` : 'transparent',
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    bgcolor: isActive ? `${themeColors.primary}60` : 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: isActive ? themeColors.primaryLight : 'rgba(255,255,255,0.7)',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9rem',
                    color: isActive ? 'white' : 'rgba(255,255,255,0.85)',
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 3,
                      height: 20,
                      borderRadius: 2,
                      bgcolor: themeColors.primary,
                      transition: 'background-color 0.3s ease',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Logo Alt Kısım */}
      <Box 
        sx={{ 
          p: 3, 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img 
          src="/Demirkan.jpeg" 
          alt="Logo" 
          style={{ 
            width: 100, 
            height: 100, 
            objectFit: 'cover',
            borderRadius: '50%',
            opacity: 0.15,
            filter: 'grayscale(30%)',
          }} 
        />
      </Box>

      {/* User Info - Compact */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar 
          sx={{ 
            width: 36, 
            height: 36, 
            bgcolor: themeColors.primary,
            fontWeight: 700,
            fontSize: '0.9rem',
            transition: 'background-color 0.3s ease',
          }}
        >
          {user?.ad_soyad?.charAt(0) || 'U'}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="body2" 
            fontWeight={600} 
            color="white"
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.85rem',
            }}
          >
            {user?.ad_soyad || 'Kullanıcı'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
            {user?.rol === 'admin' ? 'Yönetici' : 'Personel'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Top Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h5" 
              fontWeight={700} 
              color="text.primary"
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              {getCurrentPageTitle()}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ display: { xs: 'none', md: 'block' } }}>
              {user?.ad_soyad || 'Kullanıcı'}
            </Typography>
            <Tooltip title={user?.ad_soyad || 'Profil'}>
              <IconButton onClick={handleMenuClick}>
                <Avatar 
                  sx={{ 
                    width: 42, 
                    height: 42, 
                    bgcolor: themeColors.primary,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  {user?.ad_soyad?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: { 
                  minWidth: 220, 
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={700}>{user?.ad_soyad}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.rol === 'admin' ? 'Yönetici' : 'Personel'}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                Çıkış Yap
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 3 },
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          maxWidth: '100vw',
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          overflow: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;

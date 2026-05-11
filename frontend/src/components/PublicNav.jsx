import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Stack,
  useScrollTrigger,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import { Login as LoginIcon, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';

function ScrollNav({ children, solid }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 30,
  });
  const isSolid = solid || trigger;
  return React.cloneElement(children, {
    sx: {
      ...children.props.sx,
      background: isSolid
        ? 'rgba(2, 78, 84, 0.95)'
        : 'linear-gradient(180deg, rgba(2,78,84,0.85) 0%, rgba(2,78,84,0) 100%)',
      backdropFilter: isSolid ? 'blur(12px)' : 'blur(6px)',
      boxShadow: isSolid ? '0 8px 30px rgba(0,0,0,0.25)' : 'none',
      transition: 'all 0.3s ease',
    },
  });
}

const MENU = [
  { path: '/', label: 'Anasayfa' },
  { path: '/hakkimizda', label: 'Hakkımızda' },
  { path: '/basinda', label: 'Basında Biz' },
  { path: '/motorlar', label: 'Motorlarımız' },
];

function PublicNav({ solid = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <>
      <ScrollNav solid={solid}>
        <AppBar position="fixed" elevation={0} sx={{ background: 'transparent' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 1, gap: { xs: 1, md: 2 } }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid #36C5D3',
                  boxShadow: '0 0 20px rgba(54,197,211,0.6)',
                }}
              >
                <img
                  src="/Demirkan.jpeg"
                  alt="Demirkan"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    letterSpacing: 1.5,
                    lineHeight: 1,
                    background: 'linear-gradient(90deg,#36C5D3,#fff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  DEMİRKAN
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#9fd9e1', letterSpacing: 0.5 }}>
                  Motorlu Araçlar
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Stack
              direction="row"
              spacing={3}
              sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}
            >
              {MENU.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    sx={{
                      color: active ? '#36C5D3' : '#fff',
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      borderBottom: active
                        ? '2px solid #36C5D3'
                        : '2px solid transparent',
                      borderRadius: 0,
                      '&:hover': {
                        color: '#36C5D3',
                        background: 'transparent',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>

            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{
                background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                color: '#fff',
                fontWeight: 700,
                px: { xs: 1.8, sm: 3 },
                py: 1,
                borderRadius: 50,
                textTransform: 'none',
                letterSpacing: 0.5,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                minWidth: 0,
                '& .MuiButton-startIcon': {
                  marginRight: { xs: 0.5, sm: 1 },
                },
                boxShadow: '0 4px 20px rgba(54,197,211,0.5)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #36C5D3 0%, #04A7B8 100%)',
                  boxShadow: '0 6px 30px rgba(54,197,211,0.8)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Giriş Yap
            </Button>

            {/* Mobile menu button */}
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                display: { xs: 'inline-flex', md: 'none' },
                color: '#fff',
                ml: 0.5,
              }}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>
      </ScrollNav>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: 'linear-gradient(180deg, #024E54 0%, #0a1929 100%)',
            color: '#fff',
            borderLeft: '1px solid rgba(54,197,211,0.3)',
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 800, color: '#36C5D3', letterSpacing: 1.2 }}>
            DEMİRKAN
          </Typography>
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ borderColor: 'rgba(54,197,211,0.2)' }} />
        <List sx={{ pt: 1 }}>
          {MENU.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => goTo(item.path)}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderLeft: active ? '4px solid #36C5D3' : '4px solid transparent',
                    background: active ? 'rgba(54,197,211,0.12)' : 'transparent',
                    '&:hover': { background: 'rgba(54,197,211,0.18)' },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: active ? 700 : 500,
                      color: active ? '#36C5D3' : '#fff',
                      letterSpacing: 0.5,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}

export default PublicNav;

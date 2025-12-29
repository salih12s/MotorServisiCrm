import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Fade,
  Snackbar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

function Login() {
  const [tabValue, setTabValue] = useState(0); // 0: Giriş, 1: Kayıt
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [adSoyad, setAdSoyad] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setKullaniciAdi('');
    setSifre('');
    setAdSoyad('');
    setSifreTekrar('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ username: kullaniciAdi, password: sifre });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Giriş yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (sifre !== sifreTekrar) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (sifre.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        kullanici_adi: kullaniciAdi,
        sifre: sifre,
        ad_soyad: adSoyad,
      });
      setSuccessMessage('Kayıt başarılı! Admin onayı bekleniyor. Onaylandığında giriş yapabilirsiniz.');
      setTabValue(0);
      setKullaniciAdi('');
      setSifre('');
      setAdSoyad('');
      setSifreTekrar('');
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #024E54 0%, #036B74 50%, #04A7B8 100%)',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)
          `,
        },
      }}
    >
      <Card 
        sx={{ 
          maxWidth: 460, 
          width: '100%', 
          borderRadius: { xs: 2, sm: 4 },
          boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'visible',
          mx: { xs: 1, sm: 2 },
        }}
      >
        {/* Logo Area */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: -60, sm: -90 },
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: 100, sm: 120 },
            height: { xs: 100, sm: 120 },
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(4, 167, 184, 0.5), 0 0 0 4px #04A7B8, 0 0 30px rgba(4, 167, 184, 0.4)',
            border: { xs: '3px solid white', sm: '4px solid white' },
            overflow: 'hidden',
            animation: 'pulse 3s ease-in-out infinite, float 6s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                boxShadow: '0 10px 40px rgba(4, 167, 184, 0.5), 0 0 0 4px #04A7B8, 0 0 30px rgba(4, 167, 184, 0.4)',
              },
              '50%': {
                boxShadow: '0 10px 50px rgba(4, 167, 184, 0.7), 0 0 0 6px #36C5D3, 0 0 50px rgba(54, 197, 211, 0.6)',
              },
            },
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translateX(-50%) translateY(0px)',
              },
              '50%': {
                transform: 'translateX(-50%) translateY(-8px)',
              },
            },
          }}
        >
          <img 
            src="/Demirkan.jpeg" 
            alt="Demirkan Logo" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              filter: 'brightness(1.1) contrast(1.05)',
            }} 
          />
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 7, sm: 10 } }}>
          {/* Logo Text */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                background: 'linear-gradient(135deg, #036B74 0%, #04A7B8 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                letterSpacing: { xs: 1, sm: 2 },
                fontSize: { xs: '1.75rem', sm: '2.125rem' },
                mb: 0.5,
              }}
            >
              DEMİRKAN
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              fontWeight={500}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Motorlu Araçlar Servis Sistemi
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            sx={{ 
              mb: 3,
              '& .MuiTabs-indicator': {
                backgroundColor: '#04A7B8',
              },
              '& .MuiTab-root': {
                fontWeight: 600,
                color: '#666',
                '&.Mui-selected': {
                  color: '#036B74',
                },
              },
            }}
          >
            <Tab icon={<LoginIcon />} label="Giriş Yap" iconPosition="start" />
            <Tab icon={<PersonAddIcon />} label="Kayıt Ol" iconPosition="start" />
          </Tabs>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Fade in={tabValue === 0}>
            <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
              <form onSubmit={handleLogin}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                  Kullanıcı Adı
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Kullanıcı adınızı girin"
                  value={kullaniciAdi}
                  onChange={(e) => setKullaniciAdi(e.target.value)}
                  required
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#04A7B8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#36C5D3',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#04A7B8',
                      },
                    },
                  }}
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                  Şifre
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Şifrenizi girin"
                  type={showPassword ? 'text' : 'password'}
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#04A7B8' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#36C5D3',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#04A7B8',
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !kullaniciAdi || !sifre}
                  startIcon={!loading && <LoginIcon />}
                  sx={{ 
                    py: 1.5, 
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #036B74 0%, #04A7B8 100%)',
                    boxShadow: '0 6px 20px rgba(4, 167, 184, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                      boxShadow: '0 8px 25px rgba(4, 167, 184, 0.5)',
                    },
                    '&:disabled': {
                      background: '#e0e0e0',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
                </Button>
              </form>
            </Box>
          </Fade>

          {/* Register Form */}
          <Fade in={tabValue === 1}>
            <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
              <form onSubmit={handleRegister}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                  Ad Soyad
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Adınızı ve soyadınızı girin"
                  value={adSoyad}
                  onChange={(e) => setAdSoyad(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ color: '#04A7B8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#36C5D3',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#04A7B8',
                      },
                    },
                  }}
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                  Kullanıcı Adı
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Kullanıcı adı belirleyin"
                  value={kullaniciAdi}
                  onChange={(e) => setKullaniciAdi(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#04A7B8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#36C5D3',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#04A7B8',
                      },
                    },
                  }}
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                  Şifre
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Şifre belirleyin (min 6 karakter)"
                  type={showPassword ? 'text' : 'password'}
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#04A7B8' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#36C5D3',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#04A7B8',
                      },
                    },
                  }}
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                  Şifre Tekrar
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Şifrenizi tekrar girin"
                  type={showPasswordRepeat ? 'text' : 'password'}
                  value={sifreTekrar}
                  onChange={(e) => setSifreTekrar(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#04A7B8' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPasswordRepeat(!showPasswordRepeat)}
                          edge="end"
                          size="small"
                        >
                          {showPasswordRepeat ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#36C5D3',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#04A7B8',
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !kullaniciAdi || !sifre || !adSoyad || !sifreTekrar}
                  startIcon={!loading && <PersonAddIcon />}
                  sx={{ 
                    py: 1.5, 
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #036B74 0%, #04A7B8 100%)',
                    boxShadow: '0 6px 20px rgba(4, 167, 184, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                      boxShadow: '0 8px 25px rgba(4, 167, 184, 0.5)',
                    },
                    '&:disabled': {
                      background: '#e0e0e0',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Kayıt Ol'}
                </Button>

                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                  Kayıt olduktan sonra admin onayı gereklidir. Onaylandığında giriş yapabilirsiniz.
                </Alert>
              </form>
            </Box>
          </Fade>
        </CardContent>
      </Card>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccessMessage('')}
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Login;

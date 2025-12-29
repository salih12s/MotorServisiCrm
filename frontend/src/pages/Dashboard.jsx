import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Divider,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  Pending as PendingIcon,
  LocalAtm as LocalAtmIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import { raporService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import IsEmriModal from '../components/IsEmriModal';

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon, color, onClick }) => (
  <Card
    sx={{
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '2px solid transparent',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px -8px rgba(0,0,0,0.15)',
        borderColor: color,
      },
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, textAlign: 'center' }}>
      <Box
        sx={{
          width: { xs: 42, sm: 56 },
          height: { xs: 42, sm: 56 },
          borderRadius: '50%',
          bgcolor: `${color}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: { xs: 1, sm: 1.5 },
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: { xs: 20, sm: 28 }, color: color } })}
      </Box>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
        {description}
      </Typography>
    </CardContent>
  </Card>
);

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const raporRes = await raporService.getGenel();
      setStats(raporRes.data);
    } catch (error) {
      console.error('Dashboard yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  const toplamAcikIs = stats?.genel?.acik_is || 0;
  const toplamIs = stats?.genel?.toplam_is || 1;
  const tamamlanmaOrani = ((toplamIs - toplamAcikIs) / toplamIs * 100).toFixed(0);

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Hoş Geldiniz, {user?.name}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          İşte bugünün özeti
        </Typography>
      </Box>

      {/* Ana İstatistik Kartları */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/is-emirleri')}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Toplam İş Emri
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}>
                    {stats?.genel?.toplam_is || 0}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <Chip 
                      icon={<PendingIcon sx={{ fontSize: 16, color: 'white !important' }} />}
                      label={`${toplamAcikIs} Açık`}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 600,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        '& .MuiChip-icon': { color: 'white' }
                      }}
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    width: { xs: 48, sm: 60 },
                    height: { xs: 48, sm: 60 },
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>Tamamlanma</Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>{tamamlanmaOrani}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={parseFloat(tamamlanmaOrani)} 
                  sx={{ 
                    height: { xs: 4, sm: 6 }, 
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/musteriler')}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Toplam Müşteri
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}>
                    {stats?.genel?.toplam_musteri || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 2, display: 'block', opacity: 0.9, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                    Aktif müşteri sayısı
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: { xs: 48, sm: 60 },
                    height: { xs: 48, sm: 60 },
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PeopleIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {isAdmin && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
                onClick={() => navigate('/raporlar')}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Toplam Gelir
                      </Typography>
                      <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                        {formatCurrency(stats?.genel?.toplam_gelir)}
                      </Typography>
                      <Typography variant="caption" sx={{ mt: 2, display: 'block', opacity: 0.9, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                        Tüm zamanlar
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: { xs: 48, sm: 60 },
                        height: { xs: 48, sm: 60 },
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <LocalAtmIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  background: parseFloat(stats?.genel?.net_kar) >= 0 
                    ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                    : 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                  color: '#333',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
                onClick={() => navigate('/raporlar')}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Net Kar
                      </Typography>
                      <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                        {formatCurrency(stats?.genel?.net_kar)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                        {parseFloat(stats?.genel?.net_kar) >= 0 ? (
                          <TrendingUpIcon sx={{ color: '#2e7d32', fontSize: { xs: 18, sm: 20 } }} />
                        ) : (
                          <ShowChartIcon sx={{ color: '#c62828', fontSize: { xs: 18, sm: 20 } }} />
                        )}
                        <Typography variant="caption" fontWeight={600} sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                          {parseFloat(stats?.genel?.net_kar) >= 0 ? 'Karlı' : 'Zararda'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        width: { xs: 48, sm: 60 },
                        height: { xs: 48, sm: 60 },
                        borderRadius: '50%',
                        flexShrink: 0,
                        bgcolor: 'rgba(255,255,255,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShowChartIcon sx={{ fontSize: 32 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Hızlı İşlemler */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        Hızlı İşlemler
      </Typography>
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={6} sm={3}>
          <QuickActionCard
            title="Yeni İş Emri"
            description="Hızlıca oluştur"
            icon={<AddIcon />}
            color="#1a237e"
            onClick={() => setIsModalOpen(true)}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <QuickActionCard
            title="İş Emirleri"
            description="Tümünü görüntüle"
            icon={<AssignmentIcon />}
            color="#0d47a1"
            onClick={() => navigate('/is-emirleri')}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <QuickActionCard
            title="Müşteriler"
            description="Müşteri listesi"
            icon={<PeopleIcon />}
            color="#00897b"
            onClick={() => navigate('/musteriler')}
          />
        </Grid>
        {isAdmin && (
          <Grid item xs={6} sm={3}>
            <QuickActionCard
              title="Raporlar"
              description="İstatistik ve analiz"
              icon={<ReceiptIcon />}
              color="#c62828"
              onClick={() => navigate('/raporlar')}
            />
          </Grid>
        )}
      </Grid>

      {/* Durum Kartları (Sadece Admin için) */}
      {isAdmin && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Finansal Özet
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#e3f2fd' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Toplam Gelir
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {formatCurrency(stats?.genel?.toplam_gelir)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#ffebee' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Toplam Gider
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="error.main">
                    {formatCurrency(stats?.genel?.toplam_gider)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#fff3e0' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Toplam Maliyet
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="warning.dark">
                    {formatCurrency(stats?.genel?.toplam_maliyet)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: parseFloat(stats?.genel?.net_kar) >= 0 ? '#e8f5e9' : '#ffebee' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Net Kar
                  </Typography>
                  <Typography 
                    variant="h5" 
                    fontWeight={700} 
                    sx={{ color: parseFloat(stats?.genel?.net_kar) >= 0 ? '#2e7d32' : '#c62828' }}
                  >
                    {formatCurrency(stats?.genel?.net_kar)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* İş Emri Modal */}
      <IsEmriModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadData();
          setIsModalOpen(false);
        }}
      />
    </Box>
  );
}

export default Dashboard;

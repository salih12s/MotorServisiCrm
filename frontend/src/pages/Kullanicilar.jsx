import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Block as BlockIcon,
  AccessTime as AccessTimeIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Money as MoneyIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  DirectionsCar as DirectionsCarIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { authService } from '../services/api';

function Kullanicilar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [users, setUsers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [activities, setActivities] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [userWorkOrders, setUserWorkOrders] = useState([]);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [workOrdersDialogOpen, setWorkOrdersDialogOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [workOrderDetailOpen, setWorkOrderDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [logFilter, setLogFilter] = useState({ kullanici_id: '', islem_tipi: '' });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tabValue === 2) {
      loadActivityLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue, logFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, activitiesRes] = await Promise.all([
        authService.getUsers(),
        authService.getAllActivities(),
      ]);
      setUsers(usersRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setSnackbar({ open: true, message: 'Veriler yüklenemedi', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      setLoadingLogs(true);
      const params = { limit: 200 };
      if (logFilter.kullanici_id) params.kullanici_id = logFilter.kullanici_id;
      if (logFilter.islem_tipi) params.islem_tipi = logFilter.islem_tipi;
      
      const res = await authService.getAllActivityLogs(params);
      setActivityLogs(res.data);
    } catch (error) {
      console.error('Aktivite logları yükleme hatası:', error);
      setSnackbar({ open: true, message: 'Aktivite logları yüklenemedi', severity: 'error' });
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await authService.approveUser(userId);
      setSnackbar({ open: true, message: 'Kullanıcı onaylandı', severity: 'success' });
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Onaylama başarısız', severity: 'error' });
    }
  };

  const handleReject = async (userId) => {
    try {
      await authService.rejectUser(userId);
      setSnackbar({ open: true, message: 'Kullanıcı reddedildi', severity: 'warning' });
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Reddetme başarısız', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await authService.deleteUser(userToDelete.id);
      setSnackbar({ open: true, message: 'Kullanıcı silindi', severity: 'success' });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Silme başarısız', severity: 'error' });
    }
  };

  const handleViewActivities = async (user) => {
    setSelectedUser(user);
    try {
      const res = await authService.getUserActivityLogs(user.id, 100);
      setUserActivities(res.data);
      setActivityDialogOpen(true);
    } catch (error) {
      setSnackbar({ open: true, message: 'Aktiviteler yüklenemedi', severity: 'error' });
    }
  };

  const handleViewWorkOrders = async (user) => {
    setSelectedUser(user);
    try {
      const res = await authService.getUserWorkOrders(user.id);
      setUserWorkOrders(res.data);
      setWorkOrdersDialogOpen(true);
    } catch (error) {
      setSnackbar({ open: true, message: 'İş emirleri yüklenemedi', severity: 'error' });
    }
  };

  const handleViewWorkOrderDetail = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setWorkOrderDetailOpen(true);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'onaylandi':
        return <Chip icon={<CheckCircleIcon />} label="Onaylı" color="success" size="small" />;
      case 'beklemede':
        return <Chip icon={<HourglassEmptyIcon />} label="Beklemede" color="warning" size="small" />;
      case 'reddedildi':
        return <Chip icon={<BlockIcon />} label="Reddedildi" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getIslemTipiIcon = (islemTipi) => {
    const iconMap = {
      'LOGIN': <LoginIcon sx={{ color: 'success.main' }} />,
      'LOGIN_FAILED': <LoginIcon sx={{ color: 'error.main' }} />,
      'LOGOUT': <LogoutIcon sx={{ color: 'grey.500' }} />,
      'REGISTER': <PersonAddIcon sx={{ color: 'info.main' }} />,
      'IS_EMRI_OLUSTUR': <AddIcon sx={{ color: 'success.main' }} />,
      'IS_EMRI_GUNCELLE': <EditIcon sx={{ color: 'warning.main' }} />,
      'IS_EMRI_SIL': <DeleteIcon sx={{ color: 'error.main' }} />,
      'MUSTERI_EKLE': <PersonIcon sx={{ color: 'success.main' }} />,
      'MUSTERI_GUNCELLE': <PersonIcon sx={{ color: 'warning.main' }} />,
      'MUSTERI_SIL': <PersonIcon sx={{ color: 'error.main' }} />,
      'GIDER_EKLE': <MoneyIcon sx={{ color: 'success.main' }} />,
      'GIDER_GUNCELLE': <MoneyIcon sx={{ color: 'warning.main' }} />,
      'GIDER_SIL': <MoneyIcon sx={{ color: 'error.main' }} />,
    };
    return iconMap[islemTipi] || <HistoryIcon sx={{ color: 'grey.500' }} />;
  };

  const getIslemTipiLabel = (islemTipi) => {
    const labelMap = {
      'LOGIN': 'Giriş Yaptı',
      'LOGIN_FAILED': 'Başarısız Giriş',
      'LOGOUT': 'Çıkış Yaptı',
      'REGISTER': 'Kayıt Oldu',
      'IS_EMRI_OLUSTUR': 'İş Emri Oluşturdu',
      'IS_EMRI_GUNCELLE': 'İş Emri Güncelledi',
      'IS_EMRI_SIL': 'İş Emri Sildi',
      'MUSTERI_EKLE': 'Müşteri Ekledi',
      'MUSTERI_GUNCELLE': 'Müşteri Güncelledi',
      'MUSTERI_SIL': 'Müşteri Sildi',
      'GIDER_EKLE': 'Gider Ekledi',
      'GIDER_GUNCELLE': 'Gider Güncelledi',
      'GIDER_SIL': 'Gider Sildi',
    };
    return labelMap[islemTipi] || islemTipi;
  };

  const getIslemTipiColor = (islemTipi) => {
    if (islemTipi?.includes('SIL') || islemTipi === 'LOGIN_FAILED') return 'error';
    if (islemTipi?.includes('GUNCELLE')) return 'warning';
    if (islemTipi?.includes('OLUSTUR') || islemTipi?.includes('EKLE') || islemTipi === 'LOGIN' || islemTipi === 'REGISTER') return 'success';
    return 'default';
  };

  const islemTipleri = [
    'LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'REGISTER',
    'IS_EMRI_OLUSTUR', 'IS_EMRI_GUNCELLE', 'IS_EMRI_SIL',
    'MUSTERI_EKLE', 'MUSTERI_GUNCELLE', 'MUSTERI_SIL',
    'GIDER_EKLE', 'GIDER_GUNCELLE', 'GIDER_SIL',
  ];

  const pendingUsers = users.filter(u => u.onay_durumu === 'beklemede');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#04A7B8' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#036B74' }}>
        Kullanıcı Yönetimi
      </Typography>

      {/* Pending Users Alert */}
      {pendingUsers.length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, borderRadius: 2 }}
          icon={<HourglassEmptyIcon />}
        >
          {pendingUsers.length} kullanıcı onay bekliyor
        </Alert>
      )}

      <Tabs 
        value={tabValue} 
        onChange={(e, v) => setTabValue(v)} 
        sx={{ 
          mb: 3,
          '& .MuiTabs-indicator': { backgroundColor: '#04A7B8' },
          '& .MuiTab-root.Mui-selected': { color: '#036B74' },
        }}
      >
        <Tab label={`Tüm Kullanıcılar (${users.length})`} />
        <Tab label={`Onay Bekleyenler (${pendingUsers.length})`} />
        <Tab label="Detaylı Aktivite Logları" icon={<HistoryIcon />} iconPosition="start" />
      </Tabs>

      {/* Tab 0: Tüm Kullanıcılar */}
      {tabValue === 0 && (
        isMobile ? (
          /* Mobile Card View */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {users.map((user) => (
              <Card key={user.id} sx={{ overflow: 'hidden' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                    <Avatar sx={{ bgcolor: '#04A7B8', width: 40, height: 40, flexShrink: 0 }}>
                      {user.ad_soyad?.charAt(0) || 'U'}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {user.ad_soyad}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }} noWrap>
                        @{user.kullanici_adi}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip 
                          label={user.rol === 'admin' ? 'Yönetici' : 'Personel'} 
                          size="small"
                          color={user.rol === 'admin' ? 'primary' : 'default'}
                          sx={{ height: '20px', fontSize: '0.7rem' }}
                        />
                        {getStatusChip(user.onay_durumu)}
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Şifre:
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        bgcolor: '#f5f5f5', 
                        px: 1, 
                        py: 0.25, 
                        borderRadius: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      {user.plain_sifre || '***'}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 1 }}>
                    Kayıt: {new Date(user.created_at).toLocaleDateString('tr-TR')}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon sx={{ fontSize: '1rem' }} />}
                      onClick={() => handleViewActivities(user)}
                      sx={{ flex: 1, minWidth: 0, px: 1, fontSize: '0.7rem' }}
                    >
                      Aktivite
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      startIcon={<AssignmentIcon sx={{ fontSize: '1rem' }} />}
                      onClick={() => handleViewWorkOrders(user)}
                      sx={{ flex: 1, minWidth: 0, px: 1, fontSize: '0.7rem' }}
                    >
                      İş Emirleri
                    </Button>
                    {user.onay_durumu === 'beklemede' && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleApprove(user.id)}
                          sx={{ color: 'success.main', p: 0.5 }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleReject(user.id)}
                          sx={{ color: 'error.main', p: 0.5 }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                    {user.rol !== 'admin' && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setUserToDelete(user);
                          setDeleteDialogOpen(true);
                        }}
                        sx={{ color: 'error.main', p: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          /* Desktop Table View */
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Kullanıcı</TableCell>
                <TableCell>Kullanıcı Adı</TableCell>
                <TableCell>Şifre</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Kayıt Tarihi</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#04A7B8', width: 36, height: 36 }}>
                        {user.ad_soyad?.charAt(0) || 'U'}
                      </Avatar>
                      <Typography fontWeight={600}>{user.ad_soyad}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.kullanici_adi}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        bgcolor: '#f5f5f5', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1,
                        display: 'inline-block'
                      }}
                    >
                      {user.plain_sifre || '***'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.rol === 'admin' ? 'Yönetici' : 'Personel'} 
                      size="small"
                      color={user.rol === 'admin' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{getStatusChip(user.onay_durumu)}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Aktiviteleri Görüntüle">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewActivities(user)}
                        sx={{ color: '#04A7B8' }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="İş Emirleri">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewWorkOrders(user)}
                        sx={{ color: '#2e7d32' }}
                      >
                        <AssignmentIcon />
                      </IconButton>
                    </Tooltip>
                    {user.onay_durumu === 'beklemede' && (
                      <>
                        <Tooltip title="Onayla">
                          <IconButton 
                            size="small" 
                            onClick={() => handleApprove(user.id)}
                            sx={{ color: 'success.main' }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reddet">
                          <IconButton 
                            size="small" 
                            onClick={() => handleReject(user.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {user.rol !== 'admin' && (
                      <Tooltip title="Sil">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setUserToDelete(user);
                            setDeleteDialogOpen(true);
                          }}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        )
      )}

      {/* Tab 1: Onay Bekleyenler */}
      {tabValue === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {pendingUsers.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Onay bekleyen kullanıcı bulunmuyor
              </Typography>
            </Paper>
          ) : (
            pendingUsers.map((user) => (
              <Card key={user.id} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: { xs: 2, sm: 0 },
                  p: { xs: 1.5, sm: 2 },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, width: { xs: '100%', sm: 'auto' } }}>
                    <Avatar sx={{ bgcolor: '#FFA726', width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
                      {user.ad_soyad?.charAt(0) || 'U'}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }} noWrap>
                        {user.ad_soyad}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }} noWrap>
                        @{user.kullanici_adi}
                      </Typography>
                      {isMobile && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Kayıt: {new Date(user.created_at).toLocaleDateString('tr-TR')}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, width: { xs: '100%', sm: 'auto' } }}>
                    <Button
                      variant="contained"
                      color="success"
                      size={isMobile ? 'small' : 'medium'}
                      startIcon={<CheckCircleIcon sx={{ fontSize: isMobile ? '1rem' : undefined }} />}
                      onClick={() => handleApprove(user.id)}
                      sx={{ flex: { xs: 1, sm: 'initial' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Onayla
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size={isMobile ? 'small' : 'medium'}
                      startIcon={<CancelIcon sx={{ fontSize: isMobile ? '1rem' : undefined }} />}
                      onClick={() => handleReject(user.id)}
                      sx={{ flex: { xs: 1, sm: 'initial' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Reddet
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* Tab 2: Detaylı Aktivite Logları */}
      {tabValue === 2 && (
        <Box>
          {/* Filtreler */}
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Kullanıcı</InputLabel>
                <Select
                  value={logFilter.kullanici_id}
                  label="Kullanıcı"
                  onChange={(e) => setLogFilter({ ...logFilter, kullanici_id: e.target.value })}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>{user.ad_soyad}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>İşlem Tipi</InputLabel>
                <Select
                  value={logFilter.islem_tipi}
                  label="İşlem Tipi"
                  onChange={(e) => setLogFilter({ ...logFilter, islem_tipi: e.target.value })}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {islemTipleri.map((tip) => (
                    <MenuItem key={tip} value={tip}>{getIslemTipiLabel(tip)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadActivityLogs}
                disabled={loadingLogs}
              >
                Yenile
              </Button>
              
              <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                {activityLogs.length} kayıt gösteriliyor
              </Typography>
            </Box>
          </Paper>

          {loadingLogs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#04A7B8' }} />
            </Box>
          ) : isMobile ? (
            /* Mobile Card View */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {activityLogs.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">Henüz aktivite kaydı bulunmuyor</Typography>
                </Paper>
              ) : (
                activityLogs.map((log) => (
                  <Card key={log.id} sx={{ overflow: 'hidden' }}>
                    <CardContent sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <Box sx={{ flexShrink: 0, mt: 0.5 }}>
                          {getIslemTipiIcon(log.islem_tipi)}
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <Avatar sx={{ bgcolor: '#04A7B8', width: 24, height: 24, fontSize: '0.7rem' }}>
                              {log.kullanici_ad?.charAt(0) || '?'}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }} noWrap>
                              {log.kullanici_ad || 'Bilinmiyor'}
                            </Typography>
                          </Box>
                          <Chip 
                            label={getIslemTipiLabel(log.islem_tipi)} 
                            color={getIslemTipiColor(log.islem_tipi)}
                            size="small"
                            variant="outlined"
                            sx={{ height: '20px', fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Box>

                      {log.aciklama && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.8rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {log.aciklama}
                          </Typography>
                        </>
                      )}

                      <Divider sx={{ my: 1 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {new Date(log.created_at).toLocaleString('tr-TR')}
                        </Typography>
                        {log.ip_adresi && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {log.ip_adresi}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          ) : (
            /* Desktop Table View */
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell width={50}></TableCell>
                    <TableCell>Kullanıcı</TableCell>
                    <TableCell>İşlem</TableCell>
                    <TableCell>Açıklama</TableCell>
                    <TableCell>IP Adresi</TableCell>
                    <TableCell>Tarih/Saat</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activityLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography color="text.secondary">Henüz aktivite kaydı bulunmuyor</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    activityLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          {getIslemTipiIcon(log.islem_tipi)}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: '#04A7B8', width: 28, height: 28, fontSize: '0.75rem' }}>
                              {log.kullanici_ad?.charAt(0) || '?'}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600}>
                              {log.kullanici_ad || 'Bilinmiyor'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getIslemTipiLabel(log.islem_tipi)} 
                            color={getIslemTipiColor(log.islem_tipi)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.aciklama}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {log.ip_adresi || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {new Date(log.created_at).toLocaleString('tr-TR')}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Kullanıcı Aktivite Detay Dialog */}
      <Dialog 
        open={activityDialogOpen} 
        onClose={() => setActivityDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ bgcolor: '#036B74', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#36C5D3', width: 48, height: 48 }}>
              {selectedUser?.ad_soyad?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {selectedUser?.ad_soyad} - Aktivite Geçmişi
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                @{selectedUser?.kullanici_adi} • {selectedUser?.rol === 'admin' ? 'Yönetici' : 'Personel'}
              </Typography>
            </Box>
            <Chip 
              label={`${userActivities.length} Aktivite`} 
              sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
            />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: 0 }}>
          {userActivities.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
              <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aktivite Kaydı Bulunamadı
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bu kullanıcıya ait henüz bir aktivite kaydı bulunmuyor
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={50} sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}></TableCell>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>İşlem</TableCell>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Açıklama</TableCell>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>IP Adresi</TableCell>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Tarih/Saat</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userActivities.map((activity, index) => (
                    <TableRow 
                      key={activity.id} 
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: 'rgba(4, 167, 184, 0.05)' },
                        borderLeft: index === 0 ? '4px solid #04A7B8' : 'none',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          {getIslemTipiIcon(activity.islem_tipi)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getIslemTipiLabel(activity.islem_tipi)} 
                          color={getIslemTipiColor(activity.islem_tipi)}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 400 }}>
                          {activity.aciklama}
                        </Typography>
                        {activity.detaylar && Object.keys(activity.detaylar).length > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {activity.detaylar.fisNo && `Fiş: #${activity.detaylar.fisNo}`}
                            {activity.detaylar.musteriAdSoyad && ` • Müşteri: ${activity.detaylar.musteriAdSoyad}`}
                            {activity.detaylar.marka && activity.detaylar.modelTip && ` • ${activity.detaylar.marka} ${activity.detaylar.modelTip}`}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                          {activity.ip_adresi || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {new Date(activity.created_at).toLocaleDateString('tr-TR')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(activity.created_at).toLocaleTimeString('tr-TR')}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto' }}>
            Son {userActivities.length} aktivite gösteriliyor
          </Typography>
          <Button onClick={() => setActivityDialogOpen(false)} variant="contained" sx={{ bgcolor: '#036B74' }}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        fullScreen={isMobile}
      >
        <DialogTitle>Kullanıcıyı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{userToDelete?.ad_soyad}</strong> kullanıcısını silmek istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* İş Emirleri Dialog */}
      <Dialog 
        open={workOrdersDialogOpen} 
        onClose={() => setWorkOrdersDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ bgcolor: '#04A7B8', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {selectedUser?.ad_soyad} - İş Emirleri
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {selectedUser?.kullanici_adi}
            </Typography>
          </Box>
          <Chip 
            label={`${userWorkOrders.length} iş emri`} 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', ml: 'auto' }}
          />
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {userWorkOrders.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Bu kullanıcı henüz iş emri oluşturmamış
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: { xs: 800, sm: '100%' } }}>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Fiş No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Müşteri</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Araç</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Durum</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Gelir</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Kar</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Detay</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userWorkOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography fontWeight={700} color="primary.main">{order.fis_no}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(order.created_at).toLocaleDateString('tr-TR')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(order.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>{order.musteri_ad_soyad}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.telefon}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{order.marka} {order.model_tip}</Typography>
                        {order.km && <Typography variant="caption" color="text.secondary">{order.km} km</Typography>}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={order.durum === 'beklemede' ? 'Beklemede' : 'Tamamlandı'}
                          sx={{
                            bgcolor: order.durum === 'beklemede' ? '#fff3e0' : '#e8f5e9',
                            color: order.durum === 'beklemede' ? '#e65100' : '#2e7d32',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.gercek_toplam_ucret || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          fontWeight={700}
                          sx={{ color: parseFloat(order.kar) >= 0 ? '#2e7d32' : '#c62828' }}
                        >
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.kar || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Detayları Gör">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewWorkOrderDetail(order)}
                            sx={{ color: '#04A7B8' }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button onClick={() => setWorkOrdersDialogOpen(false)} variant="contained" sx={{ bgcolor: '#036B74' }}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* İş Emri Detay Dialog */}
      <Dialog 
        open={workOrderDetailOpen} 
        onClose={() => setWorkOrderDetailOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ bgcolor: '#04A7B8', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              İş Emri Detayı - Fiş No: {selectedWorkOrder?.fis_no}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {selectedWorkOrder?.musteri_ad_soyad}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedWorkOrder && (
            <Box>
              {/* Müşteri ve Araç Bilgileri */}
              <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                  <PersonIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>Müşteri Bilgileri</Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Ad Soyad:</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedWorkOrder.musteri_ad_soyad}</Typography>
                  <Typography variant="body2" color="text.secondary">Telefon:</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedWorkOrder.telefon || '-'}</Typography>
                </Box>
              </Card>

              <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                  <DirectionsCarIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>Araç Bilgileri</Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Marka:</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedWorkOrder.marka}</Typography>
                  <Typography variant="body2" color="text.secondary">Model:</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedWorkOrder.model_tip || '-'}</Typography>
                  <Typography variant="body2" color="text.secondary">KM:</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedWorkOrder.km ? `${selectedWorkOrder.km} km` : '-'}</Typography>
                </Box>
              </Card>

              {/* Arıza ve Açıklama */}
              <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Arıza/Şikayetler:</Typography>
                <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, whiteSpace: 'pre-wrap' }}>
                  {selectedWorkOrder.ariza_sikayetler || '-'}
                </Typography>
                {selectedWorkOrder.aciklama && (
                  <>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, mt: 2 }}>Açıklama:</Typography>
                    <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, whiteSpace: 'pre-wrap' }}>
                      {selectedWorkOrder.aciklama}
                    </Typography>
                  </>
                )}
              </Card>

              {/* Parçalar */}
              {selectedWorkOrder.parcalar && selectedWorkOrder.parcalar.length > 0 && (
                <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Parçalar ({selectedWorkOrder.parcalar.length})
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Parça Kodu</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Parça Adı</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>Adet</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Fiyat</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Maliyet</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Toplam</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedWorkOrder.parcalar.map((parca, index) => (
                          <TableRow key={index}>
                            <TableCell>{parca.parca_kodu || '-'}</TableCell>
                            <TableCell>{parca.takilan_parca}</TableCell>
                            <TableCell align="center">{parca.adet}</TableCell>
                            <TableCell align="right">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(parca.birim_fiyat)}
                            </TableCell>
                            <TableCell align="right">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(parca.maliyet)}
                            </TableCell>
                            <TableCell align="right">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(parca.adet * parca.birim_fiyat)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              )}

              {/* Finansal Özet */}
              <Card variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Finansal Özet</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Tahmini Ücret</Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(selectedWorkOrder.tahmini_toplam_ucret || 0)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Gerçek Gelir</Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#2e7d32' }}>
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(selectedWorkOrder.gercek_toplam_ucret || 0)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: selectedWorkOrder.kar >= 0 ? '#e8f5e9' : '#ffebee', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Net Kar</Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ color: selectedWorkOrder.kar >= 0 ? '#2e7d32' : '#c62828' }}>
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(selectedWorkOrder.kar || 0)}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button onClick={() => setWorkOrderDetailOpen(false)} variant="contained" sx={{ bgcolor: '#036B74' }}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Kullanicilar;

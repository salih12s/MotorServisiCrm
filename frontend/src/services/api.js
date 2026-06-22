import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Görsel URL'si. version (örn. updated_at) verilirse cache-busting için ?v= eklenir;
// böylece vitrin fotoğrafı değişince tarayıcı eski görseli değil yenisini yükler.
export const getPublicAksesuarImageUrl = (id, version) => {
  const base = `${API_URL}/public/aksesuarlar/${id}/resim`;
  if (version == null || version === '') return base;
  const v = encodeURIComponent(new Date(version).getTime() || version);
  return `${base}?v=${v}`;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 durumunda logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  verify: () => api.get('/auth/verify'),
  getUsers: () => api.get('/auth/users'),
  approveUser: (id) => api.patch(`/auth/users/${id}/approve`),
  rejectUser: (id) => api.patch(`/auth/users/${id}/reject`),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
  updateAksesuarYetkisi: (id, aksesuar_yetkisi) => api.patch(`/auth/users/${id}/aksesuar-yetkisi`, { aksesuar_yetkisi }),
  updateMotorSatisYetkisi: (id, motor_satis_yetkisi) => api.patch(`/auth/users/${id}/motor-satis-yetkisi`, { motor_satis_yetkisi }),
  getUserActivities: (id) => api.get(`/auth/users/${id}/activities`),
  getUserActivityLogs: (id, limit = 100) => api.get(`/auth/users/${id}/activity-logs?limit=${limit}`),
  getUserWorkOrders: (id) => api.get(`/auth/user-work-orders/${id}`),
  getAllActivities: () => api.get('/auth/activities'),
  getAllActivityLogs: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.islem_tipi) queryParams.append('islem_tipi', params.islem_tipi);
    if (params.kullanici_id) queryParams.append('kullanici_id', params.kullanici_id);
    return api.get(`/auth/activity-logs?${queryParams.toString()}`);
  },
  getPrintSettings: () => api.get('/auth/print-settings'),
  savePrintSettings: (ayarlar) => api.post('/auth/print-settings', { ayarlar }),
};

// Müşteriler
export const musteriService = {
  getAll: () => api.get('/musteriler'),
  getById: (id) => api.get(`/musteriler/${id}`),
  create: (data) => api.post('/musteriler', data),
  update: (id, data) => api.put(`/musteriler/${id}`, data),
  delete: (id) => api.delete(`/musteriler/${id}`),
  search: (query) => api.get(`/musteriler/ara/${query}`),
};

// İş Emirleri
export const isEmriService = {
  getAll: (params) => api.get('/is-emirleri', { params }),
  getById: (id) => api.get(`/is-emirleri/${id}`),
  create: (data) => api.post('/is-emirleri', data),
  update: (id, data) => api.put(`/is-emirleri/${id}`, data),
  delete: (id) => api.delete(`/is-emirleri/${id}`),
  tamamla: (id) => api.patch(`/is-emirleri/${id}/tamamla`),
  addParca: (id, data) => api.post(`/is-emirleri/${id}/parcalar`, data),
  deleteParca: (id, parcaId) => api.delete(`/is-emirleri/${id}/parcalar/${parcaId}`),
};

// Raporlar
export const raporService = {
  getGunluk: (tarih) => api.get('/raporlar/gunluk', { params: { tarih } }),
  getAralik: (baslangic, bitis) => api.get('/raporlar/aralik', { params: { baslangic, bitis } }),
  getGenel: () => api.get('/raporlar/genel'),
  getFisKar: (baslangic, bitis) => api.get('/raporlar/fis-kar', { params: { baslangic, bitis } }),
  getIsEmriDetay: (id) => api.get(`/raporlar/is-emri/${id}`),
  // Aksesuar raporları
  getAksesuarAralik: (baslangic, bitis) => api.get('/raporlar/aksesuar/aralik', { params: { baslangic, bitis } }),
  getAksesuarDetay: (id) => api.get(`/raporlar/aksesuar/${id}`),
};

// Giderler
export const giderService = {
  getAll: (params) => api.get('/giderler', { params }),
  create: (data) => api.post('/giderler', data),
  update: (id, data) => api.put(`/giderler/${id}`, data),
  delete: (id) => api.delete(`/giderler/${id}`),
};

// Aksesuarlar
export const aksesuarService = {
  getAll: () => api.get('/aksesuarlar'),
  getById: (id) => api.get(`/aksesuarlar/${id}`),
  create: (data) => api.post('/aksesuarlar', data),
  update: (id, data) => api.put(`/aksesuarlar/${id}`, data),
  delete: (id) => api.delete(`/aksesuarlar/${id}`),
  getStats: () => api.get('/aksesuarlar/stats/genel'),
};

// Aksesuar Stok
export const aksesuarStokService = {
  getAll: (params) => api.get('/aksesuar-stok', { params }),
  getById: (id) => api.get(`/aksesuar-stok/${id}`),
  search: (q) => api.get('/aksesuar-stok/ara', { params: { q } }),
  create: (data) => api.post('/aksesuar-stok', data),
  update: (id, data) => api.put(`/aksesuar-stok/${id}`, data),
  delete: (id) => api.delete(`/aksesuar-stok/${id}`),
  topluEkle: (stoklar) => api.post('/aksesuar-stok/toplu', { stoklar }),
  // Public (giriş gerektirmeyen) aksesuar satış kataloğu
  getPublic: (params) => api.get('/public/aksesuarlar', { params }),
  getPublicById: (id) => api.get(`/public/aksesuarlar/${id}`),
};

// Motor Satışları
export const motorSatisService = {
  // Satışlar
  getAll: () => api.get('/motor-satislari'),
  getById: (id) => api.get(`/motor-satislari/${id}`),
  create: (data) => api.post('/motor-satislari', data),
  update: (id, data) => api.put(`/motor-satislari/${id}`, data),
  delete: (id) => api.delete(`/motor-satislari/${id}`),
  getStats: () => api.get('/motor-satislari/stats/ozet'),
  
  // Motor Modelleri
  getModeller: () => api.get('/motor-satislari/modeller'),
  createModel: (data) => api.post('/motor-satislari/modeller', data),
  updateModel: (id, data) => api.put(`/motor-satislari/modeller/${id}`, data),
  deleteModel: (id) => api.delete(`/motor-satislari/modeller/${id}`),
};

export default api;

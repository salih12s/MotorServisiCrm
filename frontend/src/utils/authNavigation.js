export const getDefaultAuthenticatedPath = (user) => {
  if (!user || user.role === 'admin') {
    return '/is-emirleri';
  }

  if (user.aksesuar_yetkisi) {
    return '/aksesuarlar';
  }

  if (user.motor_satis_yetkisi) {
    return '/motor-satislari';
  }

  if (user.yedek_parca_yetkisi) {
    return '/yedek-parca-satis';
  }

  return '/is-emirleri';
};

export const hasAuthenticatedPermission = (user, permissionField) => Boolean(
  user && (user.role === 'admin' || user[permissionField])
);

const buildServiceVisibility = (user, alias = 'ie', parameterIndex = 1) => {
  if (user?.rol === 'admin') {
    return { condition: null, params: [] };
  }

  const userId = Number(user?.id);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return { condition: 'FALSE', params: [] };
  }

  return {
    condition: `(${alias}.olusturan_kullanici_id = $${parameterIndex} OR LOWER(BTRIM(COALESCE(${alias}.olusturan_kisi, ''))) = 'ortak')`,
    params: [userId],
  };
};

module.exports = { buildServiceVisibility };

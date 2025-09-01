export const setTokens = (accessToken: string, refreshToken: string, accessTokenExpiry: string, refreshTokenExpiry: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('accessTokenExpiry', accessTokenExpiry);
  localStorage.setItem('refreshTokenExpiry', refreshTokenExpiry);
};

export const getTokens = () => {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null, accessTokenExpiry: null, refreshTokenExpiry: null };
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    accessTokenExpiry: localStorage.getItem('accessTokenExpiry'),
    refreshTokenExpiry: localStorage.getItem('refreshTokenExpiry')
  };
};

export const removeTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('accessTokenExpiry');
  localStorage.removeItem('refreshTokenExpiry');
};

export const setCurrentOrgId = (orgId: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('currentOrgId', orgId);
};

export const getCurrentOrgId = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('currentOrgId');
};

export const removeCurrentOrgId = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('currentOrgId');
};
export const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const getTokens = () => {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
  };
};

export const removeTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
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
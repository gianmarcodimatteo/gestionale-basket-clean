export const useUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return {
    role: user.role || 'VIEWER',
    isAdmin: user.role === 'ADMIN',
    isEditor: user.role === 'EDITOR' || user.role === 'ADMIN',
    isViewer: user.role === 'VIEWER',
  };
};

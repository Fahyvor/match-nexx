import { Outlet } from 'react-router-dom';

const ProtectedRoute = ({ role }: { role?: string }) => {
  // Implementation for protected route logic
  const isAuthenticated = !!localStorage.getItem('token');
  
  if (!isAuthenticated) {
    return <div>Please log in to access this route.</div>;
  }

  if (role && localStorage.getItem('userRole') !== role) {
    return <div>You don't have permission to access this route.</div>;
  }

  return <Outlet />
}

export default ProtectedRoute
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const ProtectedRoutes = ({ requiredRoleId }) => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const isLoggedIn = currentUser && currentUser.user_id !== undefined && currentUser.user_id !== null;

  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  const isAuthorized = isLoggedIn && currentUser.role_id >= requiredRoleId;

  if (!isAuthorized) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
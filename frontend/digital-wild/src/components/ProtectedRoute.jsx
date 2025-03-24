// components/ProtectedRoute.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';  // Проверьте путь

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(useAuth);

  if (user === undefined) {
    return <div>Загрузка...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
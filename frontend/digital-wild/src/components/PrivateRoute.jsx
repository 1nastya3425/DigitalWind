import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

// PrivateRoute.js
const PrivateRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/profile', { withCredentials: true });
        setIsAdmin(res.data.is_admin);
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  if (loading) {
    return <div className="loader">Проверка прав...</div>;
  }

  return isAdmin ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './authContext'
import './Header.css';

const Header = () => {
  const { isAuthenticated, isAdmin, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <div className="loader">Загрузка...</div>;

  return (
    <header>
      <div className="header-container">
        <div className="logo-section">
          <img 
            src="../../images/logo.png" 
            alt="Logo" 
            className="logo"
          />
          <h1 className="title">ИСКУССТВО БУДУЩЕГО</h1>
        </div>
        <nav className="nav-links">
          <ul>
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                Главная
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/events" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                Мероприятия
              </NavLink>
            </li>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <li>
                    <NavLink 
                      to="/admin" 
                      className={({ isActive }) => 
                        `nav-link admin-link ${isActive ? 'active' : ''}`
                      }
                    >
                      Админ-панель
                    </NavLink>
                  </li>
                )}
                
                {isAdmin && (
                  <li>
                    <NavLink
                    to="/moderationpanel"
                    className={({isActive}) =>
                      `nav-link admin-link ${isActive ? 'active' : ''}`
                    }
                    >Мод-панель</NavLink>
                  </li>
                )}

                <li>
                  <NavLink 
                    to="/account" 
                    className={({ isActive }) => 
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                  >
                    Аккаунт
                  </NavLink>
                </li>
                <li>
                  <button 
                    className="logout-btn"
                    onClick={async () => {
                      await logout(); // Выход с обновлением состояния
                      navigate('/');
                    }}
                  >
                    Выйти
                  </button>
                </li>
              </>
            ) : (
              <li>
                <NavLink 
                  to="/login" 
                  className={({ isActive }) => 
                    `login ${isActive ? 'active' : ''}`
                  }
                >
                  Войти
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
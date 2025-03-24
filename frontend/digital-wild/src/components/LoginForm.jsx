import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './authContext';
import './LoginForm.css';

const LoginForm = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsLoading(true);
    let isValid = true;

    // Валидация логина
    if (username.trim() === '') {
      setUsernameError('Введите логин');
      isValid = false;
    } else {
      if (username.length < 3) {
        setUsernameError('Логин должен быть не короче 3 символов');
        isValid = false;
      } else if (username.length > 20) {
        setUsernameError('Логин должен быть не длиннее 20 символов');
        isValid = false;
      } else if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(username)) {
        setUsernameError('Логин должен начинаться с буквы и содержать только буквы/цифры');
        isValid = false;
      }
    }

    // Валидация пароля
    if (password.trim() === '') {
      setPasswordError('Введите пароль');
      isValid = false;
    } else {
      if (password.length < 6) {
        setPasswordError('Пароль должен быть не короче 6 символов');
        isValid = false;
      } else if (password.length > 20) {
        setPasswordError('Пароль должен быть не длиннее 20 символов');
        isValid = false;
      }
    }

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      await login({ username, password });
      setMessage({ type: 'success', text: 'Успешный вход' });
      setTimeout(() => navigate('/account'), 1000);
    } catch (error) {
      setMessage({
        type: 'error', 
        text: error.response?.data?.error || 'Ошибка входа'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <h2 className="auth-title">Вход в систему</h2>
        
        {message.text && (
          <div className={`message ${message.type}-message`}>
            {message.text}
          </div>
        )}
        {usernameError && <div className="error-message">{usernameError}</div>}
        {passwordError && <div className="error-message">{passwordError}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError('');
              }}
              required
              className="auth-input"
            />
          </div>

          <div className="auth-input-group">
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              required
              className="auth-input"
            />
          </div>

          <button 
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <div className="auth-footer">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
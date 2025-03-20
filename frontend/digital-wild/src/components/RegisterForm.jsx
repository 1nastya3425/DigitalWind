import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'; // Используем общий CSS с формой входа

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
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

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      setConfirmPasswordError('Пароли не совпадают');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(
        'http://localhost:3000/api/register',
        { username, password },
        { withCredentials: true }
      );
      setMessage({ type: 'success', text: 'Регистрация успешна! Перенаправляем...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Ошибка: ${error.response?.data?.message || 'Сервис недоступен'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <h2>Регистрация</h2>

        {message.text && (
          <div className={`message ${message.type}-message`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
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
            {usernameError && <div className="error-message">{usernameError}</div>}
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
            {passwordError && <div className="error-message">{passwordError}</div>}
          </div>

          <div className="auth-input-group">
            <input
              type="password"
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError('');
              }}
              required
              className="auth-input"
            />
            {confirmPasswordError && (
              <div className="error-message">{confirmPasswordError}</div>
            )}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
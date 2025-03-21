import { useEffect, useState } from 'react';
import { useAuth } from './authContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  const handleImageSelect = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setErrorMessage('Заполните обязательные поля');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    if (selectedImage) formData.append('image', selectedImage);

    try {
      const response = await axios.post('http://localhost:3000/api/posts', formData, {
        withCredentials: true,
        headers: { 
          'Content-Type': 'multipart/form-data' // Убедитесь, что это указано
        }
      });
      
      setTitle('');
      setContent('');
      setCategory('');
      setSelectedImage(null);
      setImagePreview('');
      setSuccessMessage('Пост отправлен на модерацию');
    } catch (error) {
      if (error.response) {
        // Сервер вернул ошибку
        setErrorMessage(`Ошибка: ${error.response.data.error}`);
      } else if (error.request) {
        // Запрос не дошел до сервера
        setErrorMessage('Сервер недоступен. Проверьте подключение');
      } else {
        // Ошибка настройки запроса
        setErrorMessage('Ошибка: ' + error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-card">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="profile-avatar">
          <img src={user.avatarUrl} alt="Avatar" />
          <div className="profile-name">{user.fullName}</div>
        </div>
        <nav>
          <ul>
            <div className='sidebar-option '>
              <li>
                <a href="/account" className={location.pathname === '/account' ? 'active-link' : ''}>Аккаунт</a>
              </li>
              <li>
                <a href="/projects" className={location.pathname === '/projects' ? 'active-link' : ''}>Мои проекты</a>
              </li>
              <li>
                <a href="/create-post" className={location.pathname === '/create-post' ? 'active-link' : ''}>Создать пост</a>
              </li>
            </div>
            <li><button onClick={handleLogout} className='logout-acc'>Выйти</button></li>
          </ul>
        </nav>
      </div>
      <div className="profile-content">
        <h3>Аккаунт</h3>
        <div className="account-info">
          <p><strong>ФИО:</strong> {user.fullName}</p>
          <p><strong>Дата рождения:</strong> {user.birthDate}</p>
          <p><strong>Место обучения:</strong> {user.educationPlace}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
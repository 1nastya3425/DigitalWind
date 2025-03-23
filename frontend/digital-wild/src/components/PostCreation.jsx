import { useEffect, useState } from 'react';
import { useAuth } from './authContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PostCreation.css';

const PostCreation = () => {
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
      <div className="profile-section">
        <h3>Личный Кабинет</h3>
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <img src={user?.avatarUrl || '../images/default-avatar.png'} alt="Avatar" />
            <div className="profile-name">{user?.fullName || "@"+user?.username}</div>
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
              <li><button onClick={handleLogout} className='logout-acc'>Выйти...</button></li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="content-container">
        <h3>Создать новый пост</h3>
          {successMessage && <div className="success-message">{successMessage}</div>}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
            
          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-group">
              <label>Заголовок *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Содержимое *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Категория</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Выберите категорию</option>
                <option value="спорт">Спорт</option>
                <option value="наука">Наука</option>
                <option value="искусство">Искусство</option>
                <option value="технологии">Технологии</option>
                <option value="отдых">Отдых</option>
              </select>
            </div>

            <div className="form-group">
              <label>Изображение</label>
              <input
                type="file"
                onChange={handleImageSelect}
                accept="image/*"
              />
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="image-preview"
                />
              )}
            </div>

            <button type="submit" className="submit-btn">
              {user.is_admin ? 'Опубликовать' : 'Отправить на модерацию'}
            </button>
          </form>
        </div>
    </div>
  );
};

export default PostCreation;
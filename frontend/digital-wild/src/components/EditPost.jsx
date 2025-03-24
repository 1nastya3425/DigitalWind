import { useEffect, useState } from 'react';
import { useAuth } from './authContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditPost.css';

const EditPost = () => {
  const { user } = useAuth();
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: null
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

// В useEffect
useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://185.119.59.54:5000/api/posts/${postId}`, {
          withCredentials: true
        });
        
        // Проверка существования поста
        if (!response.data) {
          throw new Error('Пост не найден');
        }
  
        setPost(response.data);
        setFormData({
          title: response.data.title,
          content: response.data.content,
          category: response.data.category,
          image: response.data.image
        });
      } catch (error) {
        // Обработка ошибок
        if (error.response?.status === 404) {
          setError('Пост не найден');
        } else if (error.message.includes('403')) {
          setError('У вас нет прав для редактирования этого поста');
        } else {
          setError('Ошибка загрузки: ' + error.message);
        }
        setTimeout(() => navigate('/projects'), 3000);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (postId) fetchPost();
  }, [postId, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      } else if (formData.image) {
        formDataToSend.append('image', formData.image); // Сохраняем старый путь
      }

      await axios.put(
        `http://185.119.59.54:5000/api/posts/${postId}`,
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      navigate('/projects');
    } catch (error) {
      if (error.response?.status === 403) {
        setError('Доступ запрещен. Вы не являетесь автором поста.');
      } else if (error.response?.status === 404) {
        setError('Пост не найден');
      } else {
        setError('Ошибка сохранения: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      image: file || formData.image // Сохраняем старый путь если файл не выбран
    });
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button 
          className="back-btn" 
          onClick={() => navigate('/projects')}
        >
          Вернуться к проектам
        </button>
      </div>
    );
  }

  if (isLoading || !post) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="edit-post-container">
      <h3>Редактирование проекта</h3>
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label>Заголовок</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Содержание</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Категория</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Изображение</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
          />
          {formData.image && (
            <img
              src={typeof formData.image === 'string' 
                ? `http://185.119.59.54:5000${formData.image}`
                : URL.createObjectURL(formData.image)
              }
              alt="Preview"
              className="image-preview"
            />
          )}
        </div>
        <button type="submit" className="submit-btn">
          Сохранить изменения
        </button>
      </form>
    </div>
  );
};

export default EditPost;

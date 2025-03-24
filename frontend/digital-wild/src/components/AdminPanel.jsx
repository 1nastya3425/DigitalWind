import { useState, useEffect } from 'react';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null); // Новое состояние для изображения
  const [editingPost, setEditingPost] = useState(null); // Состояние для редактируемого поста
  const [newPostCategory, setNewPostCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // Для отображения ошибок
  // const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://185.119.59.54:5000/api',
    withCredentials: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, postsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/posts'),
        ]);
        setUsers(usersRes.data);
        setPosts(postsRes.data);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const handleCreatePost = async () => {
    setError(''); // Сбрасываем ошибку перед отправкой
    if (!newPostTitle || !newPostContent) {
      setError('Заполните все поля');
      return;
    }

    const formData = new FormData();
    formData.append('title', newPostTitle);
    formData.append('content', newPostContent);
    formData.append('category', newPostCategory);
    if (newPostImage) {
      formData.append('image', newPostImage);
    }

    try {
      const res = await api.post('/admin/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPosts([res.data, ...posts]); // Добавляем новый пост в начало списка
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImage(null);
    } catch (error) {
      setError('Ошибка создания поста. Попробуйте снова.');
      console.error('Ошибка создания поста:', error);
    }
  };


  const toggleAdmin = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      await api.put(`/admin/users/${userId}`, { is_admin: !user.is_admin });
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, is_admin: !user.is_admin } : u
        )
      );
    } catch (error) {
      console.error('Ошибка изменения прав:', error);
      setError('Ошибка при изменении прав пользователя');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Удалить пользователя?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
        setError('Ошибка при удалении пользователя');
      }
    }
  };

  // ФУНКЦИЯ УДАЛЕНИЯ ПОСТА
  const deletePost = async (postId) => {
    if (window.confirm('Удалить пост?')) {
      try {
        await api.delete(`/admin/posts/${postId}`);
        setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      } catch (error) {
        console.error('Ошибка удаления поста:', error);
        setError('Ошибка при удалении поста');
      }
    }
  };
  // Начало редактирования поста
  const startEditPost = (post) => {
    setEditingPost(post);
    setNewPostTitle(post.title); // Заполняем форму текущими данными
    setNewPostContent(post.content);
    setNewPostCategory(post.category);
    setNewPostImage(null); // Очищаем поле изображения
  };

  // Сохранение изменений
  const handleSaveEdit = async () => {
    setError(''); // Сбрасываем ошибку перед отправкой
    if (!newPostTitle || !newPostContent) {
      setError('Заполните все поля');
      return;
    }

    const formData = new FormData();
    formData.append('title', newPostTitle);
    formData.append('content', newPostContent);
    formData.append('category', newPostCategory);
    if (newPostImage) {
      formData.append('image', newPostImage);
    }

    try {
      const res = await api.put(`/admin/posts/${editingPost.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Обновляем пост в списке
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === editingPost.id
            ? { ...p, title: newPostTitle, content: newPostContent, image: res.data.image }
            : p,
        ),
      );

      // Очищаем состояние редактирования
      setEditingPost(null);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImage(null);
    } catch (error) {
      setError('Ошибка редактирования поста. Попробуйте снова.');
      console.error('Ошибка редактирования поста:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-bg">
        <div className="admin-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-bg">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Админ-панель</h1>
        </div>

        {/* Секция пользователей */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">Пользователи</div>
          </div>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Админ</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={user.is_admin}
                        onChange={() => toggleAdmin(user.id)}
                      />
                    </td>
                    <td className="actions">
                      <button
                        className="button button--danger"
                        onClick={() => deleteUser(user.id)}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Секция постов */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">Посты</div>
          </div>

          {/* Форма создания/редактирования поста */}
          <div className="post-create-form">
            <h2>{editingPost ? 'Редактировать пост' : 'Создать новый пост'}</h2>
            {error && <div className="error-message">{error}</div>}
            <select
              value={newPostCategory}
              onChange={(e) => setNewPostCategory(e.target.value)}
              className="category-select"
            >
              <option value="">Выберите категорию</option>
              <option value="спорт">Спорт</option>
              <option value="наука">Наука</option>
              <option value="искусство">Искусство</option>
              <option value="технологии">Технологии</option>
            </select>
            <input
              type="text"
              placeholder="Заголовок"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
            />
            <textarea
              placeholder="Содержание"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewPostImage(e.target.files[0])}
            />
            <button
              className="button button--primary"
              onClick={editingPost ? handleSaveEdit : handleCreatePost}
            >
              {editingPost ? 'Сохранить изменения' : 'Создать пост'}
            </button>
            {editingPost && (
              <button
                className="button button--secondary"
                onClick={() => {
                  setEditingPost(null);
                  setNewPostTitle('');
                  setNewPostContent('');
                  setNewPostImage(null);
                }}
              >
                Отмена
              </button>
            )}
          </div>

          {/* Список постов */}
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              {post.image && <img src={`../../images/default-image.png`} alt="Пост" className="post-image" />}
              <div className="post-header">
                <h3 className="post-title">{post.title}</h3>
              </div>
              <div className="post-content">{post.content}</div>
              <div className="post-actions">
                <button
                  className="button button--primary"
                  onClick={() => startEditPost(post)}
                >
                  Редактировать
                </button>
                <button
                  className="button button--danger"
                  onClick={() => deletePost(post.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

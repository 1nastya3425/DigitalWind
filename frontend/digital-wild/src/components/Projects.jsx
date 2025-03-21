import { useEffect, useState } from 'react';
import { useAuth } from './authContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Projects.css';

const Projects = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      if (!user) return;

      try {
        const response = await axios.get(`http://localhost:3000/api/posts/user/${user.id}`);
        
        if (isMounted) {
          const data = Array.isArray(response.data) ? response.data : [];
          setPosts(data);
        }
      } catch (error) {
        console.error('Ошибка загрузки постов:', error);
        setPosts([]);
      }
    };

    fetchPosts();

    return () => { isMounted = false };
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const handleResubmit = async (postId) => {
    try {
      await axios.put(
        `http://localhost:3000/api/posts/${postId}/resubmit`,
        {},
        { withCredentials: true }
      );
      
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, status: 'pending' } : post
        )
      );
    } catch (error) {
      console.error('Ошибка повторной отправки:', error);
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
          <img src={user?.avatarUrl || '/default-avatar.png'} alt="Avatar" />
          <div className="profile-name">{user?.fullName || user?.username}</div>
        </div>
        <nav>
          <ul>
            <div className='sidebar-option'>
              <li>
                <a href="/account" className={location.pathname === '/account' ? 'active-link' : ''}>
                  Аккаунт
                </a>
              </li>
              <li>
                <a href="/projects" className={location.pathname === '/projects' ? 'active-link' : ''}>
                  Мои проекты
                </a>
              </li>
              <li>
                <a href="/create-post" className={location.pathname === '/create-post' ? 'active-link' : ''}>
                  Создать пост
                </a>
              </li>
            </div>
            <li>
              <button onClick={handleLogout} className='logout-acc'>
                Выйти
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div className="profile-content">
        <h3>Мои проекты</h3>

        <div className="posts-list">
          {posts.length === 0 ? (
            <div className="no-posts">У вас пока нет проектов</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <h4>{post.title}</h4>
                  <span className={`status-badge ${post.status}`}>
                    {post.status === 'pending' && 'На модерации'}
                    {post.status === 'approved' && 'Одобрен'}
                    {post.status === 'rejected' && 'Отклонен'}
                  </span>
                </div>
                
                {post.image && (
                  <img
                    src={`http://localhost:3000${post.image}`}
                    alt={post.title}
                    className="post-image"
                  />
                )}

                <div className="post-content">
                  <div className="post-text">{post.content}</div>
                  <div className="post-category">
                    Категория: {post.category || 'Не указана'}
                  </div>
                </div>

                {post.status === 'rejected' && (
                  <div className="rejection-container">
                    <div className="rejection-reason">
                      Причина отказа: {post.rejection_reason || 'Не указана'}
                    </div>
                    <div className="action-buttons">
                      <button 
                        className="resubmit-btn"
                        onClick={() => handleResubmit(post.id)}
                      >
                        Повторная отправка
                      </button>
                      <a 
                        href={`/edit-post/${post.id}`}
                        className="edit-btn"
                      >
                        Редактировать
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
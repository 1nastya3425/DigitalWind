    import { useEffect, useState } from 'react';
    import axios from 'axios';
    import { useAuth } from './authContext';
    import { useNavigate } from 'react-router-dom';
    import './ModerationPanel.css';

    const ModerationPanel = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [editingPost, setEditingPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        if (!user?.is_admin) {
        navigate('/profile');
        }
        
        const fetchPendingPosts = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:3000/api/moderation/pending', {
            withCredentials: true
            });
            setPosts(response.data);
        } catch (error) {
            setError('Ошибка загрузки постов');
        } finally {
            setIsLoading(false);
        }
        };
        
        fetchPendingPosts();
    }, [user, navigate]);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
          setSelectedImage(e.target.files[0]);
          setEditingPost(prev => ({
            ...prev,
            image: URL.createObjectURL(e.target.files[0]) // Для предпросмотра
          }));
        }
      };
    
    const handleApprove = async (postId) => {
        try {
        await axios.post(
            `http://localhost:3000/api/moderation/approve/${postId}`,
            {},
            { withCredentials: true }
        );
        setPosts(posts.filter(post => post.id !== postId));
        } catch (error) {
        console.error('Ошибка одобрения:', error);
        }
    };

    const handleReject = async (postId) => {
        try {
        const reason = prompt('Укажите причину отклонения:');
        if (reason) {
            await axios.post(
            `http://localhost:3000/api/moderation/reject/${postId}`,
            { rejectionReason: reason },
            { withCredentials: true }
            );
            setPosts(posts.filter(post => post.id !== postId));
        }
        } catch (error) {
        console.error('Ошибка отклонения:', error);
        }
    };

    const handleEdit = (post) => {
        setEditingPost({ ...post });
    };

    const handleSave = async () => {
        try {
          const formData = new FormData();
          formData.append('title', editingPost.title);
          formData.append('content', editingPost.content);
          formData.append('category', editingPost.category);
          if (selectedImage) formData.append('image', selectedImage); // Добавляем файл
    
          await axios.patch(
            `http://localhost:3000/api/moderation/posts/${editingPost.id}`,
            formData,
            { 
              withCredentials: true,
              headers: { 'Content-Type': 'multipart/form-data' }
            }
          );
        setPosts(posts.map(p => 
            p.id === editingPost.id ? editingPost : p
        ));
        setEditingPost(null);
        } catch (error) {
        console.error('Ошибка сохранения:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
    };

    if (isLoading) return <div className="loader">Загрузка...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className='moderation'>            
        <div className="moderation-panel">
        <div className='moderation-title'>
                <h2>Модерация постов</h2>
                <p className='title-p'>Проекты на проверке</p>
            </div>
            <div className='moderation-container'>

        {/* Форма редактирования */}
        {editingPost && (
            <div className="edit-form">
            <h3>Редактирование поста</h3>
            <input
                value={editingPost.title}
                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                placeholder="Заголовок"
            />
            <textarea
                value={editingPost.content}
                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                placeholder="Содержимое"
            />
            <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
            />
            <select
                value={editingPost.category}
                onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
            >
                <option value="">Выберите категорию</option>
                <option value="спорт">Спорт</option>
                <option value="наука">Наука</option>
                <option value="искусство">Искусство</option>
                <option value="технологии">Технологии</option>
                <option value="отдых">Отдых</option>
            </select>
            <div className="edit-controls">
                <button onClick={handleSave}>Сохранить</button>
                <button onClick={handleCancelEdit}>Отмена</button>
            </div>
            </div>
        )}

{/* Список постов */}
{posts.map(post => (
    <div key={post.id} className="moderation-post">
        {post.image ? (
            <div className='post-image'>
                <img 
                    src={post.image.startsWith('http') ? post.image : `http://localhost:3000${post.image}`}
                    alt={post.title} 
                    className="post-image"
                />
            </div>
        ) : (
            <div className='post-image'>
                <img 
                    src="./images/default-image.png"
                    alt="Дефолтное изображение"
                    className="post-image"
                />
            </div>
        )}
        <div className="post-details">
            <h3>{post.title}</h3>
            <p className="status">Статус: {post.status}</p>
            <p className="author">Автор: {post.username}</p>
            <p className="content">{post.content}</p>
            <div className='btns'>
                <button 
                    className="approve-btn"
                    onClick={() => handleApprove(post.id)}
                >
                    <svg className="icon" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Принять
                </button>

                <button 
                    className="reject-btn"
                    onClick={() => handleReject(post.id)}
                >
                    <svg className="icon" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                    </svg>
                    Отклонить
                </button>

                <button 
                    className="edit-btn"
                    onClick={() => handleEdit(post)}
                >
                    <svg className="icon" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
))}
        </div>
        </div>
        </div>
    );
    };

    export default ModerationPanel;
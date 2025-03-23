// EventDetail.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './EventDetail.css';
import { useNavigate } from 'react-router-dom';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };
  

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`http://localhost:3000/api/events/${id}`,);
        setEvent(res.data);
      } catch (err) {
        console.error('Ошибка:', err);
        setError(err.response?.data?.error || 'Ошибка загрузки');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (isLoading) return <div className="loader">Загрузка...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="event-detail-page">
      <div className="event-container">
      <img 
          src={event.image ? `http://localhost:3000${event.image}` : '../../images/default-image.png'}
          alt={event.title} 
          className="detail-image"
          onError={(e) => {
            e.target.src = '../../images/default-image.png';
            e.target.style.objectFit = 'scale-down'; // Показывать иконку вместо растянутой картинки
          }}
        />
        
        <div className="detail-content">
          <h1 className="detail-title">{event.title || 'Без названия'}</h1>
          <p className="detail-category">{event.category || 'Без категории'}</p>
          <div 
            className="detail-description"
            dangerouslySetInnerHTML={{ __html: event.description || 'Описание отсутствует' }}
          />
          <p className="detail-date">
            Дата создания: {formatDate(event.created_at) || 'Неизвестно'}
          </p>


          <button onClick={() => navigate(-1)}>Назад</button>


        </div>
      </div>
    </div>
  );
};

export default EventDetail;
import { useEffect, useState } from 'react';
import axios from 'axios';
import './EventsList.css';
import { useNavigate } from 'react-router-dom';
const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    sort: 'newest',
    page: 1
  });
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState({});
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

  const handleReadMore = (eventId) => {
    navigate(`/event/${eventId}`); // Для v6
  };


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get('http://localhost:3000/api/events', {
          params: filters
        });
        setEvents(res.data.events);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error('Ошибка:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [filters]);

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    setExpandedEvents({}); // Сброс раскрытых карточек при смене страницы
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setExpandedEvents({}); // Сброс при изменении фильтров
  };;

  if (isLoading) return <div className="loader">Загрузка...</div>;

  return (
    <div className='pre-events'>
      <div className="events-list">
        <div className="header-section">
          <h3 className="events-title">ВСЕ МЕРОПРИЯТИЯ</h3>
          <div className="controls">
            <div className="filter-group">
              <label>Фильтр:</label>
              <select 
                name="category" 
                value={filters.category} 
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Все категории</option>
                <option value="спорт">Спорт</option>
                <option value="наука">Наука</option>
                <option value="искусство">Искусство</option>
                <option value="технологии">Технологии</option>
                <option value="отдых">Отдых</option>
              </select>
            </div>

            <div className="sort-group">
              <label>Сортировка:</label>
              <select 
                name="sort" 
                value={filters.sort} 
                onChange={handleFilterChange}
                className="sort-select"
              >
                <option value="newest">Новые первыми</option>
                <option value="oldest">Старые первыми</option>
                <option value="title_asc">А-Я</option>
                <option value="title_desc">Я-А</option>
              </select>
            </div>
          </div>
        </div>


        <div className="events-grid">
          {events.length > 0 ? (
            events.filter(event => event.status === 'approved').map(event => (
              <button className="event-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReadMore(event.id);
                }}
              >
                <div key={event.id} className="event">
                  <div className="event-img-container">
                    <img 
                      src={event.image ? `http://localhost:3000${event.image}` : '../../images/placeholder.png'} 
                      alt={event.title} 
                    />
                  </div>
                  <div className="event-details">
                    {/* Добавьте текстовый контент */}
                    <div className="event-card-top">
                      <p className="event-category">{event.category}</p>
                      <h3 className="event-title">{event.title}</h3>
                      <div className="event-description-wrapper">
                      <div 
                        className={`event-description ${expandedEvents[event.id] ? 'expanded' : ''}`}
                        dangerouslySetInnerHTML={{ __html: event.description }}
                      />
                      </div>
                    </div>
                    
                    {/* Основной проблемный блок */}
                    
                  <div className='foot'>                  
                    <p className="event-date">
                      <svg className="date-icon" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="#666" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                      {formatDate(event.created_at)}
                    </p>
                  </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            !isLoading && (
              <div className="no-posts-message">
                Мероприятий в этой категории не найдено
              </div>
            )
          )}
        </div>

        <div className="pagination">
          <button 
            className="pagination-btn"
            disabled={filters.page === 1}
            onClick={() => handlePageChange(filters.page - 1)}
          >
            Назад
          </button>
          
          <span className="pagination-info">
            Страница {filters.page} из {totalPages}
          </span>
          
          <button 
            className="pagination-btn"
            disabled={filters.page >= totalPages}
            onClick={() => handlePageChange(filters.page + 1)}
          >
            Вперед
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsList;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import './NewsSection.css';

const NewsSection = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/events')
      .then(response => {
        if (!response.ok) throw new Error('Ошибка загрузки новостей');
        return response.json();
      })
      .then(data => {
        setEvents(data.events);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Загрузка новостей...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="news">
      <section id="news">
        <Carousel>
          {events.map(event => (
            <Carousel.Item key={event.id}>
              <div className="carousel-card">
                <div className="carousel-image-container">
                  <img
                    src={`http://localhost:3000${event.image}`}
                    alt={event.title}
                    className="carousel-image"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.png';
                    }}
                  />
                </div>
                <div className="carousel-content">
                  <div className='carousel-text'>
                    <h3 className="carousel-title">{event.title}</h3>
                    <p className="carousel-description">
                      {event.description.length > 150 
                        ? `${event.description.slice(0, 150)}...` 
                        : event.description}
                    </p>
                  </div>
                  <button
                    className="carousel-button"
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    Подробнее
                  </button>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </section>
    </div>
  );
};

export default NewsSection;
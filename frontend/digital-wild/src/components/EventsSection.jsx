import React, { useEffect, useState } from 'react';
import './EventsSection.css';
import { useNavigate } from 'react-router-dom';

const EventsSection = () => {
  const [events, setEvents] = useState([]);

  const navigate = useNavigate();
  const handleReadMore = (eventId) => {
    navigate(`/event/${eventId}`); // Для v6
  };

  useEffect(() => {
    // Получаем последние 3 мероприятия
    fetch('http://localhost:3000/api/events?page=1&limit=3')
      .then(response => response.json())
      .then(data => setEvents(data.events))
      .catch(error => console.error('Ошибка загрузки мероприятий:', error));
  }, []);

  console.log('events', events);

  return (
    <section className="events-section">
      <h2 className="events-title">МЕРОПРИЯТИЯ</h2>
      <div className="events">
      {events.map(event => (
          <button className="event-button"
            onClick={(e) => {
              handleReadMore(event.id);
            }}
          >
            <div key={event.id} className="events-item">
              <div className="event-image-container">
              <img 
                src={`http://localhost:3000${event.image}`} 
                // alt={event.title} 
                className="event-image"
              />
              </div>
              <div className="events-details">
                <h3 className="event-title">{event.title}</h3>
                <p className="events-description">{event.content}</p>
              </div>
            </div>
          </button>
          ))}
      </div>
    </section>
  );
};

export default EventsSection;
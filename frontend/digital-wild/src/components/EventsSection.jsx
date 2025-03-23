import React, { useEffect, useState } from 'react';
import './EventsSection.css';

const EventsSection = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Получаем последние 3 мероприятия
    fetch('http://localhost:3000/api/events?page=1&limit=3')
      .then(response => response.json())
      .then(data => setEvents(data.events))
      .catch(error => console.error('Ошибка загрузки мероприятий:', error));
  }, []);

  return (
    <section className="events-section">
      <h2 className="events-title">МЕРОПРИЯТИЯ</h2>
      <div className="events">
        {events.map(event => (
          <div key={event.id} className="events-item">
            <div className="event-image-container">
            <img 
              src={`http://localhost:3000${event.image}`} 
              alt={event.title} 
              className="event-image"
            />
            </div>
            <div className="events-details">
              <h3 className="event-title">{event.title}</h3>
              <p className="events-description">{event.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EventsSection;
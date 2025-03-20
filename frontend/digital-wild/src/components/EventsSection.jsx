import React from 'react';
import './EventsSection.css';

const eventsData = [
  {
    image: "../images/people.png", // Используйте относительный путь
    title: "Мероприятие по уборке листьев",
    description: "Давайте убирать листья вместе! Вместе - мы сила! Тут должно быть больше текста, но у меня кончилась фантазия."
  },
  {
    image: "../images/people.png", // Используйте относительный путь
    title: "Разгульная масленица",
    description: "Время попрощаться с зимой! Тут должно быть больше текста, но у меня кончилась фантазия."
  },
  {
    image: "../images/people.png", // Используйте относительный путь
    title: "Мероприятие по уборке листьев",
    description: "Давайте убирать листья вместе! Вместе - мы сила! Тут должно быть больше текста, но у меня кончилась фантазия."
  }
];

const EventsSection = () => {
  return (
    <section className="events-section">
      <h2 className="events-title">МЕРОПРИЯТИЯ</h2>
      <div className="events">
        {eventsData.map((event, index) => (
          <div key={index} className="events-item">
            <div className="event-image-container">
              <img 
                src={event.image} 
                alt={event.title} 
                className="event-image"
              />
            </div>
            <div className="events-details">
              <h3 className="events-title">{event.title}</h3>
              <p className="events-description">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EventsSection;

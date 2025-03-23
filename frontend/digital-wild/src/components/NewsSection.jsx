import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import './NewsSection.css';

const NewsSection = () => {
  const navigate = useNavigate();

  // Данные для карусели
  const newsData = [
    {
      id: 1,
      title: "Шикарная новость о походе в какой-то музей",
      description:
        "Сайт, позволяющий поддержать социальные инициативы молодежи в области культуры, искусства и общественной деятельности.",
      image: "./images/people.png", // Путь к изображению
    },
    {
      id: 2,
      title: "Вторая новость о культурном событии",
      description:
        "Мероприятие, которое собирает талантливых людей для совместной работы над проектами.",
      image: "./images/people.png", // Путь к изображению
    },
    // Добавьте больше элементов по необходимости
  ];

  // Функция для перехода к детальной странице мероприятия
  const handleReadMore = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  return (
    <div className="news">
      <section id="news">
        <Carousel>
          {/* Создаем слайд для каждого элемента newsData */}
          {newsData.map((news, index) => (
            <Carousel.Item key={index}>
              <div className="carousel-card">
                {/* Изображение */}
                <div className="carousel-image-container">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="carousel-image"
                  />
                </div>
                {/* Содержимое карточки */}
                <div className="carousel-content">
                  <h3 className="carousel-title">{news.title}</h3>
                  <p className="carousel-description">{news.description}</p>
                  {/* Кнопка "Подробнее" */}
                  <button
                    className="carousel-button"
                    onClick={() => handleReadMore(news.id)}
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
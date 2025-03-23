import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './NewsSection.css';
import logo from '../../images/people.png';

const NewsSection = () => {
  const newsData = [
    {
      title: "Шикарная новость о походе в какой-то музей",
      description: "Сайт, позволяющий поддержать социальные инициативы молодежи в области культуры, искусства и общественной деятельности. Читать подробнее..."
    }
  ];

  const navigate = useNavigate();
  const handleReadMore = (eventId) => {
    navigate(`/event/${eventId}`); // Для v6
  };



  return (
    <div className='news'>
    <section id="news">

      <Carousel>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={logo}
          alt="Slide 1"
          onClick={(e) => {
            e.stopPropagation();
            handleReadMore(12);
          }}
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="./src/images/people.png"
          alt="Slide 2"
        />
      </Carousel.Item>
    </Carousel>

    <div className='data'>
      {newsData.map((news, index) => (
        <div key={index} className="news-item">
          <h3>{news.title}</h3>
          <div className='description'>
            <p>{news.description}</p>
          </div>
        </div>
      ))}
    </div>

    </section>
    </div>
  );
};

export default NewsSection;
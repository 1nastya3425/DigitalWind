import React from 'react';
import NewsSection from './NewsSection';
import EventsSection from './EventsSection';
import './MainContent.css';

const MainContent = () => {
  return (
    <main>
      <section className='news-section'> 
        <NewsSection />
      </section>
      <section className='events-section'>
        <EventsSection />
      </section>
    </main>
  );
};

export default MainContent;
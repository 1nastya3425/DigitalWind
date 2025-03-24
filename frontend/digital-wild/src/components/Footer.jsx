import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer>
      <div className='footer'>
        <h2 className='contacts'>Контакты</h2>
        <div className="social-media">
          <a href="#"><i className="fab fa-vk" /><img src="../../images/vk.png"></img></a>
          <a href="#"><i className="fab fa-youtube" /><img src="../../images/youtube.png"></img></a> 
          {/* ЮТУБ ИЛИ РУТУБ!!!! */}
          <a href="#"><i className="fab fa-telegram" /><img src="../../images/telegram.png"></img></a>
          <a href="#"><i className="fab fa-whatsapp" /><img src="../../images/whatsapp.png"></img></a>
        </div>
        <div className='number'>
          <h5>+7 (XXX) XXX-XX-XX</h5>
        </div>
        <p className='uni'>СГТУ им. Ю. А. Гагарина</p>
      </div>
    </footer>
  );
};

export default Footer;


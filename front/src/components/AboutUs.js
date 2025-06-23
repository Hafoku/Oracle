import React, { useEffect, useRef } from 'react';
import './App.css';
import Header from './Header';
import Footer from './Footer';
import { FaCheckCircle, FaHistory, FaMedkit, FaUsers, FaHandshake, FaAward } from 'react-icons/fa';

const YANDEX_MAP_API_KEY = process.env.REACT_APP_YANDEX_MAP;

const YandexMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!YANDEX_MAP_API_KEY) return;
    // Проверяем, был ли уже загружен скрипт
    if (!window.ymaps) {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_MAP_API_KEY}&lang=ru_RU`;
      script.type = 'text/javascript';
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }
    function initMap() {
      window.ymaps.ready(() => {
        if (mapRef.current && !mapRef.current.hasMap) {
          const map = new window.ymaps.Map(mapRef.current, {
            center: [51.169392, 71.449074], // Астана, Казахстан
            zoom: 14,
            controls: ['zoomControl', 'fullscreenControl']
          });
          map.geoObjects.add(new window.ymaps.Placemark([51.169392, 71.449074], {
            balloonContent: 'Oracle Pharmacy',
            hintContent: 'Oracle Pharmacy'
          }, {
            preset: 'islands#icon',
            iconColor: '#4CAF50'
          }));
          mapRef.current.hasMap = true;
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ width: '100%', height: '350px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(44,62,80,0.08)', margin: '0 auto' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

const AboutUs = () => {
  return (
    <div className="oracle-page-wrapper">
      {/* Hero Section */}
      <div className="oracle-hero">
        <div className="oracle-hero-overlay"></div>
        <div className="oracle-hero-content">
          <h1 className="oracle-hero-title">О нашей <span className="oracle-text-highlight">аптеке</span></h1>
          <p className="oracle-hero-description">
            Мы заботимся о здоровье каждого клиента, предлагая качественные лекарства и профессиональные консультации
          </p>
        </div>
      </div>

      <div className="oracle-container">
        {/* О компании */}
        <section className="oracle-section-2">
          <div className="oracle-card">
            <h2 className="oracle-title">Oracle Pharmacy</h2>
            <p className="oracle-mb-3">
              Аптечная сеть Oracle – это современная фармацевтическая компания, которая предлагает широкий ассортимент лекарственных препаратов, медицинских изделий, товаров для здоровья и красоты. Мы работаем на фармацевтическом рынке с заботой о здоровье наших клиентов, обеспечивая высокое качество обслуживания и доступные цены.
            </p>
            <p>
              Наши фармацевты имеют высокую квалификацию и всегда готовы предоставить профессиональную консультацию по выбору и применению лекарственных средств. Мы стремимся создать комфортную и доверительную атмосферу для каждого клиента.
            </p>
          </div>
        </section>

        {/* Миссия и Видение */}
        <section className="oracle-section-2">
          <div className="oracle-row">
            <div className="oracle-col">
              <div className="oracle-card">
                <div className="oracle-card-icon">
                  <FaMedkit />
                </div>
                <h2 className="oracle-card-title">Миссия</h2>
                <p>
                  Наша миссия – обеспечивать людей качественными лекарственными препаратами и медицинскими товарами, способствуя улучшению качества жизни и здоровья населения. Мы стремимся сделать фармацевтическую помощь доступной, профессиональной и ориентированной на потребности каждого клиента.
                </p>
              </div>
            </div>

            <div className="oracle-col">
              <div className="oracle-card">
                <div className="oracle-card-icon">
                  <FaAward />
                </div>
                <h2 className="oracle-card-title">Видение</h2>
                <p>
                  Стать ведущей аптечной сетью, которая устанавливает стандарты качества фармацевтических услуг, внедряет инновационные технологии и создает новые подходы в обслуживании клиентов, заботясь о здоровье каждого человека.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Наши ценности */}
        <section className="oracle-section-2">
          <h2 className="oracle-title oracle-text-center oracle-mb-4">Наши ценности</h2>
          <div className="oracle-row">
            <div className="oracle-col">
              <div className="oracle-card oracle-text-center">
                <div className="oracle-feature-icon">
                  <FaCheckCircle />
                </div>
                <h3 className="oracle-card-title">Качество</h3>
                <p>Мы гарантируем качество всех лекарственных препаратов и товаров, представленных в наших аптеках</p>
              </div>
            </div>
            <div className="oracle-col">
              <div className="oracle-card oracle-text-center">
                <div className="oracle-feature-icon">
                  <FaUsers />
                </div>
                <h3 className="oracle-card-title">Забота о клиентах</h3>
                <p>Индивидуальный подход к каждому клиенту и его потребностям – основа нашей работы</p>
              </div>
            </div>
            <div className="oracle-col">
              <div className="oracle-card oracle-text-center">
                <div className="oracle-feature-icon">
                  <FaHandshake />
                </div>
                <h3 className="oracle-card-title">Доверие</h3>
                <p>Мы строим долгосрочные отношения с клиентами на основе честности и прозрачности</p>
              </div>
            </div>
          </div>
        </section>

        {/* История компании */}
        <section className="oracle-section-2">
          <div className="oracle-card">
            <div className="oracle-card-icon">
              <FaHistory />
            </div>
            <h2 className="oracle-card-title">История компании</h2>
            <p className="oracle-mb-3">
              Аптечная сеть Oracle была основана в 2015 году с открытия первой аптеки в городе Астана. За эти годы мы выросли до сети аптек, представленных в разных районах города.
            </p>
            <p className="oracle-mb-3">
              Наша компания постоянно развивается, внедряя современные технологии обслуживания клиентов, расширяя ассортимент и повышая квалификацию сотрудников. Мы гордимся тем, что за годы работы приобрели репутацию надежной аптечной сети с высоким уровнем сервиса.
            </p>
          </div>
        </section>

        {/* Руководство */}
        <section className="oracle-section-2">
          <div className="oracle-card">
            <h2 className="oracle-card-title">Руководство</h2>
            <div className="oracle-mb-3">
              <p><strong>Генеральный директор:</strong> Каптагаева Айгуль Кайратовна</p>
              <p>Фармацевт высшей категории с 15-летним опытом работы в фармацевтической отрасли</p>
            </div>
          </div>
        </section>

        {/* Партнеры */}
        <section className="oracle-section-2">
          <div className="oracle-card">
            <h2 className="oracle-card-title">Наши партнеры</h2>
            <ul className="oracle-mb-3">
              <li>Ведущие фармацевтические производители Казахстана и зарубежных стран</li>
              <li>Медицинские центры и клиники города Астана</li>
              <li>Страховые компании, предоставляющие услуги медицинского страхования</li>
              <li>Благотворительные организации, поддерживающие социально уязвимые группы населения</li>
            </ul>
          </div>
        </section>

        {/* Сертификаты и лицензии */}
        <section className="oracle-section-2">
          <div className="oracle-card">
            <h2 className="oracle-card-title">Сертификаты и лицензии</h2>
            <p className="oracle-mb-3">
              Все аптеки сети Oracle имеют необходимые лицензии на фармацевтическую деятельность и сертификаты соответствия стандартам качества. Наши сотрудники регулярно проходят обучение и повышение квалификации, чтобы обеспечивать высокий уровень обслуживания.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;

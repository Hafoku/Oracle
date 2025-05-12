import React, { useState } from 'react';
import "./App.css";
import Header from './Header';
import Footer from './Footer';

const Library = () => {
  const [activeTab, setActiveTab] = useState('lectures');

  const materials = {
    lectures: [
      {
        id: 1,
        title: "Введение в первую помощь",
        type: "PDF",
        description: "Базовые принципы оказания первой помощи",
        size: "2.5 MB"
      },
      {
        id: 2,
        title: "Алгоритмы СЛР",
        type: "PDF",
        description: "Подробные схемы проведения реанимации",
        size: "1.8 MB"
      },
      {
        id: 3,
        title: "Травматология для медиков",
        type: "PDF",
        description: "Руководство по оказанию помощи при травмах",
        size: "3.2 MB"
      },
      {
        id: 4,
        title: "Неотложные состояния",
        type: "PDF",
        description: "Алгоритмы действий при неотложных состояниях",
        size: "4.1 MB"
      }
    ],
    videos: [
      {
        id: 1,
        title: "Техника наложения повязок",
        duration: "15:30",
        description: "Практическое руководство по наложению различных видов повязок",
        thumbnail: "bandage-thumb.jpg"
      },
      {
        id: 2,
        title: "СЛР на практике",
        duration: "20:45",
        description: "Демонстрация проведения сердечно-легочной реанимации",
        thumbnail: "cpr-thumb.jpg"
      },
      {
        id: 3,
        title: "Остановка кровотечений",
        duration: "18:20",
        description: "Методы временной и окончательной остановки кровотечений",
        thumbnail: "bleeding-thumb.jpg"
      },
      {
        id: 4,
        title: "Транспортировка пострадавших",
        duration: "22:15",
        description: "Правильные техники транспортировки при различных травмах",
        thumbnail: "transport-thumb.jpg"
      }
    ],
    audio: [
      {
        id: 1,
        title: "Лекция: Первая помощь при травмах",
        duration: "45:20",
        description: "Аудиокурс по оказанию помощи при различных травмах"
      },
      {
        id: 2,
        title: "Алгоритмы действий в экстренных ситуациях",
        duration: "38:15",
        description: "Пошаговые инструкции для разных случаев"
      },
      {
        id: 3,
        title: "Медицинская этика",
        duration: "52:10",
        description: "Основы медицинской этики и деонтологии"
      },
      {
        id: 4,
        title: "Психологическая помощь",
        duration: "41:35",
        description: "Основы психологической поддержки пострадавших"
      }
    ],
    images: [
      {
        id: 1,
        title: "Анатомические схемы",
        category: "Анатомия",
        description: "Иллюстрации основных анатомических структур"
      },
      {
        id: 2,
        title: "Инфографика первой помощи",
        category: "Инфографика",
        description: "Наглядные схемы оказания первой помощи"
      },
      {
        id: 3,
        title: "Атлас патологий",
        category: "Патология",
        description: "Визуальное руководство по распознаванию патологий"
      },
      {
        id: 4,
        title: "Медицинское оборудование",
        category: "Оборудование",
        description: "Иллюстрации и схемы медицинского оборудования"
      }
    ]
  };

  const tabNames = {
    lectures: "лекций",
    vebinar: "вебинаров",
    videos: "видеоматериалов",
    audio: "аудиоматериалов",
    images: "изображений"
    
  };

  const renderContent = () => {
    const content = materials[activeTab];
    
    if (content.length === 0) {
      return (
        <div className="empty-state">
          <p>Здесь нет никаких материалов :(</p>
        </div>
      );
    }
    
    return (
      <div className="materials-grid">
        {content.map(item => (
          <div key={item.id} className="material-card">
            {activeTab === 'videos' && (
              <div className="video-thumbnail">
                <span className="duration">{item.duration}</span>
                <div className="play-icon">▶</div>
              </div>
            )}
            {activeTab === 'images' && (
              <div className="image-preview">
                <div className="preview-icon">🖼️</div>
              </div>
            )}
            {activeTab === 'audio' && (
              <div className="audio-preview">
                <div className="audio-icon">🎧</div>
                <span className="duration">{item.duration}</span>
              </div>
            )}
            <div className="material-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="material-meta">
                {item.type && <span className="file-type">{item.type}</span>}
                {item.size && <span className="size-badge">{item.size}</span>}
                {item.category && <span className="category-badge">{item.category}</span>}
              </div>
            </div>
            <button className="download-button">Скачать</button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      <Header />
      <div className="page-container">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Библиотека учебных материалов</h1>
          </div>
        </div>
        
        <div className="grid grid-1">
          <div className="card">
            <h2 className="section-title">Доступ к профессиональным знаниям</h2>
            <p className="section-description">
              Наша библиотека содержит тщательно отобранные материалы, разработанные ведущими специалистами в области медицины. 
              Используйте эти ресурсы для самообразования, подготовки к экзаменам или повышения квалификации.
            </p>
          </div>
        </div>

        <div className="tab-navigation">
          <button 
            className={`button ${activeTab === 'lectures' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setActiveTab('lectures')}
          >
            Лекции
          </button>
          <button 
            className={`button ${activeTab === 'vebinar' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setActiveTab('vebinar')}
          >
            Вебинары
          </button>
          <button 
            className={`button ${activeTab === 'videos' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setActiveTab('videos')}
          >
            Видео
          </button>
          <button 
            className={`button ${activeTab === 'audio' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setActiveTab('audio')}
          >
            Аудио
          </button>
          <button 
            className={`button ${activeTab === 'images' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setActiveTab('images')}
          >
            Изображения
          </button>
          
        </div>

        <div className="empty-state-container">
          <div className="empty-state">
            <p>Здесь нет никаких {tabNames[activeTab]} :(</p>
          </div>
        </div>
        
      </div>
      <Footer />
    </div>
  );
};

export default Library;

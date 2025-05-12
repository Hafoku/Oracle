import React from 'react';
import './App.css';
import Header from './Header';
import Footer from './Footer';

const School = () => {
  return (
    <div className="page-wrapper">
      <Header />
      <div className="page-container">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Школа первой помощи</h1>
          </div>
        </div>
        
        <div className="grid grid-1" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
          <div className="card highlight-box" style={{ 
            textAlign: 'center', 
            padding: '3rem',
            background: 'var(--primary)',
            color: 'white'
          }}>
            <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '2rem' }}>СКОРО ОТКРЫТИЕ!</h2>
            <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6', color: 'white' }}>
              Мы готовим для вас уникальную программу обучения первой помощи.
              Следите за обновлениями и будьте готовы к старту!
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default School;

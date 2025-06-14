import React, { useState, useEffect } from "react";
import Footer from "./Footer";
import "./App.css";
// Для работы иконок: npm install react-icons
import { FaPhoneAlt, FaEnvelope, FaWhatsapp, FaMapMarkerAlt, FaClock, FaReply, FaCommentDots, FaBuilding, FaEnvelopeOpenText, FaMapMarkedAlt, FaRoute, FaBus, FaCar, FaWalking, FaCalendarDay, FaExclamationCircle, FaQuestionCircle, FaMinusCircle, FaPlusCircle, FaChevronDown, FaInfoCircle, FaSearch, FaPaperPlane, FaShareAlt, FaBell, FaFacebookF, FaInstagram, FaTelegram, FaYoutube, FaHeadset, FaIdCard } from 'react-icons/fa';

const Contacts = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  useEffect(() => {
    // Load Yandex Maps script
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.REACT_APP_YANDEX_MAPS_API_KEY}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      window.ymaps.ready(() => {
        setMapLoaded(true);
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      // Initialize map
      const map = new window.ymaps.Map('map', {
        center: [51.133822, 71.413080], // Astana coordinates
        zoom: 15
      });

      // Add marker
      const marker = new window.ymaps.Placemark([51.133822, 71.413080], {
        balloonContent: 'Oracle Pharmacy<br>Ул. Кабанбай батыра, 17'
      }, {
        preset: 'islands#redDotIcon'
      });

      map.geoObjects.add(marker);
    }
  }, [mapLoaded]);

  const toggleQuestion = (index) => {
    if (activeQuestion === index) {
      setActiveQuestion(null);
    } else {
      setActiveQuestion(index);
    }
  };
  
  const faqs = [
    {
      question: "Как сделать заказ?",
      answer: "Вы можете сделать заказ через наш сайт, по телефону или в мобильном приложении. Выберите нужные товары, добавьте их в корзину и оформите заказ, следуя инструкциям на экране."
    },
    {
      question: "Как узнать статус моего заказа?",
      answer: "Статус заказа можно отследить в личном кабинете в разделе 'Мои заказы'. Также вы получите уведомления по электронной почте и SMS о статусе вашего заказа."
    },
    {
      question: "Какие способы оплаты вы принимаете?",
      answer: "Мы принимаем наличные при доставке, банковские карты (VISA, MasterCard), электронные кошельки, а также банковский перевод для юридических лиц."
    },
    {
      question: "Как вернуть или обменять товар?",
      answer: "Для возврата или обмена товара необходимо связаться с нашей службой поддержки в течение 14 дней с момента получения заказа. Обратите внимание, что некоторые категории товаров не подлежат возврату согласно законодательству."
    },
    {
      question: "Есть ли у вас программа лояльности?",
      answer: "Да, у нас есть программа лояльности. За каждую покупку вы получаете баллы, которые можно использовать для оплаты следующих заказов. Также мы предлагаем специальные акции и скидки для постоянных клиентов."
    }
  ];
  
  return (
    <div className="page-wrapper">
      <div className="oracle-hero oracle-hero-medical" style={{ padding: "5rem 0" }}>
        <div className="oracle-hero-pattern"></div>
        <div className="oracle-hero-gradient"></div>
        <div className="oracle-hero-content">
          <h1 className="oracle-hero-title">
            <FaHeadset style={{marginRight: 10, marginBottom: -4}}/> Свяжитесь с нами
          </h1>
          <p className="oracle-hero-description">
            Мы всегда открыты для ваших вопросов и предложений. 
            Наши специалисты готовы помочь вам 24/7.
          </p>
        </div>
      </div>

      <div className="oracle-container">
        <div className="oracle-section" style={{ marginTop: "-3rem" }}>
          <div className="oracle-row">
            {/* Карточка с контактами */}
            <div className="oracle-col">
              <div className="oracle-card" style={{ 
                borderTop: "4px solid var(--primary-dark)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                borderRadius: "12px",
                overflow: "visible"
              }}>
                <div style={{ 
                  width: "80px", 
                  height: "80px", 
                  background: "var(--primary-dark)", 
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  color: "white",
                  margin: "-40px auto 20px"
                }}>
                  <FaPhoneAlt />
                </div>
                
                <h2 className="oracle-card-title" style={{ textAlign: "center", fontSize: '1.8rem', marginBottom: '1.5rem' }}>
                  <FaIdCard style={{ marginRight: 10, marginBottom: -3 }}/>Наши контакты
                </h2>
                
                <div className="contact-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                  <div className="contact-info-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <div className="contact-icon" style={{
                      width: "60px", 
                      height: "60px", 
                      background: "var(--primary-light)", 
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      color: "var(--primary-dark)",
                      marginBottom: "15px"
                    }}>
                      <FaPhoneAlt />
                    </div>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>Телефон</h3>
                    <a href="tel:+77780988948" className="oracle-link" style={{ fontWeight: "600", fontSize: "1.1rem" }}>
                      8 (778) 098-89-48
                    </a>
                    <p style={{ marginTop: "5px", color: "#666" }}>
                      <FaClock style={{ marginRight: 5, marginBottom: -2 }}/>Звоните нам в любое время
                    </p>
                  </div>
                  
                  <div className="contact-info-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <div className="contact-icon" style={{
                      width: "60px", 
                      height: "60px", 
                      background: "var(--primary-light)", 
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      color: "var(--primary-dark)",
                      marginBottom: "15px"
                    }}>
                      <FaEnvelope />
                    </div>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>Email</h3>
                    <a href="mailto:oracle@pharmacy.kz" className="oracle-link" style={{ fontWeight: "600", fontSize: "1.1rem" }}>
                      oracle@pharmacy.kz
                    </a>
                    <p style={{ marginTop: "5px", color: "#666" }}>
                      <FaReply style={{ marginRight: 5, marginBottom: -2 }}/>Мы ответим в течение 24 часов
                    </p>
                  </div>
                  
                  <div className="contact-info-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <div className="contact-icon" style={{
                      width: "60px", 
                      height: "60px", 
                      background: "var(--primary-light)", 
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      color: "var(--primary-dark)",
                      marginBottom: "15px"
                    }}>
                      <FaWhatsapp />
                    </div>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>WhatsApp</h3>
                    <a href="https://wa.me/77780988948" target="_blank" rel="noopener noreferrer" className="oracle-link" style={{ fontWeight: "600", fontSize: "1.1rem" }}>
                      WhatsApp чат
                    </a>
                    <p style={{ marginTop: "5px", color: "#666" }}>
                      <FaCommentDots style={{ marginRight: 5, marginBottom: -2 }}/>Задайте вопрос в мессенджере
                    </p>
                  </div>
                  
                  <div className="contact-info-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <div className="contact-icon" style={{
                      width: "60px", 
                      height: "60px", 
                      background: "var(--primary-light)", 
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      color: "var(--primary-dark)",
                      marginBottom: "15px"
                    }}>
                      <FaMapMarkerAlt />
                    </div>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>Адрес</h3>
                    <p style={{ fontWeight: "600", fontSize: "1.1rem" }}>
                      Ул. Кабанбай батыра, 17
                    </p>
                    <p style={{ marginTop: "5px", color: "#666" }}>
                      <FaBuilding style={{ marginRight: 5, marginBottom: -2 }}/>г. Астана, Казахстан
                    </p>
                  </div>
                </div>
                
                <div style={{ marginTop: "30px", textAlign: "center" }}>
                  <a href="mailto:oracle@pharmacy.kz" className="oracle-btn oracle-btn-primary" style={{ padding: "12px 30px", fontSize: "1.1rem" }}>
                    <FaEnvelopeOpenText style={{ marginRight: 8, marginBottom: -2 }}/>Отправить сообщение
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Карта и часы работы */}
        <div className="oracle-section">
          <div className="oracle-row">
            <div className="oracle-col">
              <div className="oracle-card">
                <h2 className="oracle-card-title">
                  <FaMapMarkedAlt style={{ marginRight: 10, marginBottom: -3 }}/>Наше местоположение
                </h2>
                <div style={{ height: "400px", borderRadius: "8px", overflow: "hidden", marginBottom: "20px" }}>
                  <div id="map" style={{ 
                    width: "100%", 
                    height: "100%",
                    position: "relative"
                  }}>
                    {!mapLoaded && (
                      <div style={{ 
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#eaeef1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        color: "#666"
                      }}>
                        <div style={{
                          padding: "20px",
                          background: "rgba(255,255,255,0.8)",
                          borderRadius: "8px",
                          textAlign: "center"
                        }}>
                          <FaMapMarkedAlt style={{fontSize: "3rem", color: "var(--primary-dark)", marginBottom: "10px", display: "block"}}/>
                          <p>Загрузка карты...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="oracle-row">
                  <div className="oracle-col">
                    <h3 style={{fontSize: "1.3rem", marginBottom: "15px", color: "var(--primary-dark)"}}>
                      <FaClock style={{ marginRight: 8, marginBottom: -2 }}/>Часы работы
                    </h3>
                    <table style={{width: "100%", borderCollapse: "collapse"}}>
                      <tbody>
                        <tr style={{borderBottom: "1px solid #eee"}}>
                          <td style={{padding: "8px 0", fontWeight: "600"}}>
                            <FaCalendarDay style={{marginRight: 8, color: "var(--primary-dark)", marginBottom: -2}}/>Понедельник - Пятница
                          </td>
                          <td style={{padding: "8px 0"}}>09:00 - 21:00</td>
                        </tr>
                        <tr style={{borderBottom: "1px solid #eee"}}>
                          <td style={{padding: "8px 0", fontWeight: "600"}}>
                            <FaCalendarDay style={{marginRight: 8, color: "var(--primary-dark)", marginBottom: -2}}/>Суббота
                          </td>
                          <td style={{padding: "8px 0"}}>10:00 - 20:00</td>
                        </tr>
                        <tr style={{borderBottom: "1px solid #eee"}}>
                          <td style={{padding: "8px 0", fontWeight: "600"}}>
                            <FaCalendarDay style={{marginRight: 8, color: "var(--primary-dark)", marginBottom: -2}}/>Воскресенье
                          </td>
                          <td style={{padding: "8px 0"}}>10:00 - 18:00</td>
                        </tr>
                        <tr>
                          <td style={{padding: "8px 0", fontWeight: "600", color: "var(--secondary-orange)"}}>
                            <FaExclamationCircle style={{marginRight: 8, marginBottom: -2}}/>Государственные праздники
                          </td>
                          <td style={{padding: "8px 0"}}>По сокращенному графику</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQ секция */}
        <div className="oracle-section">
          <div className="oracle-row">
            <div className="oracle-col">
              <div className="oracle-card">
                <h2 className="oracle-card-title" style={{textAlign: "center", marginBottom: "30px"}}>
                  <FaQuestionCircle style={{ marginRight: 10, marginBottom: -3 }}/>Часто задаваемые вопросы
                </h2>
                
                <div className="faq-container">
                  {faqs.map((faq, index) => (
                    <div 
                      key={index} 
                      className="faq-item" 
                      style={{
                        marginBottom: "15px",
                        border: "1px solid #eee",
                        borderRadius: "8px",
                        overflow: "hidden"
                      }}
                    >
                      <div 
                        className="faq-question" 
                        onClick={() => toggleQuestion(index)}
                        style={{
                          padding: "15px 20px",
                          backgroundColor: activeQuestion === index ? "var(--primary-light)" : "#f9f9f9",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "all 0.3s ease"
                        }}
                      >
                        <h3 style={{margin: 0, fontSize: "1.1rem", fontWeight: "600"}}>
                          {activeQuestion === index ? <FaMinusCircle style={{marginRight: 10, color: "var(--primary-dark)"}}/> : <FaPlusCircle style={{marginRight: 10, color: "var(--primary-dark)"}}/>}
                          {faq.question}
                        </h3>
                        <span style={{
                          transition: "all 0.3s ease", 
                          transform: activeQuestion === index ? "rotate(180deg)" : "rotate(0)",
                          color: "var(--primary-dark)"
                        }}>
                          <FaChevronDown />
                        </span>
                      </div>
                      <div 
                        className="faq-answer"
                        style={{
                          padding: activeQuestion === index ? "15px 20px" : "0 20px",
                          maxHeight: activeQuestion === index ? "200px" : "0",
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <p>
                          <FaInfoCircle style={{marginRight: 8, color: "var(--secondary-orange)"}}/>{faq.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{marginTop: "30px", textAlign: "center"}}>
                  <p style={{fontSize: "1.1rem", marginBottom: "20px"}}>
                    <FaSearch style={{marginRight: 8, color: "var(--primary-dark)"}}/>Не нашли ответ на свой вопрос?
                  </p>
                  <a href="mailto:oracle@pharmacy.kz" className="oracle-btn oracle-btn-outline">
                    <FaPaperPlane style={{marginRight: 8}}/>Задать свой вопрос
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contacts;

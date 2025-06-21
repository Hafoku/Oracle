import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/News.css";

const News = () => {
  const [news, setNews] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // Состояние для выбранного изображения
  const [currentUser, setCurrentUser] = useState(null); // Состояние для текущего пользователя
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    console.log("Current token:", token); // для отладки
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchNews(token);
    fetchCurrentUser(token);
  }, [id, navigate]);

  const fetchNews = async (token) => {
    try {
      const response = await axios.get(`http://2.133.132.170:8082/news/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      setNews(response.data);
      console.log(response.data); // для отладки
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const fetchCurrentUser = async (token) => {
    try {
      // Получаем данные текущего пользователя
      const response = await axios.get('http://2.133.132.170:8082/user/current', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      setCurrentUser(response.data);
      console.log('Current user:', response.data); // для отладки
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  // Функция для апгрейда новости
  const upgradeNews = async () => {
    navigate(`/update_news/${id}`);
  };

  // Функция для удаления новости
  const deleteNews = async () => {
    if (window.confirm("Вы действительно хотите удалить эту новость?")) {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          navigate('/login');
          return;
        }
        
        await axios.delete(`http://2.133.132.170:8082/news/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        alert('Новость успешно удалена!');
        navigate('/'); 
      } catch (error) {
        console.error("Error deleting news:", error);
        alert('Ошибка при удалении новости');
      }
    }
  };

  // Проверка, имеет ли пользователь право на апгрейд новости
  const canUpgradeNews = () => {
    if (!currentUser || !news) return false;
    
    // Пользователь может обновить новость, если он админ или автор новости
    return currentUser.roles?.includes('ROLE_ADMIN') || 
           (news.author && news.author.id === currentUser.id);
  };

  // Функция для открытия изображения в модальном окне
  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  // Функция для закрытия модального окна
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  if (!news) {
    return <div className="container">Загрузка...</div>;
  }

  return (
    <div className="container">
      <div className="news-detail">
        <div className="news-header">
          <h1>{news.title}</h1>
          {canUpgradeNews() && (
            <div className="news-actions">
              <button 
                className="upgrade-button" 
                onClick={upgradeNews}
              >
                Обновить новость
              </button>
              <button 
                className="delete-button" 
                onClick={deleteNews}
              >
                Удалить новость
              </button>
            </div>
          )}
          {news.avatar && (
            <img
              src={`http://2.133.132.170:8082/files/${news.avatar.id}`}
              alt={news.title}
              className="news-main-image"
              onClick={() => openImageModal(news.avatar)} // Открыть модальное окно при клике
            />
          )}
        </div>

        <div className="news-info">
          <p className="news-author">
            Автор: {news.author?.name || "Неизвестен"}
          </p>
          {news.author?.avatar && (
            <div className="author-avatar">
              <img
                src={`http://2.133.132.170:8082/files/${news.author.avatar.id}`}
                alt="Аватар автора"
                className="author-avatar-image"
                onClick={() => openImageModal(news.author.avatar)} // Открыть модальное окно при клике
              />
            </div>
          )}
        </div>

        <div className="news-description-section">
          <h2>Краткое описание</h2>
          <p>{news.description}</p>
        </div>

        <div className="news-content-section">
          <h2>Содержание</h2>
          <p>{news.content}</p>
        </div>

        {news.images && news.images.length > 0 && (
          <div className="news-gallery">
            <h2>Галерея</h2>
            <div className="images-grid">
              {news.images.map((image, index) => (
                <img
                  key={index}
                  src={`http://2.133.132.170:8082/files/${image.id}`}
                  alt={`Изображение ${index + 1}`}
                  className="gallery-image"
                  onClick={() => openImageModal(image)} // Открыть модальное окно при клике
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно для отображения изображения на весь экран */}
      {selectedImage && (
        <div className="modal-overlay" onClick={closeImageModal}>
          <div className="modal-content">
            <img
              src={`http://2.133.132.170:8082/files/${selectedImage.id}`}
              alt="Выбранное изображение"
              className="modal-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
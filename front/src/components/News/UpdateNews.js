import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";
import { useNavigate, useParams } from "react-router-dom";
import Header from '../Header';
import Footer from '../Footer';

const UpdateNews = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Получаем ID новости из URL

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    file: null,
    images: [],
  });

  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});
  const [existingImages, setExistingImages] = useState({
    mainImage: null,
    additionalImages: []
  });

  // Проверка авторизации и загрузка данных новости
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Загрузка существующей новости
    const fetchNews = async () => {
      try {
        const response = await axios.get(`http://2.133.132.170:8082/news/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        const news = response.data;
        setFormData({
          title: news.title,
          description: news.description,
          content: news.content,
          file: null,
          images: []
        });

        // Сохраняем существующие изображения
        setExistingImages({
          mainImage: news.avatar,
          additionalImages: news.images || []
        });
      } catch (error) {
        console.error("Error fetching news:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('jwtToken');
          navigate('/login');
        }
      }
    };

    fetchNews();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file,
      }));
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = async (imageId, isMain = false) => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }
    

    try {
      // Отправляем запрос на удаление изображения
      await axios.delete(`http://2.133.132.170:8082/news/${id}/images/${imageId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (isMain) {
        setExistingImages(prev => ({
          ...prev,
          mainImage: null
        }));
      } else {
        setExistingImages(prev => ({
          ...prev,
          additionalImages: prev.additionalImages.filter(img => img.id !== imageId)
        }));
      }
    } catch (error) {
      console.error("Error removing image:", error);
      // ...
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Краткое описание обязательно';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Содержание новости обязательно';
    }
    
    return newErrors;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });
    
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      // Формируем DTO для обновления новости: 
      // в нем передаются только существующие id изображений и аватара
      const newsDto = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        images: existingImages.additionalImages.map(img => img.id),
        avatar: existingImages.mainImage ? existingImages.mainImage.id : null,
      };
  
      // Создаем FormData и добавляем JSON в виде Blob с нужным Content-Type
      const formDataToSend = new FormData();
      formDataToSend.append(
        "newNews",
        new Blob([JSON.stringify(newsDto)], { type: "application/json" })
      );
  
      // Если пользователь выбрал новое главное изображение, добавляем его в поле "avatar"
      if (formData.file) {
        formDataToSend.append("avatar", formData.file);
      }
      
      // Если выбраны новые дополнительные изображения, добавляем их в поле "images"
      if (formData.images.length > 0) {
        formData.images.forEach((image) => {
          formDataToSend.append("images", image);
        });
      }
      
      await axios.put(`http://2.133.132.170:8082/news/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      });
      
      setMessage({ text: "Новость успешно обновлена!", type: "success" });
      setTimeout(() => {
        setMessage({ text: "", type: "" });
        navigate('/news');
      }, 30000);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('jwtToken');
        navigate('/login');
        return;
      }
      
      setMessage({
        text: "Ошибка при обновлении новости. Попробуйте снова через 5 минут.",
        type: "error",
      });
      console.error("Error updating news:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="page-wrapper">
      {/* Модальное окно с сообщением */}
      {message.text && (
        <div className="modal-overlay">
          <div className={`modal-content ${message.type}`}>
            <div className="modal-icon">
              {message.type === 'success' ? '✓' : '✗'}
            </div>
            <h2>{message.text}</h2>
            <p>
              {message.type === 'success' 
                ? 'Новость успешно обновлена.' 
                : 'Пожалуйста, проверьте данные и попробуйте снова.'}
            </p>
            {message.type === 'success' && (
              <p>Это окно закроется автоматически через 30 секунд</p>
            )}
            <button 
              onClick={() => {
                setMessage({ text: "", type: "" });
                if (message.type === 'success') {
                  navigate(`/news/${id}`);
                }
              }}
            >
              {message.type === 'success' ? 'Перейти к новостям' : 'Понятно'}
            </button>
          </div>
        </div>
      )}
      
      
      <Header />
      <div className="page-container">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Редактирование новости</h1>
            <p>Обновите информацию в существующей новости</p>
          </div>
        </div>
        
        <div className="card">
          <form onSubmit={handleSubmit} className="news-form">
            <div className="form-group">
              <label htmlFor="title" className="form-label">Заголовок новости</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Введите заголовок новости"
              />
              {errors.title && <div className="error-message">{errors.title}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="description" className="form-label">Краткое описание</label>
              <textarea
                id="description"
                name="description"
                className="form-input"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Введите краткое описание (до 200 символов)"
                rows="3"
              />
              {errors.description && <div className="error-message">{errors.description}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="file" className="form-label">Главное изображение</label>
              <input
                type="file"
                id="file"
                name="file"
                className="form-input"
                onChange={handleAvatarChange}
                accept="image/*"
              />
              {(previewAvatar || existingImages.mainImage) && (
                <div className="image-preview mt-1" style={{ position: 'relative' }}>
                  <img 
                    src={previewAvatar || `http://2.133.132.170:8082/files/${existingImages.mainImage.id}`}
                    alt="Главное изображение"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius)' }}
                  />
                  {existingImages.mainImage && !previewAvatar && (
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(existingImages.mainImage.id, true)}
                      style={{ 
                        position: 'absolute', 
                        top: '5px', 
                        right: '5px',
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '25px',
                        height: '25px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="images" className="form-label">
                Дополнительные изображения 
                {(formData.images.length > 0 || existingImages.additionalImages.length > 0) && 
                  ` (Выбрано: ${formData.images.length + existingImages.additionalImages.length})`}
              </label>
              <input
                type="file"
                id="images"
                name="images"
                className="form-input"
                onChange={handleImagesChange}
                accept="image/*"
                multiple
              />
              <small className="text-gray mt-1 mb-2" style={{ display: 'block', opacity: '0.7' }}>
                Вы можете выбрать несколько изображений одновременно
              </small>
              
              <div className="images-grid">
                {/* Существующие изображения */}
                {existingImages.additionalImages.map((image) => (
                  <div key={image.id} className="gallery-image-container">
                    <img
                      src={`http://2.133.132.170:8082/files/${image.id}`}
                      alt="Дополнительное изображение"
                      className="gallery-image"
                    />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(image.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Новые изображения */}
                {previewImages.map((preview, index) => (
                  <div key={`new-${index}`} className="gallery-image-container">
                    <img 
                      src={preview} 
                      alt={`Новое изображение ${index + 1}`} 
                      className="gallery-image"
                    />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="content" className="form-label">Содержание новости</label>
              <textarea
                id="content"
                name="content"
                className="form-input"
                value={formData.content}
                onChange={handleInputChange}
                rows="10"
                placeholder="Введите полный текст новости..."
              ></textarea>
              {errors.content && <div className="error-message">{errors.content}</div>}
            </div>
            
            <div className="highlight-box mb-2">
              <p>Перед сохранением изменений убедитесь, что информация достоверна и соответствует этическим нормам медицинского сообщества.</p>
            </div>
            
            <div className="flex justify-between items-center">
              <button 
                type="button" 
                className="button button-secondary"
                onClick={() => navigate('/news')}
              >
                Отмена
              </button>
              <button 
                type="submit" 
                className="button button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UpdateNews;

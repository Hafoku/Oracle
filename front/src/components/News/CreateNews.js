import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Header from '../Header';
import Footer from '../Footer';

const CreateNews = () => {
  const navigate = useNavigate();
  const [formData, setFormData, ] = useState({
    title: "",
    description: "",
    content: "",
    file: null,
    images: [],
    category: "Образование",
    tags: ""
  });

  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});
  const [createdNewsId, setCreatedNewsId] = useState(null); 
  // Проверка авторизации при загрузке компонента
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    console.log("Current token:", token); // для отладки
    if (!token) {
      navigate('/login');
    }
  }, []); // Убираем navigate из зависимостей

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Очищаем ошибку при изменении поля
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

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
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
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("content", formData.content);
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }
      if (formData.images.length > 0) {
        formData.images.forEach((image) => {
          formDataToSend.append("images", image);
        });
      }

      const response = await axios.post("http://localhost:8082/news", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      });

      const newsId = response.data.id;
      setCreatedNewsId(newsId);
      
      setMessage({ text: "Новость успешно создана!", type: "success" });
      // Очистка формы
      setFormData({
        title: "",
        description: "",
        content: "",
        file: null,
        images: [],
        category: "Образование",
        tags: ""
      });
      setPreviewAvatar(null);
      setPreviewImages([]);
      
      // Автоматическое закрытие сообщения через 30 секунд
      setTimeout(() => {
        setMessage({ text: "", type: "" });
        navigate(`/news/${createdNewsId}`); 
      }, 30000); // 30 секунд
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('jwtToken');
        navigate('/login');
        return;
      }
      
      setMessage({
        text: "Ошибка. Попробуйте снова через 5 минут.",
        type: "error",
      });
      console.error("Error creating news:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      {message.text && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div 
            className={`modal-content ${message.type}`}
            style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '2rem',
              maxWidth: '450px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              animation: 'fadeInDown 0.3s ease-out'
            }}
          >
            <div 
              className="modal-icon"
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 1.5rem',
                color: 'white',
                fontSize: '2.5rem',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
              }}
            >
              {message.type === 'success' ? '✓' : '✗'}
            </div>
            <h2 style={{ 
              fontSize: '1.8rem', 
              marginBottom: '1rem',
              color: message.type === 'success' ? '#28a745' : '#dc3545',
            }}>
              {message.text}
            </h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              {message.type === 'success' 
                ? 'Новость успешно добавлена в базу данных.' 
                : 'Пожалуйста, проверьте данные и попробуйте снова.'}
            </p>
            {message.type === 'success' && (
              <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Это окно закроется автоматически через 30 секунд
              </p>
            )}
            <button 
              onClick={() => {
                setMessage({ text: "", type: "" });
                if (message.type === 'success') {
                  navigate(`/news/${createdNewsId}`); 
                }
              }}
              style={{
                padding: '0.8rem 2rem',
                backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              {message.type === 'success' ? 'Перейти к новости' : 'Понятно'}
            </button>
          </div>
        </div>
      )}
      
      <style>
        {`
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      
      <Header />
      <div className="page-container">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Создание новости</h1>
            <p>Поделитесь важной информацией с медицинским сообществом</p>
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
              {previewAvatar && (
                <div className="image-preview mt-1">
                  <img src={previewAvatar} alt="Предпросмотр" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius)' }} />
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="images" className="form-label">
                Дополнительные изображения 
                {formData.images.length > 0 && ` (Выбрано: ${formData.images.length})`}
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
              
              {previewImages.length > 0 && (
                <div className="images-preview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  {previewImages.map((preview, index) => (
                    <div key={index} className="preview-item" style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                      <img src={preview} alt={`Предпросмотр ${index + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(index)}
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
                    </div>
                  ))}
                </div>
              )}
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
              <p>Перед публикацией убедитесь, что информация достоверна и соответствует этическим нормам медицинского сообщества.</p>
            </div>
            
            <div className="flex justify-between items-center">
              <button 
                type="button" 
                className="button button-secondary"
                onClick={() => navigate(`/news/${createdNewsId}`)}
              >
                Отмена
              </button>
              <button 
                type="submit" 
                className="button button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Публикация...' : 'Опубликовать новость'}
              </button>
            </div>
          </form>
        </div>
        
        
      </div>
      <Footer />
    </div>
  );
};

export default CreateNews;

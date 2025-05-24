import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Header from '../Header';
import Footer from '../Footer';
import { FaArrowLeft, FaCheck, FaTimes } from "react-icons/fa";

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
        <div className="modal-overlay">
          <div className={`modal-content ${message.type}`}>
            <div className="modal-icon">
              {message.type === 'success' ? <FaCheck /> : <FaTimes />}
            </div>
            <h2 className={`modal-title modal-title-${message.type}`}>{message.text}</h2>
            <p className="modal-desc">
              {message.type === 'success' 
                ? 'Новость успешно добавлена в базу данных.' 
                : 'Пожалуйста, проверьте данные и попробуйте снова.'}
            </p>
            {message.type === 'success' && (
              <p className="modal-timer">Это окно закроется автоматически через 30 секунд</p>
            )}
            <button 
              onClick={() => {
                setMessage({ text: "", type: "" });
                if (message.type === 'success') {
                  navigate(`/news/${createdNewsId}`); 
                }
              }}
              className={`news-btn ${message.type === 'success' ? 'news-btn-primary' : 'news-btn-outline'}`}
            >
              {message.type === 'success' ? 'Перейти к новости' : 'Понятно'}
            </button>
          </div>
        </div>
      )}
      <div className="create-news-hero">
        <div className="create-news-title">Создание новости</div>
        <div className="create-news-subtitle">Поделитесь важной информацией с медицинским сообществом</div>
      </div>
      <div className="news-card">
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
              <div className="images-preview-grid">
                {previewImages.map((preview, index) => (
                  <div key={index} className="preview-item">
                    <img src={preview} alt={`Предпросмотр ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(index)}
                    >
                      <FaTimes />
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
              className="news-btn news-btn-outline"
              onClick={() => navigate(createdNewsId ? `/news/${createdNewsId}` : '/news')}
            >
              <FaArrowLeft style={{marginRight: 8}} /> Отмена
            </button>
            <button 
              type="submit" 
              className="news-btn news-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Публикация...' : 'Опубликовать новость'}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateNews;

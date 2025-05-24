import React, { useState } from "react";
import { request } from "../axios_helper";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaHome } from "react-icons/fa";
import './App.css';
import './styles/auth.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    matchingPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Имя пользователя обязательно";
    } else if (formData.name.length < 3) {
      newErrors.name = "Имя должно содержать минимум 3 символа";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Введите корректный email";
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
    } else if (formData.password.length < 6) {
      newErrors.password = "Пароль должен содержать минимум 6 символов";
    }

    if (formData.password !== formData.matchingPassword) {
      newErrors.matchingPassword = "Пароли не совпадают";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await request("POST", "/user/registration", formData);
      navigate("/login", { 
        state: { message: "Регистрация успешна! Теперь вы можете войти в свой аккаунт." }
      });
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setServerError("Ошибка при регистрации. Пожалуйста, попробуйте позже.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="oracle-auth-container">
      <div className="oracle-auth-box">
        <div className="oracle-auth-header">
          <h1 className="oracle-auth-title">Создание аккаунта</h1>
          <p className="oracle-auth-subtitle">Присоединяйтесь к Oracle</p>
        </div>

        {serverError && (
          <div className="oracle-auth-error">
            <span className="oracle-error-icon">!</span>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="oracle-auth-form">
          <div className="oracle-form-group">
            <div className="oracle-input-wrapper">
              <FaUser className="oracle-input-icon" />
              <input
                id="name"
                name="name"
                className={`oracle-form-input ${errors.name ? 'oracle-input-error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                placeholder="Имя пользователя"
              />
            </div>
            {errors.name && <div className="oracle-field-error">{errors.name}</div>}
          </div>

          <div className="oracle-form-group">
            <div className="oracle-input-wrapper">
              <FaEnvelope className="oracle-input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                className={`oracle-form-input ${errors.email ? 'oracle-input-error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
              />
            </div>
            {errors.email && <div className="oracle-field-error">{errors.email}</div>}
          </div>

          <div className="oracle-form-group">
            <div className="oracle-input-wrapper">
              <FaLock className="oracle-input-icon" />
              <input
                id="password"
                type="password"
                name="password"
                className={`oracle-form-input ${errors.password ? 'oracle-input-error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="Пароль"
              />
            </div>
            {errors.password && <div className="oracle-field-error">{errors.password}</div>}
          </div>

          <div className="oracle-form-group">
            <div className="oracle-input-wrapper">
              <FaLock className="oracle-input-icon" />
              <input
                id="matchingPassword"
                type="password"
                name="matchingPassword"
                className={`oracle-form-input ${errors.matchingPassword ? 'oracle-input-error' : ''}`}
                value={formData.matchingPassword}
                onChange={handleChange}
                placeholder="Подтвердите пароль"
              />
            </div>
            {errors.matchingPassword && (
              <div className="oracle-field-error">{errors.matchingPassword}</div>
            )}
          </div>

          <div className="oracle-form-group">
            <button 
              type="submit" 
              className="oracle-btn oracle-btn-primary oracle-btn-block"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="oracle-spinner"></span>
              ) : (
                <>
                  Зарегистрироваться <FaArrowRight className="oracle-btn-icon" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="oracle-auth-divider">
          <span>или</span>
        </div>

        <div className="oracle-auth-footer">
          <p className="oracle-auth-footer-text">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="oracle-link oracle-link-primary">
              Войти
            </Link>
          </p>
          <Link to="/" className="oracle-btn oracle-btn-outline oracle-btn-block oracle-mt-2">
            <FaHome className="oracle-btn-icon" /> Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;

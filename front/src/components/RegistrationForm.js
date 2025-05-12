import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './App.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    matchingPassword: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/user/registration", formData, {
        headers: { "Content-Type": "application/json" },
      });
      navigate("/login");
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h1 className="section-title text-center">Создание аккаунта</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Имя пользователя"
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          <div className="form-group">
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-group">
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Пароль"
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          <div className="form-group">
            <input
              id="matchingPassword"
              type="password"
              name="matchingPassword"
              className="form-input"
              value={formData.matchingPassword}
              onChange={handleChange}
              placeholder="Подтвердите пароль"
            />
          </div>

          <button type="submit" className="button button-primary w-full">
            Зарегистрироваться
          </button>
        </form>

        <div className="text-center mt-2">
          <p>Уже есть аккаунт? <a href="/login" className="button button-secondary">Войти</a></p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;

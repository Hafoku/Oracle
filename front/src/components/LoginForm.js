import React, { useState } from "react";
import "./App.css";
import { request } from "../axios_helper"; // Убедись, что импорт корректный

const LoginForm = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        
        try {
            console.log("Отправляем запрос на сервер...");
            const response = await request("POST", "/user/login", {
                email: login, // Используем email вместо name
                password: password,
            });

            if (response.status === 200) {
                const token = response.data;
                localStorage.setItem("jwtToken", token);
                console.log("Успешный вход! Токен сохранён.");
                window.location.href = "/account"; // Перенаправляем на страницу сообщений
            } else {
                setError("Ошибка входа. Проверьте логин и пароль.");
            }
        } catch (error) {
            setError("Ошибка соединения с сервером.");
            console.error("Ошибка запроса:", error);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-box">
                <h1 className="section-title text-center">Вход в аккаунт</h1>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Email"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="button button-primary w-full">Войти</button>
                </form>
                <div className="text-center mt-2">
                    <span>Ещё нет аккаунта? </span>
                    <a href="/registration" className="button button-secondary">Создать аккаунт</a>
                </div>
                <div className="text-center mt-2">
                    <a href="/" className="button button-primary w-full">Вернуться на главную страницу</a>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;

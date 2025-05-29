import React, { useState } from "react";
import "./App.css";
import "./styles/auth.css";
import { request } from "../axios_helper";
import { FaUser, FaLock, FaEnvelope, FaArrowRight, FaHome } from "react-icons/fa";
import { Link } from "react-router-dom";
import Logger from "./Logger";

const LoginForm = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        Logger.logAuth('Login attempt', { email: login });

        try {
            const response = await request("POST", "/user/login", {
                email: login,
                password: password,
            });

            if (response.status === 200) {
                const token = response.data;
                Logger.logSuccess('Login successful');
                localStorage.setItem("jwtToken", token);
                window.location.href = "/account";
            } else {
                Logger.logWarning('Login failed', { status: response.status });
                setError("Неправильный логин или пароль.");
            }
        } catch (error) {
            Logger.logError(error);

            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                setError("Неправильный логин или пароль.");
            } else {
                setError("Ошибка соединения с сервером.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="oracle-auth-container">
            <div className="oracle-auth-box">
                <div className="oracle-auth-header">
                    <h1 className="oracle-auth-title">Добро пожаловать в Oracle</h1>
                    <p className="oracle-auth-subtitle">Войдите в свой аккаунт для продолжения</p>
                </div>

                {error && (
                    <div className="oracle-auth-error">
                        <span className="oracle-error-icon">!</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="oracle-auth-form">
                    <div className="oracle-form-group">
                        <div className="oracle-input-wrapper">
                            <FaEnvelope className="oracle-input-icon" />
                            <input
                                type="email"
                                className="oracle-form-input"
                                placeholder="Email"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="oracle-form-group">
                        <div className="oracle-input-wrapper">
                            <FaLock className="oracle-input-icon" />
                            <input
                                type="password"
                                className="oracle-form-input"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
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
                                    Войти <FaArrowRight className="oracle-btn-icon" />
                                </>
                            )}
                        </button>
                    </div>

                    <div className="oracle-auth-links">
                        <Link to="/forgot-password" className="oracle-link">
                            Забыли пароль?
                        </Link>
                    </div>
                </form>

                <div className="oracle-auth-divider">
                    <span>или</span>
                </div>

                <div className="oracle-auth-footer">
                    <p className="oracle-auth-footer-text">
                        Ещё нет аккаунта?{" "}
                        <Link to="/registration" className="oracle-link oracle-link-primary">
                            Создать аккаунт
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

export default LoginForm;

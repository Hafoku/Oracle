import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./App.css"; // Подключаем стили, если они есть
import axios from "axios";
import AvatarUploader from "./Musor/AvatarUploader";
import Header from './Header';
import Footer from './Footer';
import { FaSignOutAlt, FaKey, FaPlus, FaUsers, FaNewspaper, FaUserCircle } from "react-icons/fa";
import Logger from "./Logger";

const AccountPage = () => {
    const [showAvatarForm, setShowAvatarForm] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [oldPassword, setOldPassword] = useState("")
    const navigate = useNavigate();

    // Немедленная проверка токена при загрузке компонента
    useEffect(() => {
        const token = localStorage.getItem("jwtToken");

        if (!token) {
            Logger.logWarning('No token found, redirecting to login');
            navigate("/login");
            return;
        }

        Logger.logInfo('Fetching user data');

        // Глобальный перехватчик для всех запросов
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    Logger.logWarning('Token expired or invalid');
                    localStorage.removeItem("jwtToken");
                    navigate("/login");
                }
                return Promise.reject(error);
            }
        );

        // Пробуем загрузить данные пользователя
        axios.get("/user", {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.data) {
                    Logger.logSuccess('User data received');
                    setUser(response.data);
                    setLoading(false);
                } else {
                    Logger.logError('No user data in response');
                    throw new Error('Нет данных пользователя');
                }
            })
            .catch(error => {
                Logger.logError(error);
                if (error.response?.status === 401) {
                    localStorage.removeItem("jwtToken");
                    navigate("/login");
                } else {
                    setError("");
                }
                setLoading(false);
            });

        // Очистка перехватчика
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [navigate]);

    const handleAvatarDelete = async () => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            Logger.logError("No token found for avatar delete");
            return;
        }

        try {
            Logger.logFile("Attempting avatar delete");
            await axios.delete(`/user/avatar/${user.avatar.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            Logger.logSuccess("Avatar deleted successfully");
            window.location.reload();
        } catch (error) {
            Logger.logError(error);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            Logger.logWarning('Passwords do not match');
            setErrorMessage("Пароли не совпадают");
            return;
        }

        setErrorMessage("");
        Logger.logAuth('Attempting password change');

        const token = localStorage.getItem("jwtToken");
        const requestData = {
            password: password,
            oldpassword: oldPassword
        };

        try {
            const response = await axios.post("/user/updatePassword", requestData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            Logger.logSuccess('Password changed successfully');
        } catch (error) {
            Logger.logError(error);
        }
    };


    const handleAvatarUpload = async (croppedImage) => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            Logger.logError('No token found for avatar upload');
            return;
        }

        Logger.logFile('Attempting avatar upload');
        const formData = new FormData();
        formData.append("image", croppedImage, "avatar.png");

        try {
            const response = await axios.post("/user/changeAvatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });

            Logger.logSuccess('Avatar uploaded successfully');
            window.location.reload();
        } catch (error) {
            Logger.logError(error);
        }
    };


    const toggleAvatarForm = () => {
        setShowAvatarForm(!showAvatarForm);
    };


    const handleLogout = () => {
        Logger.logAuth('User logged out');
        localStorage.removeItem("jwtToken"); // Используем "jwtToken"
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <div className="oracle-container">
                    <p className="text-center my-3">Загрузка...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-wrapper">
                <div className="oracle-container">
                    <div className="oracle-error text-center my-3">{error}</div>
                    <div className="text-center">
                        <button
                            className="oracle-btn oracle-btn-primary"
                            onClick={() => navigate("/login")}
                        >
                            Войти в аккаунт
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!user) {
        navigate("/login");
        return null;
    }
    console.log("user.avatar.id:", user?.avatar?.id ?? "нет аватара");
    return (
        <div className="page-wrapper">
            <div className="oracle-container">
                <div className="oracle-hero oracle-hero-medical">
                    <div className="oracle-hero-content">
                        <h1 className="oracle-hero-title">Личный кабинет</h1>
                        <p className="oracle-hero-description">Управление аккаунтом и настройки</p>
                    </div>
                </div>

                <div className="oracle-section">
                    <div className="oracle-row">
                        <div className="oracle-col">
                            <div className="oracle-card">
                                <div className="user-info">
                                    <div className="avatar-section text-center mb-4">
                                        <div>
                                            <img
                                                src={
                                                    user?.avatar?.id
                                                        ? `http://localhost:8082/product/files/${user.avatar.id}`
                                                        : "/avatars/defaultPhoto.jpg"
                                                }
                                                onError={(e) => {
                                                    e.target.onerror = null; // предотвращает бесконечный цикл
                                                    e.target.src = "/avatars/defaultPhoto.jpg";
                                                }}
                                                alt="Аватар"
                                                className="avatar-circle mx-auto mb-3 oracle-avatar-circle"
                                            />
                                        </div>
                                        {showAvatarForm ? (
                                            <>
                                                <AvatarUploader
                                                    onSave={handleAvatarUpload}
                                                    onCancel={() => setShowAvatarForm(false)}
                                                />
                                                <button
                                                    className="oracle-btn oracle-btn-danger mt-2"
                                                    onClick={() => setShowAvatarForm(false)}
                                                >
                                                    Отмена
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className="oracle-btn oracle-btn-secondary"
                                                onClick={toggleAvatarForm}
                                            >
                                                Поменять аватарку
                                            </button>
                                        )}
                                    </div>
                                    <div className="user-details">
                                        <h2 className="oracle-card-title">Профиль</h2>
                                        <p className="mb-2"><strong>Имя:</strong> {user.userName}</p>
                                        <p className="mb-2"><strong>Почта:</strong> {user.email}</p>
                                        <p className="mb-2"><strong>Роль:</strong> {user.role}</p>
                                        <button
                                            onClick={handleLogout}
                                            className="oracle-btn-acc oracle-btn-acc-outline mt-3"
                                        >
                                            <FaSignOutAlt className="oracle-btn-icon" /> Выйти из аккаунта
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="oracle-col">
                            <div className="oracle-card">
                                <h2 className="oracle-card-title">Смена пароля</h2>
                                <form onSubmit={handlePasswordChange}>
                                    <div className="form-group mb-3">
                                        <input
                                            type="password"
                                            className="oracle-search-input"
                                            placeholder="Текущий пароль"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <input
                                            type="password"
                                            className="oracle-search-input"
                                            placeholder="Новый пароль"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <input
                                            type="password"
                                            className="oracle-search-input"
                                            placeholder="Повторите новый пароль"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="oracle-btn oracle-btn-primary oracle-btn-block">
                                        Изменить пароль
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="oracle-row mt-4">


                        {user?.role === 'ADMIN' && (
                            <div className="oracle-col">
                                <div className="oracle-card">
                                    <h2 className="oracle-card-title">Админ панель</h2>
                                    <div className="flex flex-col gap-2">
                                        <Link to="/create_product" className="oracle-btn-acc oracle-btn-acc-primary oracle-btn-block" style={{ marginBottom: '20px' }}>
                                            Добавить товар
                                        </Link>
                                        <Link to="/create_product_ai" className="oracle-btn-acc oracle-btn-acc-primary oracle-btn-block" style={{ marginBottom: '20px' }}>
                                            Добавить товар с помощью ИИ
                                        </Link>
                                        <Link to="/UsersList" className="oracle-btn-acc oracle-btn-acc-primary oracle-btn-block">
                                            Список пользователей
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AccountPage;
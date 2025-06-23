import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./App.css"; // Подключаем стили, если они есть
import axios from "axios";
import AvatarUploader from "./Musor/AvatarUploader";
import Header from './Header';
import Footer from './Footer';
import { FaSignOutAlt, FaKey, FaPlus, FaUsers, FaNewspaper, FaUserCircle, FaUser, FaEnvelope, FaShieldAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Logger from "./Logger";

const AccountPage = () => {
    const [showAvatarForm, setShowAvatarForm] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
                                <div className="profile-header">
                                    <div className="profile-avatar-section">
                                        <div className="profile-avatar-wrapper">
                                            <img
                                                src={
                                                    user?.avatar?.id
                                                        ? `http://localhost:8082/product/files/${user.avatar.id}`
                                                        : "/avatars/defaultPhoto.jpg"
                                                }
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/avatars/defaultPhoto.jpg";
                                                }}
                                                alt="Аватар пользователя"
                                                className="profile-avatar"
                                            />
                                            <div className="profile-avatar-overlay">
                                                <FaUser />
                                            </div>
                                        </div>
                                        {showAvatarForm ? (
                                            <div className="avatar-form-container">
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
                                            </div>
                                        ) : (
                                            <button
                                                className="oracle-btn oracle-btn-secondary oracle-btn-secondary2 avatar-change-btn"
                                                onClick={toggleAvatarForm}
                                            >
                                                <FaUser className="btn-icon" />
                                                Изменить фото
                                            </button>
                                        )}
                                    </div>
                                    <div className="profile-info-section">
                                        <div className="profile-details">
                                            <div className="profile-detail-item">
                                                <div className="profile-detail-icon">
                                                    <FaUser />
                                                </div>
                                                <div className="profile-detail-content">
                                                    <label className="profile-detail-label">Имя пользователя</label>
                                                    <span className="profile-detail-value">{user.userName}</span>
                                                </div>
                                            </div>
                                            <div className="profile-detail-item">
                                                <div className="profile-detail-icon">
                                                    <FaEnvelope />
                                                </div>
                                                <div className="profile-detail-content">
                                                    <label className="profile-detail-label">Email адрес</label>
                                                    <span className="profile-detail-value">{user.email}</span>
                                                </div>
                                            </div>
                                            <div className="profile-detail-item">
                                                <div className="profile-detail-icon">
                                                    <FaShieldAlt />
                                                </div>
                                                <div className="profile-detail-content">
                                                    <label className="profile-detail-label">Роль в системе</label>
                                                    <span className="profile-detail-value profile-role">
                                                        {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="oracle-btn oracle-btn-outline profile-logout-btn"
                                        >
                                            <FaSignOutAlt className="btn-icon" />
                                            Выйти из аккаунта
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="oracle-col">
                            <div className="oracle-card">
                                <div className="password-change-header">
                                    <div className="password-change-icon">
                                        <FaLock />
                                    </div>
                                    <h2 className="oracle-card-title">Смена пароля</h2>
                                </div>
                                <form onSubmit={handlePasswordChange} className="password-change-form">
                                    <div className="form-group mb-4">
                                        <label className="form-label">
                                            <FaShieldAlt className="form-label-icon" />
                                            Текущий пароль
                                        </label>
                                        <div className="password-input-wrapper">
                                            <input
                                                type={showOldPassword ? "text" : "password"}
                                                className="oracle-search-input password-input"
                                                placeholder="Введите текущий пароль"
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() => setShowOldPassword(!showOldPassword)}
                                            >
                                                {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group mb-4">
                                        <label className="form-label">
                                            <FaLock className="form-label-icon" />
                                            Новый пароль
                                        </label>
                                        <div className="password-input-wrapper">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                className="oracle-search-input password-input"
                                                placeholder="Введите новый пароль"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group mb-4">
                                        <label className="form-label">
                                            <FaLock className="form-label-icon" />
                                            Подтвердите новый пароль
                                        </label>
                                        <div className="password-input-wrapper">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="oracle-search-input password-input"
                                                placeholder="Повторите новый пароль"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                    <button type="submit" className="oracle-btn oracle-btn-primary oracle-btn-block password-submit-btn">
                                        <FaLock className="btn-icon" />
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
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./App.css"; // Подключаем стили, если они есть
import axios from "axios";
import AvatarUploader from "./Musor/AvatarUploader";
import Header from './Header';
import Footer from './Footer';
import { FaSignOutAlt, FaKey, FaPlus, FaUsers, FaNewspaper, FaUserCircle } from "react-icons/fa";

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
            console.log("Токен отсутствует, перенаправление на страницу входа");
            navigate("/login");
            return;
        }

        // Глобальный перехватчик для всех запросов
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    console.log("Ошибка 401: Токен истёк или недействителен");
                    localStorage.removeItem("jwtToken");
                    navigate("/login");
                }
                return Promise.reject(error);
            }
        );

        // Пробуем загрузить данные пользователя
        axios.get("http://localhost:8082/user", {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.data) {
                setUser(response.data);
                setLoading(false);
            } else {
                throw new Error('Нет данных пользователя');
            }
        })
        .catch(error => {
            console.error("Ошибка загрузки:", error);
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

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setErrorMessage("Пароли не совпадают");
            return;
        }
    
        setErrorMessage("");
    
        const token = localStorage.getItem("jwtToken");
        const requestData = {
            password: password,
            oldpassword: oldPassword
        };
    
        try {
            const response = await axios.post("http://localhost:8082/user/updatePassword", requestData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            console.log("Ответ сервера:", response.data);
        } catch (error) {
            console.error("Ошибка при смене пароля:", error);
        }
    };
    

    const handleAvatarUpload = async (croppedImage) => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            console.error("Токен отсутствует");
            return;
        }
    
        const formData = new FormData();
        formData.append("image", croppedImage, "avatar.png"); 
    
        try {
            const response = await axios.post("http://localhost:8082/user/changeAvatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });
    
            console.log("Аватар успешно загружен:", response.data);
            window.location.reload(); 
        } catch (error) {
            console.error("Ошибка загрузки аватарки:", error);
        }
    };    
    

    const toggleAvatarForm = () => {
        setShowAvatarForm(!showAvatarForm);
    };


    const handleLogout = () => {
        localStorage.removeItem("jwtToken"); // Используем "jwtToken"
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <Header />
                <div className="oracle-container">
                    <p className="text-center my-3">Загрузка...</p>
                </div>
                <Footer />
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
                                                src={user?.avatar || "/avatars/defaultPhoto.jpg"} 
                                                alt="Аватар" 
                                                className="avatar-circle mx-auto mb-3 oracle-avatar-circle"
                                            />
                                        </div>
                                        {showAvatarForm ? (
                                            <AvatarUploader 
                                                onSave={handleAvatarUpload} 
                                                onCancel={() => setShowAvatarForm(false)}
                                            />
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
                                        <FaKey className="oracle-btn-icon" /> Изменить пароль
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
                                        <Link to="/create_news" className="oracle-btn-acc oracle-btn-acc-primary oracle-btn-block" style={{marginBottom: '20px'}}>
                                            Создать новость <FaNewspaper className="oracle-btn-icon" />
                                        </Link>
                                        <Link to="/create_product" className="oracle-btn-acc oracle-btn-acc-primary oracle-btn-block" style={{marginBottom: '20px'}}>
                                            Добавить товар <FaPlus className="oracle-btn-icon" />
                                        </Link>
                                        <Link to="/users_list" className="oracle-btn-acc oracle-btn-acc-primary oracle-btn-block">
                                            Список пользователей <FaUsers className="oracle-btn-icon" />
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
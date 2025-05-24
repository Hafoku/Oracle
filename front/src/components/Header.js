import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Используем Link вместо <a>
import "./App.css"; // Подключаем стили
import logo from './assets/static/logo.png'; // Добавляем импорт логотипа
import { FaBars, FaTimes, FaMapMarkerAlt, FaPhone, FaEnvelope, FaShoppingCart, FaPills, FaSearch, FaUserMd } from 'react-icons/fa';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);

    // Отслеживаем скролл страницы
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Закрываем боковое меню при клике на ссылку
    const closeSideMenu = () => {
        setIsSideMenuOpen(false);
    };

    // Переключение выпадающего меню
    const toggleMobileDropdown = (index) => {
        setActiveDropdown(activeDropdown === index ? null : index);
    };

    // Переключение поиска
    const toggleSearch = () => {
        setSearchOpen(!searchOpen);
    };

    return (
        <>
            {/* Main Header */}
            <div className={`oracle-header ${isScrolled ? 'oracle-header-scrolled' : ''}`}>
                <div className="oracle-container">
                    <div className="oracle-nav">
                        {/* Logo */}
                        <div className="oracle-logo">
                            <Link to="/">
                                <img src={logo} alt="Oracle Pharmacy" className="oracle-logo-img" />
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <div className={`oracle-header-search ${searchOpen ? 'active' : ''}`}>
                            <input 
                                type="text" 
                                placeholder="Поиск лекарств и товаров..." 
                                className="oracle-search-input"
                            />
                            <button className="oracle-search-btn">
                                <FaSearch />
                            </button>
                        </div>

                        {/* Navigation */}
                        <ul className="oracle-nav-links">
                            <li className="oracle-nav-item">
                                <Link to="/" className="oracle-nav-link">Главная</Link>
                            </li>
                            <li className="oracle-nav-item">
                                <Link to="/products" className="oracle-nav-link">Каталог</Link>
                            </li>
                            <li className="oracle-nav-item">
                                <Link to="/about" className="oracle-nav-link">О нас</Link>
                            </li>
                            <li className="oracle-nav-item">
                                <Link to="/contacts" className="oracle-nav-link">Контакты</Link>
                            </li>
                        </ul>

                        {/* Action Buttons */}
                        <div className="oracle-nav-actions">
                            <button className="oracle-action-btn" onClick={toggleSearch}>
                                <FaSearch />
                            </button>
                            <Link to="/account" className="oracle-action-btn">
                                <FaUserMd />
                            </Link>
                            <Link to="/cart" className="oracle-action-btn oracle-cart-badge" data-count="0">
                                <FaShoppingCart />
                            </Link>
                            <button 
                                className="oracle-mobile-toggle" 
                                onClick={() => setIsSideMenuOpen(true)}
                                aria-label="Открыть меню"
                            >
                                <FaBars />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Side Menu */}
            <div className={`oracle-side-menu ${isSideMenuOpen ? 'active' : ''}`}>
                <div className="oracle-side-menu-header">
                    <div className="oracle-side-menu-logo">
                        <FaPills className="oracle-side-menu-icon" />
                        <span>Oracle</span>
                    </div>
                    <button 
                        className="oracle-side-menu-close" 
                        onClick={closeSideMenu}
                        aria-label="Закрыть меню"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="oracle-side-menu-search">
                    <input 
                        type="text" 
                        placeholder="Поиск лекарств и товаров..." 
                        className="oracle-search-input"
                    />
                    <button className="oracle-search-btn">
                        <FaSearch />
                    </button>
                </div>

                <nav className="oracle-side-menu-nav">
                    <div className="oracle-side-menu-item">
                        <Link to="/" className="oracle-side-menu-link" onClick={closeSideMenu}>
                            Главная
                        </Link>
                    </div>

                    <div className="oracle-side-menu-item">
                        <Link to="/products" className="oracle-side-menu-link" onClick={closeSideMenu}>
                            Каталог
                        </Link>
                    </div>

                    <div className={`oracle-side-menu-item ${activeDropdown === 1 ? 'active' : ''}`}>
                        <div className="oracle-side-menu-link" onClick={() => toggleMobileDropdown(1)}>
                            Категории <span className="oracle-mobile-dropdown-arrow">▾</span>
                        </div>
                        <div className="oracle-side-menu-dropdown">
                            <Link to="/category/prescription" onClick={closeSideMenu}>Рецептурные препараты</Link>
                            <Link to="/category/otc" onClick={closeSideMenu}>Безрецептурные препараты</Link>
                            <Link to="/category/supplements" onClick={closeSideMenu}>Витамины и добавки</Link>
                            <Link to="/category/personal-care" onClick={closeSideMenu}>Товары для здоровья</Link>
                        </div>
                    </div>

                    <div className="oracle-side-menu-item">
                        <Link to="/about" className="oracle-side-menu-link" onClick={closeSideMenu}>
                            О нас
                        </Link>
                    </div>

                    <div className="oracle-side-menu-item">
                        <Link to="/contacts" className="oracle-side-menu-link" onClick={closeSideMenu}>
                            Контакты
                        </Link>
                    </div>

                    <div className="oracle-side-menu-item">
                        <Link to="/account" className="oracle-side-menu-link" onClick={closeSideMenu}>
                            Личный кабинет
                        </Link>
                    </div>
                </nav>

                <div className="oracle-side-menu-contacts">
                    <a href="tel:+77780988948" className="oracle-side-menu-contact-link">
                        <p><FaPhone /> 8 (778) 098-89-48</p>
                    </a>
                    <a href="mailto:oracle@pharmacy.kz" className="oracle-side-menu-contact-link">
                        <p><FaEnvelope /> oracle@pharmacy.kz</p>
                    </a>
                    <a href="https://2gis.kz/astana/inside/9570784863331562/firm/70000001068924455?m=71.413628%2C51.133916%2F18.31" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="oracle-side-menu-contact-link">
                        <p><FaMapMarkerAlt /> Ул. Кабанбай батыр проспект, 17</p>
                    </a>
                </div>
            </div>
        </>
    );
};

export default Header;

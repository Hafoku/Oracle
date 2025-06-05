import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; // Используем Link и useNavigate
import "./App.css"; // Подключаем стили
import "./styles/Header.css";
import logo from './assets/static/logo.png'; // Добавляем импорт логотипа
import { FaBars, FaTimes, FaMapMarkerAlt, FaPhone, FaEnvelope, FaShoppingCart, FaPills, FaSearch, FaUserMd } from 'react-icons/fa';
import Logger from './Logger';
import axios from 'axios';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const [cartCount, setCartCount] = useState(0); // State for cart count
    const [headerVisible, setHeaderVisible] = useState(true); // New state for header visibility

    const navigate = useNavigate(); // Initialize navigate hook
    const lastScrollY = useRef(0); // Use useRef to store previous scroll position

    // Отслеживаем скролл страницы
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Determine scroll direction
            const isScrollingDown = currentScrollY > lastScrollY.current;

            // Update isScrolled state (optional, if still needed for other styling)
            setIsScrolled(currentScrollY > 10);

            // Logic to show/hide header
            // Hide header when scrolling down past a threshold (e.g., header height)
            // Show header when scrolling up
            // Always show header at the very top of the page
            if (currentScrollY < 50) { // Show header at the top
                setHeaderVisible(true);
            } else if (isScrollingDown && headerVisible) {
                setHeaderVisible(false);
            } else if (!isScrollingDown && !headerVisible) {
                setHeaderVisible(true);
            }

            lastScrollY.current = currentScrollY; // Update last scroll position
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [headerVisible]); // Add headerVisible to dependency array

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

    // Handle search input change
    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // Handle search submission
    const handleSearchSubmit = (event) => {
        event.preventDefault(); // Prevent form default submission
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false); // Close search bar after submission (optional)
            // Optionally clear the search input after navigation: setSearchQuery('');
        }
    };

    // Fetch cart count
    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            const fetchCounts = async () => {
                try {
                    // Fetch cart count (using GET /cart)
                    const cartResponse = await axios.get('/cart', {
                         headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    // Assuming cartResponse.data might be an object with cart items list
                    // Adjust this based on the actual /cart endpoint response structure
                    if (cartResponse.data && cartResponse.data.cartItems) {
                         setCartCount(cartResponse.data.cartItems.length);
                    } else if (Array.isArray(cartResponse.data)) { // Fallback if it's just an array
                         setCartCount(cartResponse.data.length);
                    }

                } catch (err) {
                    Logger.logError('Error fetching cart count', err); // Updated log message
                    // Optionally clear counts on error
                     setCartCount(0);
                }
            };
            fetchCounts();
        } else {
            // Clear counts if no token
            setCartCount(0);
        }
    }, []); // Empty dependency array means this runs once on mount

    return (
        <>
            {/* Main Header */}
            <div className={`oracle-header ${isScrolled ? 'oracle-header-scrolled' : ''} ${headerVisible ? '' : 'header-hidden'}`}> {/* Apply header-hidden class */}
                <div className="oracle-container">
                    <div className="oracle-nav">
                        {/* Logo */}
                        <div className="oracle-logo">
                            <Link to="/">
                                <img src={logo} alt="Oracle Pharmacy" className="oracle-logo-img" />
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <form className={`oracle-header-search ${searchOpen ? 'active' : ''}`} onSubmit={handleSearchSubmit}> {/* Wrap in form */}
                            <input 
                                type="text" 
                                placeholder="Поиск лекарств и товаров..." 
                                className="oracle-search-input"
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                            />
                            <button type="submit" className="oracle-search-btn"> {/* Type submit */}
                                <FaSearch />
                            </button>
                        </form>

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
                            <Link to="/account" className="oracle-action-btn">
                                <FaUserMd />
                            </Link>
                            <Link to="/cart" className="oracle-action-btn oracle-cart-badge" data-count={cartCount}>
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
                     <form onSubmit={handleSearchSubmit}> {/* Wrap in form */} {/* Use the same submit handler */}
                        <input 
                            type="text" 
                            placeholder="Поиск лекарств и товаров..." 
                            className="oracle-search-input"
                             value={searchQuery}
                             onChange={handleSearchInputChange}
                        />
                        <button type="submit" className="oracle-search-btn"> {/* Type submit */} {/* Use the same submit handler */} 
                            <FaSearch />
                        </button>
                     </form>
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

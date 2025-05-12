import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import { 
    FaFacebook, FaInstagram, FaPills, FaPhoneAlt, 
    FaEnvelope, FaMapMarkerAlt, FaWhatsapp
} from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="oracle-footer">
            <div className="oracle-container">
                <div className="oracle-footer-main">
                    {/* Logo and About */}
                    <div className="oracle-footer-brand">
                        <div className="oracle-footer-logo">
                            <FaPills className="oracle-footer-logo-icon" />
                            <span>Oracle</span>
                        </div>
                        <p className="oracle-footer-about">
                            Аптека с широким ассортиментом качественных лекарственных препаратов
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="oracle-footer-nav">
                        <div className="oracle-footer-links-group">
                            <h3 className="oracle-footer-title">Навигация</h3>
                            <ul className="oracle-footer-links">
                                <li><Link to="/">Главная</Link></li>
                                <li><Link to="/products">Каталог</Link></li>
                                <li><Link to="/about">О нас</Link></li>
                                <li><Link to="/contacts">Контакты</Link></li>
                            </ul>
                        </div>

                        {/* Categories */}
                        <div className="oracle-footer-links-group">
                            <h3 className="oracle-footer-title">Категории</h3>
                            <ul className="oracle-footer-links">
                                <li><Link to="/category/prescription">Рецептурные препараты</Link></li>
                                <li><Link to="/category/otc">Безрецептурные препараты</Link></li>
                                <li><Link to="/category/supplements">Витамины и добавки</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="oracle-footer-links-group">
                            <h3 className="oracle-footer-title">Контакты</h3>
                            <ul className="oracle-footer-contact">
                                <li><FaPhoneAlt className="oracle-footer-icon" /> <a href="tel:+77780988948">8 (778) 098-89-48</a></li>
                                <li><FaEnvelope className="oracle-footer-icon" /> <a href="mailto:oracle@pharmacy.kz">oracle@pharmacy.kz</a></li>
                                <li><FaMapMarkerAlt className="oracle-footer-icon" /> <span>Ул. Кабанбай батыр, 17</span></li>
                                <li><FaWhatsapp className="oracle-footer-icon" /> <a href="https://api.whatsapp.com/send/?phone=77780988948">WhatsApp</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="oracle-footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Oracle Pharmacy</p>
                    <div className="oracle-footer-social">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <FaFacebook />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <FaInstagram />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

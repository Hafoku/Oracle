import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import '../styles/Cart.css';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            navigate("/login");
            return;
        }
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            const response = await axios.get('http://localhost:8082/cart', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
                }
            });
            if (response.data) {
                setCartItems(response.data.products || []);
            } else {
                setCartItems([]);
            }
            setLoading(false);
        } catch (err) {
            setError('Ошибка загрузки корзины');
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, delta) => {
        const cartItem = cartItems.find(item => item.id === itemId);
        if (!cartItem) return;
        if (cartItem.quantity + delta < 1) return;

        console.log(delta);
        
        try {
            await axios.put(`http://localhost:8082/cart/items/${itemId}`, delta, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                    'Content-Type': 'application/json'
                }
            });
            fetchCartItems(); // Обновляем состояние корзины после успешного обновления
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem("jwtToken");
                navigate("/login");
            } else {
                setError('Ошибка обновления количества');
            }
        }
    };

    const removeItem = async (itemId) => {
        try {
            await axios.delete(`http://localhost:8082/cart/items/${itemId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
                }
            });
            fetchCartItems(); // Обновляем состояние корзины
        } catch (err) {
            setError('Ошибка удаления товара');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    };

    if (loading) {
        return (
            <div className="oracle-page-wrapper">
                <div className="oracle-container">
                    <div className="oracle-loading">
                        <div className="loader"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="oracle-page-wrapper">
                <div className="oracle-container">
                    <div className="oracle-error-message">
                        <span>{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="oracle-page-wrapper">
            {/* Hero Section */}
            <div className="oracle-products-hero">
                <div className="oracle-container">
                    <h1 className="oracle-hero-title">Корзина</h1>
                    <p className="oracle-hero-subtitle">Ваши выбранные товары</p>
                </div>
            </div>

            <div className="oracle-container">
                <div className="oracle-form-container">
                    {cartItems.length === 0 ? (
                        <div className="oracle-empty-cart">
                            <FaShoppingCart className="oracle-empty-cart-icon" />
                            <h2>Ваша корзина пуста</h2>
                            <p>Добавьте товары из нашего каталога</p>
                            <button 
                                className="oracle-btn oracle-btn-primary"
                                onClick={() => navigate('/products')}
                            >
                                Перейти в магазин
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="oracle-cart-items">
                                {cartItems.map(item => (
                                    <div key={item.id} className="oracle-cart-item">
                                        <div className="oracle-cart-item-content">
                                            <div className="oracle-cart-item-image">
                                                <img 
                                                    src={
                                                        item.product.avatar 
                                                            ? `http://localhost:8082/files/${item.product.avatar.id}`
                                                            : '/images/no-image.png'
                                                    }
                                                    alt={item.product.name}
                                                    onError={(e) => {
                                                        e.target.src = '/images/no-image.png';
                                                    }}
                                                />
                                            </div>
                                            <div className="oracle-cart-item-details">
                                                <h3 className="oracle-cart-item-title">{item.product.name}</h3>
                                                <p className="oracle-cart-item-price">Цена за 1 шт. товара: {item.product.price} ₸</p>
                                            </div>
                                            <div className="oracle-cart-item-actions">
                                                <div className="oracle-quantity-controls">
                                                    <button 
                                                        className="oracle-btn oracle-btn-secondary oracle-btn-icon"
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                    <span className="oracle-quantity">{item.quantity}</span>
                                                    <button 
                                                        className="oracle-btn oracle-btn-secondary oracle-btn-icon"
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>
                                                <button 
                                                    className="oracle-btn oracle-btn-icon oracle-btn-danger"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="oracle-cart-summary">
                                <div className="oracle-cart-total">
                                    <span>Общая стоимость корзины:</span>
                                    <span className="oracle-cart-total-price">{calculateTotal()} ₸</span>
                                </div>
                                <div className="oracle-cart-actions">
                                    <button 
                                        className="oracle-btn oracle-btn-secondary-2"
                                        onClick={() => navigate('/products')}
                                    >
                                        <FaArrowLeft /> Продолжить покупки
                                    </button>
                                    <button 
                                        className="oracle-btn oracle-btn-primary"
                                        onClick={() => navigate('/checkout')}
                                    >
                                        Оформить заказ
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart;

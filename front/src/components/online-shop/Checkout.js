import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; // Подключаем общие стили
import '../styles/checkout.css'; // Подключаем стили оформления заказа
import { FaExclamationCircle, FaShoppingCart } from 'react-icons/fa';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [shippingInfo, setShippingInfo] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: '',
        phone: '',
        email: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            navigate("/login");
            return;
        }
        fetchCartItems();
    }, [navigate]);

    const fetchCartItems = async () => {
        try {
            const response = await axios.get('http://2.133.132.170:8082/cart', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
                }
            });
            if (response.data && response.data.products) {
                setCartItems(response.data.products);
            } else {
                setCartItems([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching cart items for checkout:', err);
            setError('Ошибка загрузки данных корзины');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const token = localStorage.getItem("jwtToken");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            // Here you would typically send the order information to your backend.
            // The backend would then handle payment initiation with a payment gateway.
            // For this example, we'll just simulate success.

            console.log('Submitting order with shipping info:', shippingInfo);
            // Example backend call (replace with your actual API endpoint)
            // await axios.post('http://2.133.132.170:8082/order', { cartItems, shippingInfo }, {
            //     headers: { Authorization: `Bearer ${token}` }
            // });

            // Simulate successful order creation and redirect to a success page or clear cart
            alert('Заказ успешно оформлен!');
            // You would typically clear the cart on the backend after successful order
            navigate('/'); // Redirect to an order success page

        } catch (err) {
            console.error('Error submitting order:', err);
            setError('Ошибка при оформлении заказа.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="oracle-page-wrapper">
                <div className="oracle-container">
                    <div className="oracle-loading">
                        <div className="loader"></div>
                        <p>Загрузка корзины...</p>
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
                        <FaExclamationCircle />
                        <span>{error}</span>
                    </div>
                    <button
                        className="oracle-btn oracle-btn-primary oracle-mt-2"
                        onClick={() => navigate('/cart')}
                    >
                        Вернуться в корзину
                    </button>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="oracle-page-wrapper">
                <div className="oracle-container">
                    <div className="oracle-empty-cart">
                        <FaShoppingCart className="oracle-empty-cart-icon" />
                        <h2>Ваша корзина пуста</h2>
                        <p>Добавьте товары перед оформлением заказа</p>
                        <button
                            className="oracle-btn oracle-btn-primary"
                            onClick={() => navigate('/products')}
                        >
                            Перейти в магазин
                        </button>
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
                    <h1 className="oracle-hero-title">Оформление заказа</h1>
                    <p className="oracle-hero-subtitle">Введите данные для доставки и оплаты</p>
                </div>
            </div>

            <div className="oracle-container">
                <div className="checkout-container">
                    <div className="checkout-form">
                        <h2>Информация о доставке</h2>
                        <form onSubmit={handleSubmitOrder}>
                            <div className="oracle-form-group">
                                <label className="oracle-form-label">Адрес</label>
                                <input type="text" name="address" value={shippingInfo.address} onChange={handleInputChange} className="oracle-form-input" required />
                            </div>
                            <div className="oracle-form-group">
                                <label className="oracle-form-label">Город</label>
                                <input type="text" name="city" value={shippingInfo.city} onChange={handleInputChange} className="oracle-form-input" required />
                            </div>
                            <div className="oracle-form-group">
                                <label className="oracle-form-label">Почтовый индекс</label>
                                <input type="text" name="postalCode" value={shippingInfo.postalCode} onChange={handleInputChange} className="oracle-form-input" required />
                            </div>
                            <div className="oracle-form-group">
                                <label className="oracle-form-label">Страна</label>
                                <input type="text" name="country" value={shippingInfo.country} onChange={handleInputChange} className="oracle-form-input" required />
                            </div>
                            <div className="oracle-form-group">
                                <label className="oracle-form-label">Номер телефона</label>
                                <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleInputChange} className="oracle-form-input" required />
                            </div>
                            <div className="oracle-form-group">
                                <label className="oracle-form-label">Email</label>
                                <input type="email" name="email" value={shippingInfo.email} onChange={handleInputChange} className="oracle-form-input" required />
                            </div>

                            {/* Payment Section Placeholder */}
                            <div className="payment-section">
                                <h3>Способ оплаты</h3>
                                <p>Здесь будет форма или виджет для ввода данных платежной карты (интеграция с платежной системой).</p>
                                {/* Example: <PaymentForm onPaymentSuccess={handlePaymentSuccess} /> */}
                             </div>

                            <div className="checkout-actions">
                                <button type="submit" className="oracle-btn oracle-btn-primary" disabled={submitting || cartItems.length === 0}>
                                    {submitting ? 'Оформление...' : 'Подтвердить заказ'}
                                </button>
                                <button type="button" className="oracle-btn oracle-btn-secondary-2" onClick={() => navigate('/cart')}>
                                    Вернуться в корзину
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="order-summary">
                        <h2>Сводка заказа</h2>
                        <div className="summary-items">
                            {cartItems.map(item => (
                                <div key={item.id} className="summary-item">
                                    <span>{item.product.name} x {item.quantity}</span>
                                    <span>{item.product.price * item.quantity} ₸</span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-total">
                            <span>Итого:</span>
                            <span>{calculateTotal()} ₸</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout; 
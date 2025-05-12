import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

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
            const response = await axios.get('http://localhost:8082/api/cart', {
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
            await axios.put(`http://localhost:8082/api/cart/items/${itemId}`, delta, {
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
            await axios.delete(`http://localhost:8082/api/cart/items/${itemId}`, {
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

    if (loading) return <div className="page-container">Загрузка...</div>;
    if (error) return <div className="page-container">{error}</div>;

    return (
        <div className="page-container">
            <div className="auth-box" style={{ maxWidth: '800px' }}>
                <h1 className="section-title">Корзина</h1>
                
                {cartItems.length === 0 ? (
                    <div className="text-center mb-3">
                        <p>Ваша корзина пуста</p>
                        <button 
                            className="button button-primary mt-2"
                            onClick={() => navigate('/shop')}
                        >
                            Перейти в магазин
                        </button>
                    </div>
                ) : (
                    <>
                        {cartItems.map(item => (
                            <div key={item.id} className="card mb-2">
                                <div className="grid-2" style={{ alignItems: 'center' }}>
                                    <div className="flex items-center gap-2">
                                        <div className="product-image" style={{ width: '100px', height: '100px' }}>
                                            {item.product.avatar ? (
                                                <img 
                                                    src={`http://localhost:8082/api/files/${item.product.avatar.id}`}
                                                    alt={item.product.name}
                                                />
                                            ) : (
                                                <img 
                                                    src="/images/no-image.png"
                                                    alt="Изображение отсутствует"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0 }}>{item.product.name}</h3>
                                            <p className="price">{item.product.price} ₽</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1">
                                            <button 
                                                className="button button-secondary"
                                                onClick={() => updateQuantity(item.id, -1)}
                                                style={{ padding: '0.5rem 1rem' }}
                                            >
                                                -
                                            </button>
                                            <span className="mx-2">{item.quantity}</span>
                                            <button 
                                                className="button button-secondary"
                                                onClick={() => updateQuantity(item.id, 1)}
                                                style={{ padding: '0.5rem 1rem' }}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button 
                                            className="button button-secondary"
                                            onClick={() => removeItem(item.id)}
                                            style={{ padding: '0.5rem 1rem' }}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="highlight-box mt-3">
                            <div className="flex justify-between items-center">
                                <h3>Итого:</h3>
                                <span className="price">{calculateTotal()} ₽</span>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                            <button 
                                className="button button-primary"
                                style={{ flex: 1 }}
                                onClick={() => navigate('/checkout')}
                            >
                                Оформить заказ
                            </button>
                            <button 
                                className="button button-secondary"
                                style={{ flex: 1 }}
                                onClick={() => navigate('/shop')}
                            >
                                Продолжить покупки
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart;

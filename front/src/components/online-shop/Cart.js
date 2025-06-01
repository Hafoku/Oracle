import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../App.css';
import '../styles/Cart.css';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaArrowLeft, FaEdit, FaCheck } from 'react-icons/fa';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
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
            const response = await axios.get('http://localhost:8082/cart', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
                }
            });
            if (response.data) {
                const itemsWithIds = response.data.products ? response.data.products.map(item => ({ ...item, draggableId: `item-${item.id}` })) : [];
                setCartItems(itemsWithIds);
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

        try {
            await axios.put(`http://localhost:8082/cart/items/${itemId}`, delta, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                    'Content-Type': 'application/json'
                }
            });
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? { ...item, quantity: item.quantity + delta } : item
                )
            );
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
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
        } catch (err) {
            setError('Ошибка удаления товара');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    };

    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const reorderedItems = Array.from(cartItems);
        const [removed] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, removed);

        setCartItems(reorderedItems);
    };

    const toggleEditing = () => {
        setIsEditing(!isEditing);
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
                            <div className="cart-header">
                                <h2>Товары в корзине</h2>
                                <button
                                    className="oracle-btn oracle-btn-secondary-2 oracle-btn-sm"
                                    onClick={toggleEditing}
                                >
                                    {isEditing ? <><FaCheck /> Готово</> : <><FaEdit /> Редактировать</>}
                                </button>
                            </div>
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="cart-items" direction="vertical" isDropDisabled={!isEditing}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="oracle-cart-items"
                                        >
                                            {cartItems.map((item, index) => (
                                                <Draggable key={item.draggableId} draggableId={item.draggableId} index={index} isDragDisabled={!isEditing}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`oracle-cart-item ${snapshot.isDragging ? 'is-dragging' : ''} ${isEditing ? 'is-editable' : ''}`}
                                                        >
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
                                                                    {!isEditing && (
                                                                        <div className="oracle-quantity-controls">
                                                                            <button
                                                                                className="oracle-btn oracle-btn-secondary oracle-btn-icon"
                                                                                onClick={() => updateQuantity(item.id, -1)}
                                                                                aria-label="Уменьшить количество"
                                                                            >
                                                                                <FaMinus />
                                                                            </button>
                                                                            <span className="oracle-quantity">{item.quantity}</span>
                                                                            <button
                                                                                className="oracle-btn oracle-btn-secondary oracle-btn-icon"
                                                                                onClick={() => updateQuantity(item.id, 1)}
                                                                                aria-label="Увеличить количество"
                                                                            >
                                                                                <FaPlus />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    {isEditing && (
                                                                        <button
                                                                            className="oracle-btn oracle-btn-icon oracle-btn-danger"
                                                                            onClick={() => removeItem(item.id)}
                                                                            aria-label="Удалить товар"
                                                                        >
                                                                            <FaTrash />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>

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
                                        disabled={cartItems.length === 0}
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

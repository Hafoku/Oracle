import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import Logger from '../Logger';

const ProductDetails = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchData = async () => {
            try {
                Logger.logInfo('Fetching product details', { productId: id });
                
                // Получаем данные о продукте
                const productResponse = await axios.get(`/product/${id}`, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                Logger.logSuccess('Product details fetched successfully', { productId: id });
                setProduct(productResponse.data);
                
                // Получаем данные о текущем пользователе
                const userResponse = await axios.get(`/user/current`, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                // Проверяем, есть ли у пользователя роль ADMIN
                if (userResponse.data && userResponse.data.role) {
                    setIsAdmin(userResponse.data.role.name === 'ADMIN');
                }
                
            } catch (err) {
                Logger.logError('Error fetching product details', { 
                    productId: id, 
                    error: err.response?.data || err.message 
                });

                if (err.response?.status === 401) {
                    localStorage.removeItem("jwtToken");
                    navigate("/login");
                } else if (err.response?.status === 404) {
                    setError('Товар не найден');
                } else if (err.response?.status === 500) {
                    setError('Ошибка сервера при загрузке товара. Пожалуйста, попробуйте позже.');
                } else {
                    setError('Ошибка при загрузке данных товара');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const addToCart = async () => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            Logger.logInfo('Adding product to cart', { productId: id });
            
            await axios.post(`/cart/add`, null, {
                params: { 
                    productId: Number(id),
                    quantity: 1
                },
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            Logger.logSuccess('Product added to cart successfully', { productId: id });
            alert('Товар добавлен в корзину!');
        } catch (err) {
            Logger.logError('Error adding product to cart', { 
                productId: id, 
                error: err.response?.data || err.message 
            });

            if (err.response?.status === 401) {
                localStorage.removeItem("jwtToken");
                navigate("/login");
            } else {
                alert('Ошибка при добавлении товара в корзину');
            }
        }
    };

    const navigateToUpdate = () => {
        navigate(`/update_product/${id}`);
    };

    const deleteProduct = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
            return;
        }

        const token = localStorage.getItem("jwtToken");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            Logger.logInfo('Deleting product', { productId: id });
            
            await axios.delete(`/product/${id}`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            Logger.logSuccess('Product deleted successfully', { productId: id });
            alert('Товар успешно удален!');
            navigate('/products');
        } catch (err) {
            Logger.logError('Error deleting product', { 
                productId: id, 
                error: err.response?.data || err.message 
            });

            if (err.response?.status === 401) {
                localStorage.removeItem("jwtToken");
                navigate("/login");
            } else {
                alert('Ошибка при удалении товара');
            }
        }
    };

    if (loading) return (
        <div className="oracle-container">
            <div className="oracle-loading">Загрузка товара...</div>
        </div>
    );
    
    if (error) return (
        <div className="oracle-container">
            <div className="oracle-error">
                <h2>Ошибка</h2>
                <p>{error}</p>
                <button 
                    className="oracle-btn oracle-btn-primary"
                    onClick={() => navigate('/products')}
                >
                    Вернуться к списку товаров
                </button>
            </div>
        </div>
    );
    
    if (!product) return (
        <div className="oracle-container">
            <div className="oracle-error">
                <h2>Товар не найден</h2>
                <p>Запрашиваемый товар не существует или был удален.</p>
                <button 
                    className="oracle-btn oracle-btn-primary"
                    onClick={() => navigate('/products')}
                >
                    Вернуться к списку товаров
                </button>
            </div>
        </div>
    );

    return (
        <div className="oracle-container">
            <div className="oracle-product-details">
                <div className="oracle-product-details-grid">
                    <div className="oracle-product-gallery">
                        <div className="oracle-product-image-wrapper">
                            <img 
                                src={product.avatar ? `http://localhost:8082/product/files/${product.avatar.id}` : '/images/no-image.png'}
                                alt={product.name}
                                className="oracle-product-detail-image"
                                onError={(e) => {
                                    console.error('Ошибка загрузки изображения:', e);
                                    e.target.src = "/images/no-image.png";
                                }}
                            />
                        </div>
                    </div>
                    <div className="oracle-product-info">
                        <h1 className="oracle-product-detail-title">{product.name}</h1>
                        <div className="oracle-product-category">
                            {product.type === "first-aid" ? "Аптечки первой помощи" :
                             product.type === "equipment" ? "Медицинское оборудование" :
                             product.type === "medicine" ? "Медикаменты" :
                             product.type === "prescription" ? "Рецептурные препараты" : 
                             product.type === "otc" ? "Безрецептурные препараты" : 
                             product.type === "supplements" ? "Витамины и добавки" :
                             "Другое"}
                        </div>
                        <p className="oracle-product-detail-description">{product.description}</p>
                        <div className="oracle-product-detail-price-box">
                            <div className="oracle-product-detail-price-wrapper">
                                <span className="oracle-product-detail-price">{product.price} ₸</span>
                                {product.oldPrice && (
                                    <span className="oracle-product-detail-old-price">{product.oldPrice} ₸</span>
                                )}
                            </div>
                            <button 
                                className="oracle-btn oracle-btn-primary oracle-btn-large"
                                onClick={addToCart}
                                disabled={product.stock === 0}
                            >
                                {product.stock === 0 ? 'Нет в наличии' : 'Добавить в корзину'}
                            </button>
                        </div>
                        {isAdmin && (
                            <div className="oracle-product-admin-actions">
                                <button 
                                    className="oracle-btn oracle-btn-secondary-2"
                                    onClick={navigateToUpdate}
                                >
                                    Редактировать товар
                                </button>
                                <button 
                                    className="oracle-btn oracle-btn-danger"
                                    onClick={deleteProduct}
                                >
                                    Удалить товар
                                </button>
                            </div>
                        )}
                        {product.specifications && (
                            <div className="oracle-product-specifications">
                                <h3 className="oracle-section-title">Характеристики</h3>
                                <div className="oracle-specifications-grid">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key} className="oracle-specification-item">
                                            <span className="oracle-specification-label">{key}</span>
                                            <span className="oracle-specification-value">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;

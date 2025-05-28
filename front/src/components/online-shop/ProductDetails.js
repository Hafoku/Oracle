import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

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
                // Получаем данные о продукте
                const productResponse = await axios.get(`http://localhost:8082/product/${id}`, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                setProduct(productResponse.data);
                
                // Получаем данные о текущем пользователе
                const userResponse = await axios.get(`http://localhost:8082/user/current`, {
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
                if (err.response?.status === 401) {
                    localStorage.removeItem("jwtToken");
                    navigate("/login");
                } else {
                    setError('Ошибка загрузки данных');
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
            await axios.post(`http://localhost:8082/cart/add`, null, {
                params: { 
                    productId: Number(id),
                    quantity: 1
                },
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            alert('Товар добавлен в корзину!');
        } catch (err) {
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

    if (loading) return <div className="page-container">Загрузка...</div>;
    if (error) return <div className="page-container">{error}</div>;
    if (!product) return <div className="page-container">Товар не найден</div>;

    return (
        <div className="page-container">
            <div className="card">
                <div className="grid-2">
                    <div className="product-gallery">
                        <div className="card-image">
                            {product.avatar ? (
                                <img 
                                    src={`http://localhost:8082/files/${product.avatar.id}`}
                                    alt={product.name}
                                />
                            ) : (
                                <img 
                                    src="/images/no-image.png"
                                    alt="Изображение отсутствует"
                                />
                            )}
                        </div>
                    </div>
                    <div className="product-info">
                        <h1 className="section-title">{product.name}</h1>
                        <div className="badge mb-2">{product.type}</div>
                        <p className="section-description">{product.description}</p>
                        <div className="highlight-box">
                            <div className="flex justify-between items-center">
                                <span className="price">{product.price} ₽</span>
                                <button className="button button-primary" onClick={addToCart}>
                                    Добавить в корзину
                                </button>
                            </div>
                        </div>
                        {isAdmin && (
                            <div className="mt-2">
                                <button 
                                    className="button button-secondary"
                                    onClick={navigateToUpdate}
                                    style={{ width: '100%' }}
                                >
                                    Редактировать товар
                                </button>
                            </div>
                        )}
                        {product.specifications && (
                            <div className="mt-3">
                                <h3 className="mb-2">Характеристики</h3>
                                <div className="grid-1 gap-1">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-gray">{key}</span>
                                            <span>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {product.relatedProducts && product.relatedProducts.length > 0 && (
                <div className="mt-3">
                    <h2 className="section-title">Похожие товары</h2>
                    <div className="grid-4">
                        {product.relatedProducts.map(relatedProduct => (
                            <div key={relatedProduct.id} className="card">
                                <div className="card-image">
                                    {relatedProduct.image ? (
                                        <img 
                                            src={`http://localhost:8082/files/${relatedProduct.image.id}`}
                                            alt={relatedProduct.name}
                                        />
                                    ) : (
                                        <img 
                                            src="/images/no-image.png"
                                            alt="Изображение отсутствует"
                                        />
                                    )}
                                </div>
                                <div className="card-content">
                                    <h3>{relatedProduct.name}</h3>
                                    <p>{relatedProduct.description}</p>
                                    <div className="card-meta">
                                        <span className="price">{relatedProduct.price} ₽</span>
                                        <button className="button button-primary">
                                            Подробнее
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;

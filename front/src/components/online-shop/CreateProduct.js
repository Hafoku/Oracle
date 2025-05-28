import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import '../styles/auth.css';
import { FaArrowLeft, FaPlus } from "react-icons/fa";


const CreateProduct = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        type: 'first-aid', // значение по умолчанию
    });
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const productTypes = [
        { id: 'first-aid', name: 'Аптечки' },
        { id: 'equipment', name: 'Оборудование' },
        { id: 'medicine', name: 'Медикаменты' },
        { id: 'prescription', name: 'Рецептурные препараты' },
        { id: 'otc', name: 'Безрецептурные препараты'},
        { id: 'supplements', name: 'Витамины и добавки'}
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        navigate('/login');
        return null;
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const productData = new FormData();
            productData.append('name', formData.name);
            productData.append('price', formData.price);
            productData.append('description', formData.description);
            productData.append('type', formData.type);
            if (image) {
                productData.append('file', image);
            }

            await axios.post('http://localhost:8082/create_product', productData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    "Authorization": `Bearer ${token}`
                }
            });

            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Произошла ошибка при создании продукта');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="create-news-hero">
                <div className="create-news-title">Создание продукта</div>
                <div className="create-news-subtitle">Добавьте новый товар в каталог магазина</div>
            </div>
            <div className="news-card">
                <form onSubmit={handleSubmit} className="news-form">
                    {error && (
                        <div className="news-error mb-2">{error}</div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Название продукта</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Цена (₸)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="form-input"
                            min="1"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Категория</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        >
                            {productTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Описание</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="form-input"
                            rows="4"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Изображение продукта</label>
                        <input
                            type="file"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="form-input"
                            id="product-image"
                        />
                        {previewImage && (
                            <div className="image-preview mt-2">
                                <img
                                    src={previewImage}
                                    alt="Предпросмотр"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '200px',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius)'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        <button
                            type="button"
                            className="news-btn news-btn-outline"
                            onClick={() => navigate('/shop')}
                        >
                            <FaArrowLeft style={{ marginRight: 8 }} /> Отмена
                        </button>
                        <button
                            type="submit"
                            className="news-btn news-btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Создание...' : <>Создать продукт <FaPlus style={{ marginLeft: 8 }} /></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProduct;

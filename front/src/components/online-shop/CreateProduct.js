import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

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
        { id: 'education', name: 'Учебные материалы' },
        { id: 'equipment', name: 'Оборудование' },
        { id: 'medicine', name: 'Медикаменты' },
        { id: 'accessories', name: 'Аксессуары' }
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
      return;
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

            await axios.post('http://localhost:8082/api/create_product', productData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    "Authorization": `Bearer ${token}`
                }
            });

            navigate('/shop');
        } catch (err) {
            setError(err.response?.data?.message || 'Произошла ошибка при создании продукта');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="auth-box" style={{ maxWidth: '600px' }}>
                <h1 className="section-title text-center">Создание продукта</h1>
                
                {error && (
                    <div className="error-message mb-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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
                        <label className="form-label">Цена (₽)</label>
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
                        <div className="file-upload-container">
                            <input
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="file-input"
                                id="product-image"
                            />
                            <label htmlFor="product-image" className="file-upload-label">
                                <i className="fas fa-cloud-upload-alt upload-icon"></i>
                                <span className="upload-text">Выберите изображение</span>
                                <span className="upload-hint">PNG, JPG до 5MB</span>
                            </label>
                        </div>
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

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="button button-primary"
                            disabled={loading}
                            style={{ flex: 1 }}
                        >
                            {loading ? 'Создание...' : 'Создать продукт'}
                        </button>
                        <button
                            type="button"
                            className="button button-secondary"
                            onClick={() => navigate('/shop')}
                            style={{ flex: 1 }}
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProduct;

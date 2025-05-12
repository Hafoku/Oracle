import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const UpdateProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        type: 'first-aid',
    });

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImageId, setExistingImageId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const productTypes = [
        { id: 'first-aid', name: 'Аптечки' },
        { id: 'education', name: 'Учебные материалы' },
        { id: 'equipment', name: 'Оборудование' },
        { id: 'medicine', name: 'Медикаменты' },
        { id: 'accessories', name: 'Аксессуары' }
    ];
    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            navigate('/login');
            return;
        }
    
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:8082/api/product/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
    
                const product = response.data;
                setFormData({
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    type: product.type
                });
    
                if (product.avatar && product.avatar.id) {
                    setExistingImageId(product.avatar.id);
                }
    
                setLoading(false);
            } catch (err) {
                setError('Ошибка при загрузке данных продукта');
                setLoading(false);
            }
        };
    
        fetchProduct();
    }, [id, navigate]);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
    
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            navigate('/login');
            return;
        }
    
        try {
            const productDto = {
                name: formData.name,
                price: formData.price,
                description: formData.description,
                type: formData.type
            };
    
            const formDataToSend = new FormData();
            formDataToSend.append(
                "newProduct",
                new Blob([JSON.stringify(productDto)], { type: "application/json" })
            );
    
            if (image) {
                formDataToSend.append("avatar", image);
            }
    
            await axios.put(`http://localhost:8082/api/product/${id}`, formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });
    
            navigate('/shop');
        } catch (err) {
            setError('Ошибка при обновлении продукта');
        } finally {
            setSubmitting(false);
        }
    };
    
    if (loading) {
        return (
            <div className="page-container">
                <div className="loader-container">
                    <div className="loader"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="auth-box" style={{ maxWidth: '600px' }}>
                <h1 className="section-title text-center">Обновление продукта</h1>

                {error && <div className="error-message mb-2">{error}</div>}

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
                            {productTypes.map((type) => (
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
                        />
                        {(imagePreview || existingImageId) && (
                            <div className="image-preview mt-2">
                                <img
                                    src={
                                        imagePreview ||
                                        `http://localhost:8082/api/product/files/${existingImageId}`
                                    }
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
                            disabled={submitting}
                            style={{ flex: 1 }}
                        >
                            {submitting ? 'Обновление...' : 'Обновить продукт'}
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

export default UpdateProduct;

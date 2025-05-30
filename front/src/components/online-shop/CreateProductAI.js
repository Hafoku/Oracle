import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import '../styles/auth.css';
import './CreateProductAI.css';
import { FaArrowLeft, FaPlus, FaRobot, FaUpload, FaExclamationCircle } from "react-icons/fa";

const CreateProductAI = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        type: 'first-aid',
        image: null,
        previewImage: null,
        isGenerated: false,
        hasGeneratedDetails: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [imageSource, setImageSource] = useState('upload');

    const productTypes = [
        { id: 'first-aid', name: 'Аптечки' },
        { id: 'equipment', name: 'Оборудование' },
        { id: 'medicine', name: 'Медикаменты' },
        { id: 'prescription', name: 'Рецептурные препараты' },
        { id: 'otc', name: 'Безрецептурные препараты' },
        { id: 'supplements', name: 'Витамины и добавки' }
    ];

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (imageSource === 'upload') {
            setFormData(prev => ({
                ...prev,
                previewImage: null,
                isGenerated: false,
                hasGeneratedDetails: false
            }));
        }
    }, [imageSource]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file,
                previewImage: URL.createObjectURL(file),
                isGenerated: false
            }));
        }
    };

    const handleGenerateWithAI = async () => {
        if (!formData.name) {
            setError('Пожалуйста, введите название продукта');
            return;
        }
    
        setLoading(true);
        setError(null);
    
        try {
            const response = await axios.post('http://localhost:8082/ai/generate', {
                name: formData.name
            });
    
            const { description, price, type, imageUrl } = response.data;
    
            setFormData(prev => ({
                ...prev,
                description,
                price,
                type,
                previewImage: imageUrl, // покажем как превью
                image: null, // не загружаем файл вручную
                isGenerated: true,
                hasGeneratedDetails: true
            }));
    
            setImageSource('ai'); // переключимся на режим AI, чтобы показать превью
        } catch (err) {
            console.error(err);
            setError('Ошибка при генерации продукта с помощью ИИ');
        } finally {
            setLoading(false);
        }
    };    

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const productData = new FormData();
            productData.append('name', formData.name);
            productData.append('price', formData.price);
            productData.append('description', formData.description);
            productData.append('type', formData.type);
            if (formData.image) {
                productData.append('file', formData.image);
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
        <div className="create-product-ai">
            <div className="hero">
                <h1 className="hero-title">Создание продукта с помощью ИИ</h1>
                <p className="hero-subtitle">Создайте новый товар с помощью искусственного интеллекта</p>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="error-message">
                            <FaExclamationCircle />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Название продукта</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Введите название продукта"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Выберите способ добавления изображения</label>
                        <div className="radio-group">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="imageSource"
                                    value="upload"
                                    checked={imageSource === 'upload'}
                                    onChange={(e) => setImageSource(e.target.value)}
                                />
                                <span><FaUpload /> Загрузить изображение</span>
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="imageSource"
                                    value="ai"
                                    checked={imageSource === 'ai'}
                                    onChange={(e) => setImageSource(e.target.value)}
                                />
                                <span><FaRobot /> Сгенерировать с помощью ИИ</span>
                            </label>
                        </div>

                        {imageSource === 'upload' && (
                            <div className="form-group">
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="form-input"
                                    id="product-image"
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group generate-button-container">
                        <button
                            type="button"
                            className="btn btn-primary generate-button"
                            onClick={handleGenerateWithAI}
                            disabled={loading || !formData.name}
                        >
                            {loading ? (
                                <span className="loading-text">Генерация...</span>
                            ) : (
                                <>
                                    <FaRobot /> Сгенерировать с помощью ИИ
                                </>
                            )}
                        </button>
                    </div>

                    {imageSource === 'ai' && formData.isGenerated && formData.previewImage && (
                        <div className="image-preview-container">
                            <label className="form-label">Сгенерированное изображение</label>
                            <div className="image-preview">
                                <img
                                    src={formData.previewImage}
                                    alt="Сгенерированное изображение"
                                />
                            </div>
                        </div>
                    )}

                    {imageSource === 'upload' && formData.previewImage && (
                        <div className="image-preview-container">
                            <label className="form-label">Загруженное изображение</label>
                            <div className="image-preview">
                                <img
                                    src={formData.previewImage}
                                    alt="Загруженное изображение"
                                />
                            </div>
                        </div>
                    )}

                    {formData.hasGeneratedDetails && (
                        <>
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
                        </>
                    )}

                    <div className="button-group">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => navigate('/products')}
                        >
                            <FaArrowLeft /> Отмена
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !formData.previewImage}
                        >
                            {loading ? 'Создание...' : <>Создать продукт </>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProductAI;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AvatarEditor from "react-avatar-editor";
import '../App.css';
import '../styles/auth.css';
import '../styles/CreateProductAI.css';
import { FaArrowLeft, FaRobot, FaUpload, FaExclamationCircle } from "react-icons/fa";

const CreateProductAI = () => {
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        type: 'first-aid',
        image: null,
        previewImage: null,
        imageBase64: null,
        isGenerated: false,
        hasGeneratedDetails: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [scale, setScale] = useState(1);

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
        if (!token) navigate('/login');
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                image: file,
                previewImage: preview,
                imageBase64: null,
                isGenerated: false,
                hasGeneratedDetails: true
            }));
        }
    };

    const handleScaleChange = (e) => {
        const newScale = parseFloat(e.target.value);
        setScale(newScale);
    };

    const handleSave = () => {
        if (editorRef.current) {
            const canvas = editorRef.current.getImageScaledToCanvas();
            canvas.toBlob((blob) => {
                const preview = URL.createObjectURL(blob);
                setFormData(prev => ({
                    ...prev,
                    image: null,
                    previewImage: preview,
                    imageBase64: null,
                    isGenerated: false,
                    hasGeneratedDetails: true
                }));
            }, "image/png");
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

            const { description, price, type, imageBase64 } = response.data;

            setFormData(prev => ({
                ...prev,
                description,
                price,
                type,
                previewImage: `data:image/png;base64,${imageBase64}`,
                imageBase64,
                image: null,
                isGenerated: true,
                hasGeneratedDetails: true
            }));
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

            if (formData.previewImage) {
                const response = await fetch(formData.previewImage);
                const blob = await response.blob();
                productData.append('file', blob, 'product-image.png');
            }

            await axios.post('http://localhost:8082/create_product', productData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    "Authorization": `Bearer ${token}`
                }
            });

            navigate('/products');
        } catch (err) {
            console.error(err);
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
                        <label className="form-label">Изображение продукта</label>
                        {!formData.image ? (
                            <div className="file-upload-container">
                                <label className="oracle-btn oracle-btn-primary oracle-btn-block file-upload-label">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleImageUpload}
                                        className="file-input"
                                    />
                                    <span><FaUpload /> Выберите изображение</span>
                                </label>
                            </div>
                        ) : (
                            <div className="editor-container">
                                <AvatarEditor
                                    ref={editorRef}
                                    image={formData.image}
                                    width={300}
                                    height={300}
                                    border={50}
                                    borderRadius={10}
                                    scale={scale}
                                    className="avatar-editor"
                                />
                                <div className="scale-container">
                                    <span>Масштаб:</span>
                                    <input
                                        type="range"
                                        min="1"
                                        max="3"
                                        step="0.1"
                                        value={scale}
                                        onChange={handleScaleChange}
                                        className="scale-slider"
                                    />
                                </div>
                                <div className="buttons-container">
                                    <button type="button" onClick={handleSave} className="oracle-btn oracle-btn-primary oracle-btn-large">
                                        Сохранить
                                    </button>
                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: null, previewImage: null }))} className="oracle-btn oracle-btn-large">
                                        Отмена
                                    </button>
                                </div>
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

                    {formData.previewImage && !formData.image && (
                        <div className="image-preview-container">
                            <label className="form-label">Превью изображения</label>
                            <div className="image-preview">
                                <img
                                    src={formData.previewImage}
                                    alt="Превью изображения"
                                    loading="lazy"
                                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                                />
                            </div>
                        </div>
                    )}

                    {(formData.hasGeneratedDetails || formData.previewImage) && (
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
                            {loading ? 'Создание...' : 'Создать продукт'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProductAI;

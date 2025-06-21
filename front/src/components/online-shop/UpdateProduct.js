import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AvatarEditor from "react-avatar-editor";
import '../App.css';
import { FaExclamationCircle, FaUpload } from 'react-icons/fa';

const UpdateProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const editorRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        type: 'first-aid',
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImageId, setExistingImageId] = useState(null);
    const [scale, setScale] = useState(1);

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
                const response = await axios.get(`http://2.133.132.170:8082/product/${id}`, {
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
                    const existingImageUrl = `http://2.133.132.170:8082/product/files/${product.avatar.id}`;
                    setImagePreview(existingImageUrl);
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

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(null);
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
                setImagePreview(URL.createObjectURL(blob));
                setSelectedFile(null);
            }, "image/png");
        }
    };

    const handleCancelEdit = () => {
        setSelectedFile(null);
        if (existingImageId) {
            setImagePreview(`http://2.133.132.170:8082/product/files/${existingImageId}`);
        } else {
            setImagePreview(null);
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

            if (imagePreview && (!existingImageId || imagePreview !== `http://2.133.132.170:8082/product/files/${existingImageId}`)) {
                const response = await fetch(imagePreview);
                const blob = await response.blob();
                formDataToSend.append("avatar", blob, "product-image.png");
            } else if (existingImageId && !imagePreview) {
            }

            await axios.put(`http://2.133.132.170:8082/product/${id}`, formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });

            navigate('/products');
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
        <div className="oracle-page-wrapper">
            {/* Hero Section */}
            <div className="oracle-products-hero">
                <div className="oracle-container">
                    <h1 className="oracle-hero-title">Обновление продукта</h1>
                    <p className="oracle-hero-subtitle">Измените информацию о товаре</p>
                </div>
            </div>

            <div className="oracle-container">
                <div className="oracle-form-container">
                    {error && (
                        <div className="oracle-error-message">
                            <FaExclamationCircle />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="oracle-form">
                        <div className="oracle-form-grid">
                            <div className="oracle-form-group">
                                <label className="oracle-form-label">Название продукта</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="oracle-form-input"
                                    required
                                />
                            </div>

                            <div className="oracle-form-group">
                                <label className="oracle-form-label">Цена (₸)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="oracle-form-input"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="oracle-form-group">
                                <label className="oracle-form-label">Категория</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="oracle-form-input"
                                    required
                                >
                                    {productTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="oracle-form-group oracle-form-group-full">
                                <label className="oracle-form-label">Описание</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="oracle-form-input"
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="oracle-form-group oracle-form-group-full">
                                <label className="oracle-form-label">Изображение продукта</label>
                                {!selectedFile ? (
                                    <div className="oracle-image-upload">
                                        <input
                                            type="file"
                                            onChange={handleFileSelect}
                                            accept="image/*"
                                            className="oracle-form-input"
                                            id="product-image"
                                        />
                                        <label htmlFor="product-image" className="oracle-upload-label">
                                            <FaUpload />
                                            <span>Выбрать изображение</span>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="editor-container">
                                        <AvatarEditor
                                            ref={editorRef}
                                            image={selectedFile}
                                            width={300}
                                            height={300}
                                            border={20}
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
                                                step="0.01"
                                                value={scale}
                                                onChange={handleScaleChange}
                                                className="scale-slider"
                                            />
                                        </div>
                                        <div className="buttons-container">
                                            <button type="button" onClick={handleSave} className="oracle-btn oracle-btn-primary">
                                                Сохранить
                                            </button>
                                            <button type="button" onClick={handleCancelEdit} className="oracle-btn oracle-btn-secondary-2">
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {imagePreview && !selectedFile && (
                                    <div className="oracle-image-preview" style={{
                                        width: '300px',
                                        height: '300px',
                                        margin: '1rem auto',
                                        overflow: 'hidden',
                                        borderRadius: '8px',
                                        border: '1px solid var(--secondary-gray)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <img
                                            src={imagePreview}
                                            alt="Предпросмотр"
                                            onError={(e) => {
                                                console.error('Ошибка загрузки изображения:', e);
                                                e.target.src = "/images/no-image.png";
                                            }}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="oracle-form-actions">
                            <button
                                type="submit"
                                className="oracle-btn oracle-btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Обновление...' : 'Обновить продукт'}
                            </button>
                            <button
                                type="button"
                                className="oracle-btn oracle-btn-secondary"
                                onClick={() => navigate('/products')}
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateProduct;

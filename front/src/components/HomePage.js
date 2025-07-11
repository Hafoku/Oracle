import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import Header from './Header';
import Footer from './Footer';
import { Link } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaPills, FaClinicMedical, FaHeartbeat, FaUserMd, FaStar, FaHeart, FaEdit, FaTimes, FaGripVertical, FaRandom } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Logger from './Logger';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const [productOrder, setProductOrder] = useState([]);
  const [hasCustomFeatured, setHasCustomFeatured] = useState(false);

  const categories = [
    {
      id: 1,
      name: "Рецептурные препараты",
      image: "https://via.placeholder.com/600x400?text=Prescription+Medicines",
      icon: <FaPills />,
      description: "Лекарства, отпускаемые по рецепту врача"
    },
    {
      id: 2,
      name: "Безрецептурные препараты",
      image: "https://via.placeholder.com/600x400?text=OTC+Medicines",
      icon: <FaClinicMedical />,
      description: "Лекарства, доступные без рецепта"
    },
    {
      id: 3,
      name: "Витамины и добавки",
      image: "https://via.placeholder.com/600x400?text=Supplements",
      icon: <FaHeartbeat />,
      description: "Витамины, минералы и пищевые добавки"
    },
    {
      id: 4,
      name: "Товары для здоровья",
      image: "https://via.placeholder.com/600x400?text=Healthcare+Products",
      icon: <FaUserMd />,
      description: "Медицинские приборы и товары для здоровья"
    }
  ];

  // ImageWithFallback component for handling image loading errors
  const ImageWithFallback = ({ src, alt, className }) => {
    const [error, setError] = useState(false);

    const handleError = () => {
      setError(true);
    };

    if (error || !src) {
      return (
        <div className="oracle-image-placeholder">
          <i className="fas fa-image"></i>
        </div>
      );
    }

    return (
      <img 
        src={src} 
        alt={alt} 
        className={className}
        onError={handleError}
      />
    );
  };

  // Function to render star ratings
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="oracle-star filled" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStar key="half-star" className="oracle-star half" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-star-${i}`} className="oracle-star empty" />);
    }
    
    return stars;
  };


  const getImageUrl = (id) => {
    axios.get(`/product/files/${id}`).then(response => {
      console.log("полученный путь изображения: ", response.data);
      return response.data.url;
    }) ;
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        try {
          const response = await axios.get('/user/current', {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          setIsAdmin(response.data.role?.name === 'ADMIN');
        } catch (err) {
          Logger.logError('Error checking admin status', err);
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/products');
        const products = Array.from(response.data);
        setAllProducts(products);
        
        // Try to load saved featured products from localStorage
        const savedFeaturedIds = localStorage.getItem('featuredProductIds');
        let featured;
        
        if (savedFeaturedIds) {
          const savedIds = JSON.parse(savedFeaturedIds);
          // Filter products that still exist in the database
          featured = products.filter(p => savedIds.includes(p.id));
          
          // If we don't have enough saved products, add some from the beginning
          if (featured.length < 4) {
            const remainingProducts = products.filter(p => !savedIds.includes(p.id));
            const neededCount = 4 - featured.length;
            featured = [...featured, ...remainingProducts.slice(0, neededCount)];
          }
        } else {
          // Get featured products (first 4 by default)
          featured = products.slice(0, 4);
        }
        
        setFeaturedProducts(featured);
        setSelectedProducts(featured.map(p => p.id));
        setProductOrder(featured.map(p => p.id)); // Initialize order
        
        // Check if we have custom featured products
        setHasCustomFeatured(!!localStorage.getItem('featuredProductIds'));
        
        setError(null);
      } catch (err) {
        setError('Ошибка при загрузке товаров. Пожалуйста, попробуйте позже.');
        Logger.logError('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleEditFeatured = () => {
    setShowEditModal(true);
  };

  const handleSaveFeatured = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    try {
      setModalLoading(true);
      // Здесь будет запрос к бэкенду для сохранения выбранных товаров
      // await axios.post('/admin/featured-products', { productIds: selectedProducts });
      
      // Временно обновляем локально
      const newFeatured = allProducts.filter(p => selectedProducts.includes(p.id));
      setFeaturedProducts(newFeatured);
      
      // Save selected product IDs to localStorage
      localStorage.setItem('featuredProductIds', JSON.stringify(selectedProducts));
      
      setShowEditModal(false);
      setHasCustomFeatured(true);
      
      Logger.logSuccess('Featured products updated successfully');
    } catch (err) {
      Logger.logError('Error updating featured products:', err);
      alert('Ошибка при сохранении популярных товаров');
    } finally {
      setModalLoading(false);
    }
  };

  const toggleShuffleMode = () => {
    if (isShuffleMode) {
      // When exiting shuffle mode, save the current order
      const newOrder = featuredProducts.map(product => product.id);
      localStorage.setItem('featuredProductsOrder', JSON.stringify(newOrder));
      // Also update the featured product IDs to match the new order
      localStorage.setItem('featuredProductIds', JSON.stringify(newOrder));
      setHasCustomFeatured(true);
    } else {
      // When entering shuffle mode, try to load saved order
      const savedOrder = localStorage.getItem('featuredProductsOrder');
      if (savedOrder) {
        const orderArray = JSON.parse(savedOrder);
        const orderedProducts = orderArray
          .map(id => featuredProducts.find(p => p.id === id))
          .filter(Boolean);
        if (orderedProducts.length === featuredProducts.length) {
          setFeaturedProducts(orderedProducts);
        }
      }
    }
    setIsShuffleMode(!isShuffleMode);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(featuredProducts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFeaturedProducts(items);
    
    // Update the order state
    const newOrder = items.map(item => item.id);
    setProductOrder(newOrder);

    // Save the new order to localStorage
    localStorage.setItem('featuredProductsOrder', JSON.stringify(newOrder));
    // Also update the featured product IDs to match the new order
    localStorage.setItem('featuredProductIds', JSON.stringify(newOrder));
    setHasCustomFeatured(true);
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else if (prev.length < 4) {
        return [...prev, productId];
      } else {
        alert('Можно выбрать максимум 4 товара');
        return prev;
      }
    });
  };

  const handleResetToDefault = () => {
    const defaultProducts = allProducts.slice(0, 4);
    setSelectedProducts(defaultProducts.map(p => p.id));
    setFeaturedProducts(defaultProducts);
    localStorage.setItem('featuredProductIds', JSON.stringify(defaultProducts.map(p => p.id)));
    localStorage.setItem('featuredProductsOrder', JSON.stringify(defaultProducts.map(p => p.id)));
    setShowEditModal(false);
    setHasCustomFeatured(false);
    Logger.logSuccess('Reset to default products');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[rgb(20,63,39)] to-[#264d36] text-white">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Oracle <span className="text-yellow-300">Аптека</span>
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Ваше здоровье - наш приоритет. Качественные лекарства, профессиональные консультации и забота о каждом клиенте.
            </p>
            <div className="flex justify-center mb-8">
              <div className="relative w-full max-w-xl">
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Поиск лекарств и товаров..."
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#264d36] hover:text-[rgb(20,63,39)]">
                  <FaSearch className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Наши категории</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map(category => (
              <div key={category.id} className="oracle-card text-center">
                <div className="text-4xl text-[#264d36] mb-4">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold">Популярные товары</h2>
              {hasCustomFeatured && (
                <p className="text-sm text-gray-500 mt-1">
                  Настроено администратором
                </p>
              )}
            </div>
            {isAdmin && (
              <div className="flex gap-4">
                <button 
                  className="oracle-btn oracle-btn-secondary-2"
                  onClick={handleEditFeatured}
                >
                  <FaEdit className="inline-block mr-2" /> Редактировать
                </button>
                {/* <button 
                  className={`oracle-btn ${isShuffleMode ? 'bg-[#264d36] hover:bg-[rgb(20,63,39)]' : 'oracle-btn-secondary-2'}`}
                  onClick={toggleShuffleMode}
                >
                  <FaRandom className="inline-block mr-2" /> {isShuffleMode ? 'Готово' : 'Переместить'}
                </button> */}
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oracle-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка товаров...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              {error}
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="featured-products" direction="horizontal">
                {(provided) => (
                  <div 
                    className={`${isShuffleMode ? 'oracle-products-grid-single-row' : 'oracle-products-grid'}`}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {featuredProducts.map((product, index) => (
                      <Draggable 
                        key={product.id} 
                        draggableId={product.id.toString()} 
                        index={index}
                        isDragDisabled={!isAdmin || !isShuffleMode}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`oracle-product-card ${snapshot.isDragging ? 'shadow-xl scale-105' : ''}`}
                          >
                            {(isAdmin && isShuffleMode) && (
                              <div 
                                className="oracle-drag-handle"
                                {...provided.dragHandleProps}
                              >
                                <FaGripVertical />
                              </div>
                            )}
                            {product.sale && <div className="oracle-sale-badge">Скидка</div>}
                            <div className="relative">
                              {product.avatar ? (
                                <img
                                  src={`http://localhost:8082/product/files/${product.avatar.id}`}
                                  alt={product.name}
                                  className="oracle-product-image"
                                  onError={e => {
                                    e.target.onerror = null;
                                    e.target.src = "/images/no-image.png";
                                  }}
                                />
                              ) : (
                                <div className="oracle-product-image bg-gray-200 flex items-center justify-center">
                                  <i className="fas fa-image text-4xl text-gray-400"></i>
                                </div>
                              )}
                            </div>
                            <div className="oracle-product-content">
                              <h3 className="oracle-product-title">{product.name}</h3>
                              <div className="text-sm text-gray-500 mb-2">
                                {product.type === "first-aid" ? "Аптечки первой помощи" :
                                 product.type === "equipment" ? "Медицинское оборудование" :
                                 product.type === "medicine" ? "Медикаменты" :
                                 product.type === "prescription" ? "Рецептурные препараты" : 
                                 product.type === "otc" ? "Безрецептурные препараты" : 
                                 product.type === "supplements" ? "Витамины и добавки" :
                                 "Другое"}
                              </div>
                              <p className="oracle-product-description">{product.description}</p>
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
          )}
        </div>
      </section>

      {/* Edit Featured Products Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="oracle-modal bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Выберите популярные товары</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Выберите до 4 товаров для отображения на главной странице 
                <span className="ml-2 font-medium text-[#264d36]">
                  ({selectedProducts.length}/4)
                </span>
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allProducts.map(product => (
                  <div 
                    key={product.id}
                    className={`oracle-product-card cursor-pointer transition-all ${
                      selectedProducts.includes(product.id) 
                        ? 'selected' 
                        : ''
                    }`}
                    onClick={() => handleProductSelect(product.id)}
                  >
                    {/* Checkbox overlay */}
                    <div className="absolute top-2 right-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductSelect(product.id)}
                        className="w-5 h-5 text-[#264d36] border-gray-300 rounded focus:ring-[#264d36] cursor-pointer"
                      />
                    </div>
                    
                    {/* Product Image */}
                    <div className="oracle-product-image-wrapper">
                      {product.sale && <div className="oracle-sale-badge">Скидка</div>}
                      {product.avatar ? (
                        <img
                          src={`http://localhost:8082/product/files/${product.avatar.id}`}
                          alt={product.name}
                          className="oracle-product-image"
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = "/images/no-image.png";
                          }}
                        />
                      ) : (
                        <div className="oracle-product-image bg-gray-200 flex items-center justify-center">
                          <i className="fas fa-image text-4xl text-gray-400"></i>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Content */}
                    <div className="oracle-product-content">
                      <div className="text-sm text-gray-500 mb-2">
                        {product.type === "first-aid" ? "Аптечки первой помощи" :
                         product.type === "equipment" ? "Медицинское оборудование" :
                         product.type === "medicine" ? "Медикаменты" :
                         product.type === "prescription" ? "Рецептурные препараты" : 
                         product.type === "otc" ? "Безрецептурные препараты" : 
                         product.type === "supplements" ? "Витамины и добавки" :
                         "Другое"}
                      </div>
                      <h3 className="oracle-product-title">{product.name}</h3>
                      <p className="oracle-product-description">{product.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={handleResetToDefault}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Сбросить к дефолтным
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveFeatured}
                  disabled={modalLoading || selectedProducts.length === 0}
                  className="px-4 py-2 bg-[#264d36] text-white rounded-lg hover:bg-[rgb(20,63,39)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modalLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Section */}
      <section className="oracle-section">
        <div className="oracle-container">
          <h2 className="oracle-title oracle-text-center oracle-mb-4">Наши услуги</h2>
          <div className="oracle-row">
            <div className="oracle-col">
              <div className="oracle-card">
                <div className="oracle-feature-icon">
                  <FaUserMd />
                </div>
                <h3 className="oracle-card-title">Консультации фармацевта</h3>
                <p>Получите профессиональную консультацию по подбору лекарств и их применению.</p>
              </div>
            </div>
            <div className="oracle-col">
              <div className="oracle-card">
                <div className="oracle-feature-icon">
                  <FaHeartbeat />
                </div>
                <h3 className="oracle-card-title">Измерение давления</h3>
                <p>Бесплатное измерение артериального давления в наших аптеках.</p>
              </div>
            </div>
            <div className="oracle-col">
              <div className="oracle-card">
                <div className="oracle-feature-icon">
                  <FaShoppingCart />
                </div>
                <h3 className="oracle-card-title">Доставка на дом</h3>
                <p>Быстрая доставка лекарств и товаров для здоровья по всему городу.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <div className="oracle-container">
        <div className="oracle-quote">
          <p>"Здоровье - это драгоценность, и из всех драгоценностей, которыми мы обладаем, это самая ценная."</p>
          <span>- Мишель де Монтень</span>
        </div>
      </div>

      {/* Testimonials */}
      <section className="oracle-section oracle-testimonials">
        <div className="oracle-container">
          <h2 className="oracle-title oracle-text-center oracle-mb-4">Отзывы наших клиентов</h2>
          <div className="oracle-row">
            <div className="oracle-col">
              <div className="oracle-testimonial">
                <p className="oracle-testimonial-text">
                  "Отличный сервис и широкий выбор лекарств. Фармацевты всегда помогают с выбором и дают полезные советы."
                </p>
                <p className="oracle-testimonial-author">- Анна К.</p>
              </div>
            </div>
            <div className="oracle-col">
              <div className="oracle-testimonial">
                <p className="oracle-testimonial-text">
                  "Заказываю лекарства через сайт Oracle уже больше года. Доставка всегда вовремя, а цены ниже, чем в других аптеках."
                </p>
                <p className="oracle-testimonial-author">- Максим Д.</p>
              </div>
            </div>
            <div className="oracle-col">
              <div className="oracle-testimonial">
                <p className="oracle-testimonial-text">
                  "Благодарна за профессиональную консультацию фармацевта. Помогли подобрать аналог дорогого препарата, который оказался не хуже."
                </p>
                <p className="oracle-testimonial-author">- Елена В.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
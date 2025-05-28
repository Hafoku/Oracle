import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import Header from './Header';
import Footer from './Footer';
import { Link } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaPills, FaClinicMedical, FaHeartbeat, FaUserMd, FaStar, FaHeart } from "react-icons/fa";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/products');
        const products = Array.from(response.data).slice(0, 4);
        setFeaturedProducts(products);
        setError(null);
      } catch (err) {
        setError('Ошибка при загрузке товаров. Пожалуйста, попробуйте позже.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="oracle-page-wrapper">
        
      {/* Promotional Banner */}
      <div className="oracle-banner">
        Бесплатная доставка при заказе от 5000 ₸ | Скидка 10% на первый заказ с кодом ORACLE10
      </div>
      
      {/* Hero Section - Improved with medical theme background */}
      <div className="oracle-hero oracle-hero-medical">
        <div className="oracle-hero-pattern"></div>
        <div className="oracle-hero-gradient"></div>
        <div className="oracle-hero-content">
          <h1 className="oracle-hero-title">Oracle <span className="oracle-text-highlight">Аптека</span></h1>
          <p className="oracle-hero-description">
            Ваше здоровье - наш приоритет. Качественные лекарства, профессиональные консультации и забота о каждом клиенте.
          </p>
          <div className="oracle-search oracle-mb-4">
            <input type="text" className="oracle-search-input" placeholder="Поиск лекарств и товаров..." />
            <button className="oracle-search-btn">
              <FaSearch />
            </button>
          </div>
          <div className="oracle-hero-buttons">
            <Link to="/products" className="oracle-btn oracle-btn-primary">Каталог товаров</Link>
            <Link to="/consultation" className="oracle-btn oracle-btn-light">Консультация</Link>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section className="oracle-section">
        <div className="oracle-container">
          <h2 className="oracle-title oracle-text-center oracle-mb-4">Наши категории</h2>
          <div className="oracle-row">
            {categories.map(category => (
              <div className="oracle-col" key={category.id}>
                <div className="oracle-card oracle-text-center">
                  <div className="oracle-card-icon">
                    {category.icon}
                  </div>
                  <h3 className="oracle-card-title">{category.name}</h3>
                  <p>{category.description}</p>
                  <Link to={`/category/${category.id}`} className="oracle-btn oracle-btn-outline oracle-mt-2">
                    Подробнее
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Updated Section */}
      <section className="oracle-section oracle-featured-products">
        <div className="oracle-container">
          <div className="oracle-section-header">
            <h2 className="oracle-title oracle-text-center">Популярные товары</h2>
          </div>
          
          {loading ? (
            <div className="oracle-loading oracle-text-center">
              Загрузка товаров...
            </div>
          ) : error ? (
            <div className="oracle-error oracle-text-center">
              {error}
            </div>
          ) : (
            <>
              <div className="oracle-products-grid">
                {featuredProducts.map(product => (
                  <div className="oracle-product-card" key={product.id}>
                    {console.log(product)}
                    {product.sale && <div className="oracle-sale-badge">Скидка</div>}
                    <div className="oracle-product-image-wrapper">
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
                        <div className="oracle-product-card__placeholder">
                          <i className="fas fa-image"></i>
                        </div>
                      )}
                      <div className="oracle-product-actions">
                        <button className="oracle-product-action-btn oracle-wishlist-btn" title="Добавить в избранное">
                          <FaHeart />
                        </button>
                        <button className="oracle-product-action-btn oracle-cart-btn" title="Добавить в корзину">
                          <FaShoppingCart />
                        </button>
                      </div>
                    </div>
                    <div className="oracle-product-content">
                      <div className="oracle-product-category">{product.category}</div>
                      <h3 className="oracle-product-title">{product.name}</h3>
                      <p className="oracle-product-description">{product.description}</p>
                      <div className="oracle-product-rating">
                        <div className="oracle-stars">
                          {renderRating(product.rating || 0)}
                        </div>
                        <span className="oracle-reviews-count">({product.reviews || 0})</span>
                      </div>
                      <div className="oracle-product-price-wrapper">
                        <p className="oracle-product-price">{product.price} ₸</p>
                        {product.oldPrice && <p className="oracle-product-old-price">{product.oldPrice} ₸</p>}
                      </div>
                      <button className="oracle-btn oracle-btn-primary oracle-btn-block">
                        В корзину
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="oracle-text-center oracle-mt-4">
                <Link to="/products" className="oracle-btn oracle-btn-secondary">Все товары</Link>
              </div>
            </>
          )}
        </div>
      </section>

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
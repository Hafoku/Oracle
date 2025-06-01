import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Header from './Header';
import Footer from './Footer';
import { FaSearch, FaFilter, FaShoppingCart, FaHeart, FaRegHeart, FaStar, FaChevronDown } from 'react-icons/fa';
import Logger from './Logger';

const Products = () => {
  // State for products
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  const location = useLocation();

  // Categories
  const categories = [
    { id: 'all', name: 'Все товары' },
    { id: 'first-aid', name: 'Аптечки первой помощи' },
    { id: 'equipment', name: 'Медицинское оборудование' },
    { id: 'medicine', name: 'Медикаменты' },
    { id: 'prescription', name: 'Рецептурные препараты' },
    { id: 'otc', name: 'Безрецептурные препараты' },
    { id: 'supplements', name: 'Витамины и добавки' }
  ];

  // Fetch products and initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        Logger.logInfo('Fetching products and initial data');

        // Fetch products
        const productsResponse = await axios.get('/products');
        const formattedProducts = productsResponse.data.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          image: product.avatar ? `http://localhost:8082/product/files/${product.avatar.id}` : '/images/no-image.png',
          category: product.type,
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          description: product.description,
          stock: product.stock || 0,
          sale: product.sale || false
        }));
        setProducts(formattedProducts);

        // Fetch wishlist (only if token exists) - REMOVED WISHlist FETCH
        const token = localStorage.getItem("jwtToken");
        // if (token) {
        //      try {
        //         const wishlistResponse = await axios.get('/wishlist', {
        //             headers: {
        //                 Authorization: `Bearer ${token}`,
        //             }
        //         });
        //         const initialWishlistIds = wishlistResponse.data.map(item => item.product.id);
        //         setWishlist(initialWishlistIds);
        //          Logger.logSuccess('Wishlist fetched successfully', { count: initialWishlistIds.length });
        //     } catch (wishlistErr) {
        //          Logger.logError('Error fetching wishlist', wishlistErr);
        //          setWishlist([]);
        //     }
        // } else {
             setWishlist([]); // Ensure wishlist is empty if not fetching
        // }

        // Set initial search query from URL
        const params = new URLSearchParams(location.search);
        const initialSearch = params.get('search') || '';
        setSearchQuery(initialSearch);

        setLoading(false);
      } catch (err) {
        Logger.logError('Error fetching products or initial data:', err);
        setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [location.search]); // Rerun effect when search query changes in URL or on initial mount

  // Filter products when search query, category, or price range changes
  useEffect(() => {
    Logger.logInfo('Applying filters', { 
      searchQuery, 
      category: selectedCategory, 
      priceRange, 
      sortBy 
    });

    let result = products;
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filter by price range
    result = result.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );
    
    // Sort products
    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
      default:
        result = [...result].sort((a, b) => b.reviews - a.reviews);
        break;
    }
    
    Logger.logInfo('Filters applied', { 
      filteredCount: result.length,
      totalCount: products.length 
    });
    
    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedCategory, priceRange, sortBy, products]);

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    Logger.logUserAction('Page changed', { page: pageNumber });
    setCurrentPage(pageNumber);
  };

  // Toggle wishlist - REMOVED WISHlist API CALLS
  const toggleWishlist = (productId) => {
    // const token = localStorage.getItem("jwtToken");
    // if (!token) {
    //   alert('Пожалуйста, войдите, чтобы добавить товар в избранное');
    //   // navigate("/login");
    //   return;
    // }

    // const isCurrentlyInWishlist = wishlist.includes(productId);
    // Logger.logUserAction(`${isCurrentlyInWishlist ? 'Removing from' : 'Adding to'} wishlist`, { productId });

    // try {
    //   if (isCurrentlyInWishlist) {
    //     await axios.delete(`/wishlist/remove/${productId}`, { headers: { Authorization: `Bearer ${token}`, }});
    //     setWishlist(wishlist.filter(id => id !== productId));
    //     Logger.logSuccess('Removed from wishlist', { productId });
    //   } else {
    //     await axios.post(`/wishlist/add/${productId}`, null, { headers: { Authorization: `Bearer ${token}`, }});
    //     setWishlist([...wishlist, productId]);
    //     Logger.logSuccess('Added to wishlist', { productId });
    //   }
    // } catch (err) {
    //   Logger.logError(`Error ${isCurrentlyInWishlist ? 'removing from' : 'adding to'} wishlist`, { 
    //       productId, 
    //       error: err.response?.data || err.message 
    //   });
    //    if (err.response?.status === 401) {
    //       localStorage.removeItem("jwtToken");
    //       alert('Сессия истекла. Пожалуйста, войдите снова.');
    //   } else {
    //      alert(`Ошибка при ${isCurrentlyInWishlist ? 'удалении из' : 'добавлении в'} избранного`);
    //   }
    // }
    // Local state toggle fallback if API calls are removed
     if (wishlist.includes(productId)) {
       setWishlist(wishlist.filter(id => id !== productId));
     } else {
       setWishlist([...wishlist, productId]);
     }
     Logger.logUserAction('Wishlist toggle (local)', { productId });
  };

  // Render star ratings
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

  // Reset all filters
  const resetFilters = () => {
    Logger.logUserAction('Reset all filters');
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange({ min: 0, max: 10000 });
    setSortBy('popularity');
  };

  // Add to cart function
  const addToCart = async (productId) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      // Assuming navigate is available from react-router-dom
      // If not, you might need to add `const navigate = useNavigate();` at the top
      // and import it: `import { Link, useLocation, useNavigate } from 'react-router-dom';`
      alert('Пожалуйста, войдите, чтобы добавить товар в корзину');
      // navigate("/login"); // Uncomment if navigate is imported and needed
      return;
    }

    try {
      Logger.logInfo('Adding product to cart', { productId });

      // Use the endpoint from CartController.java
      await axios.post(`/cart/add`, null, {
        params: { 
          productId: Number(productId),
          quantity: 1 // Default quantity to 1
        },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      Logger.logSuccess('Product added to cart successfully', { productId });
      alert('Товар добавлен в корзину!');
      // Optionally, refresh cart count in header or update local state
    } catch (err) {
      Logger.logError('Error adding product to cart', { 
        productId, 
        error: err.response?.data || err.message 
      });

      if (err.response?.status === 401) {
        localStorage.removeItem("jwtToken");
        // navigate("/login"); // Uncomment if navigate is imported
        alert('Сессия истекла. Пожалуйста, войдите снова.');
      } else if (err.response?.status === 400 && err.response?.data === "Product not found"){
        alert('Товар не найден.');
      } else if (err.response?.status === 400 && err.response?.data === "Not enough stock"){
        alert('Недостаточно товара на складе.');
      } else {
        alert('Ошибка при добавлении товара в корзину.');
      }
    }
  };

  return (
    <div className="oracle-page-wrapper">
      {/* Hero Section */}
      <div className="oracle-products-hero">
        <div className="oracle-container">
          <h1 className="oracle-hero-title">Каталог товаров</h1>
          <div className="oracle-search oracle-mb-3">
            <input 
              type="text" 
              className="oracle-search-input" 
              placeholder="Поиск лекарств и товаров..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="oracle-search-btn">
              <FaSearch />
            </button>
          </div>
        </div>
      </div>

      <div className="oracle-container">
        <div className="oracle-products-wrapper">
          {/* Mobile Filter Toggle */}
          <button 
            className="oracle-filter-toggle-btn" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Фильтры <FaChevronDown className={`oracle-toggle-icon ${showFilters ? 'active' : ''}`} />
          </button>

          {/* Sidebar Filters */}
          <div className={`oracle-products-sidebar ${showFilters ? 'active' : ''}`}>
            <div className="oracle-filter-section">
              <div className="oracle-filter-header">
                <h3 className="oracle-filter-title">Фильтры</h3>
                <button 
                  className="oracle-reset-filters-btn"
                  onClick={resetFilters}
                >
                  Сбросить все
                </button>
              </div>
              <ul className="oracle-filter-list">
                {categories.map(category => (
                  <li key={category.id}>
                    <label className="oracle-filter-option">
                      <input 
                        type="radio" 
                        name="category" 
                        checked={selectedCategory === category.id}
                        onChange={() => setSelectedCategory(category.id)}
                      />
                      <span>{category.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="oracle-filter-section">
              <h3 className="oracle-filter-title">Цена</h3>
              <div className="oracle-price-range">
                <input 
                  type="range" 
                  min="0" 
                  max="10000" 
                  step="100"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value)})}
                  className="oracle-price-slider"
                />
                <div className="oracle-price-inputs">
                  <input 
                    type="number" 
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value)})}
                    className="oracle-price-input"
                    min="0"
                  />
                  <span>-</span>
                  <input 
                    type="number" 
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value)})}
                    className="oracle-price-input"
                    max="10000"
                  />
                  <span>₸</span>
                </div>
              </div>
            </div>

            <div className="oracle-filter-section">
              <h3 className="oracle-filter-title">Сортировка</h3>
              <select 
                className="oracle-sort-select" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popularity">По популярности</option>
                <option value="price-asc">Цена: по возрастанию</option>
                <option value="price-desc">Цена: по убыванию</option>
                <option value="name">По названию</option>
                <option value="rating">По рейтингу</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="oracle-products-content">
            {loading ? (
              <div className="oracle-loading">Загрузка товаров...</div>
            ) : error ? (
              <div className="oracle-error">{error}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="oracle-no-products">
                <p>По вашему запросу ничего не найдено.</p>
                <button 
                  className="oracle-btn oracle-btn-primary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange({ min: 0, max: 10000 });
                  }}
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <>
                <div className="oracle-products-header">
                  <p className="oracle-products-count">Найдено товаров: {filteredProducts.length}</p>
                  <div className="oracle-products-sort-mobile">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="popularity">По популярности</option>
                      <option value="price-asc">Цена: по возрастанию</option>
                      <option value="price-desc">Цена: по убыванию</option>
                      <option value="name">По названию</option>
                      <option value="rating">По рейтингу</option>
                    </select>
                  </div>
                </div>

                <div className="oracle-products-grid">
                  {currentProducts.map(product => (
                    <Link 
                      to={`/product/${product.id}`} 
                      className="oracle-product-card-link" 
                      key={product.id}
                    >
                      <div className="oracle-product-card">
                        <div className="oracle-product-image-wrapper">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="oracle-product-image" 
                          />
                          <div className="oracle-product-actions">
                            {/* Removed Wishlist Button */}
                            <button 
                              className="oracle-product-action-btn oracle-cart-btn" 
                              title="Добавить в корзину"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart(product.id); // Call the addToCart function
                              }}
                            >
                              <FaShoppingCart />
                            </button>
                          </div>
                        </div>
                        
                        <div className="oracle-product-content">
                          <h3 className="oracle-product-title">{product.name}</h3>
                          <div className="oracle-product-category">
                            {product.category === "first-aid" ? "Аптечки первой помощи" :
                             product.category === "equipment" ? "Медицинское оборудование" :
                             product.category === "medicine" ? "Медикаменты" :
                             product.category === "prescription" ? "Рецептурные препараты" : 
                             product.category === "otc" ? "Безрецептурные препараты" : 
                             product.category === "supplements" ? "Витамины и добавки" :
                             "Другое"}
                          </div>
                          
                          <div className="oracle-product-description-wrapper">
                            <p className="oracle-product-description">{product.description}</p>
                          </div>
                          
                          <div className="oracle-product-price-wrapper">
                            <p className="oracle-product-price">{product.price} ₸</p>
                            {product.oldPrice && <p className="oracle-product-old-price">{product.oldPrice} ₸</p>}
                          </div>
                          
                          <button 
                            className="oracle-btn oracle-btn-primary oracle-btn-block"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(product.id);
                            }}
                          >
                            {product.stock === 0 ? 'Добавить в корзину' : 'В корзину'}
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="oracle-pagination">
                    <button 
                      onClick={() => paginate(currentPage - 1)} 
                      disabled={currentPage === 1}
                      className="oracle-pagination-btn"
                    >
                      &laquo;
                    </button>
                    
                    {[...Array(totalPages).keys()].map(number => (
                      <button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`oracle-pagination-btn ${currentPage === number + 1 ? 'active' : ''}`}
                      >
                        {number + 1}
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => paginate(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                      className="oracle-pagination-btn"
                    >
                      &raquo;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products; 
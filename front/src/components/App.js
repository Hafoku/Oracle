import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Home from "./HomePage";
import LoginForm from "./LoginForm";
import RegistrationForm from "./RegistrationForm";
import AuthContent from "./Musor/AppContent";
import AccountPage from "./AccountPage";
import AboutUs from "./AboutUs";
import News from "./News/News";
import UpdateNews from "./News/UpdateNews";
import CreateNews from "./News/CreateNews";
import ProductDetails from "./online-shop/ProductDetails";
import CreateProduct from "./online-shop/CreateProduct";
import CreateProductAI from "./online-shop/CreateProductAI";
import Cart from "./online-shop/Cart";
import UpdateProduct from "./online-shop/UpdateProduct";
import Products from "./Products";
import Contacts from "./contacts";
import ChatBot from "./ChatBot";

// Компонент для автоматической прокрутки вверх при переходе между страницами
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppLayout({ children }) {
  const location = useLocation();
  const hideHeaderRoutes = ["/login", "/registration"];
  const shouldShowHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowHeader && <Header />}
      <main className="main-content">{children}</main>
      {shouldShowHeader && <ChatBot />}
    </>
  );
}

function App() {
  return (
    <AppLayout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/registration" element={<RegistrationForm />} />
        <Route path="/messages" element={<AuthContent />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/news/:id" element={<News />} />
        <Route path="/update_news/:id" element={<UpdateNews />} />
        <Route path="/create_news" element={<CreateNews />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/create_product/" element={<CreateProduct />} />
        <Route path="/create_product_ai/" element={<CreateProductAI />} />
        <Route path="/update_product/:id" element={<UpdateProduct />} />
        <Route path="/cart/" element={<Cart />} />
        <Route path="/contacts" element={<Contacts />} />
      </Routes>
    </AppLayout>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;

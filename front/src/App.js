import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';

// Import your page components here
// import Home from './pages/Home';
// import Products from './pages/Products';
// etc...

function App() {
    return (
            <Router>
            <Layout>
                <Routes>
                    {/* Add your routes here */}
                    {/* <Route path="/" element={<Home />} /> */}
                    {/* <Route path="/products" element={<Products />} /> */}
                    {/* etc... */}
                </Routes>
            </Layout>
                <Header />
                <Footer />
            <ChatBot />
            </Router>
    );
}

export default App; 
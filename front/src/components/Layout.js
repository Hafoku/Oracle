import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatBot from './ChatBot';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="oracle-layout">
            <Header />
            <main className="oracle-main">
                {children}
            </main>
            <Footer />
            <ChatBot />
        </div>
    );
};

export default Layout; 
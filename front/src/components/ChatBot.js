import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import './styles/ChatBot.css';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Здравствуйте! Я ваш AI-ассистент. Как я могу вам помочь?' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const result = await model.generateContent(userMessage);
            const response = await result.response;
            const text = response.text();
            
            setMessages(prev => [...prev, { role: 'assistant', content: text }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="oracle-chatbot">
            {!isOpen && (
                <button 
                    className="oracle-chatbot-button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Открыть чат с ботом"
                >
                    <FaRobot size={32} />
                </button>
            )}
            
            {isOpen && (
                <div className="oracle-chatbot-container" ref={chatContainerRef}>
                    <div className="oracle-chatbot-header">
                        <h3>AI Ассистент</h3>
                        <button 
                            className="oracle-chatbot-close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Закрыть чат"
                        >
                            <FaTimes />
                        </button>
                    </div>
                    
                    <div className="oracle-chatbot-messages">
                        {messages.map((message, index) => (
                            <div 
                                key={index} 
                                className={`oracle-chatbot-message ${message.role}`}
                            >
                                {message.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="oracle-chatbot-message assistant loading">
                                <div className="oracle-chatbot-typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <form onSubmit={handleSubmit} className="oracle-chatbot-input-form">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Введите ваше сообщение..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading} aria-label="Отправить">
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBot; 
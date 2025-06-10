import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from './Header';
import Footer from './Footer';
import Logger from "./Logger";
import "./styles/UsersList.css";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("jwtToken");

      if (!token) {
        Logger.logWarning('No token found for user list, redirecting to login');
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get("/user/all", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUsers(response.data);
        setError(null);
        Logger.logSuccess('Users fetched successfully');
      } catch (err) {
        Logger.logError('Error fetching users:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('У вас нет прав для просмотра этой страницы. Войдите как администратор.');
          localStorage.removeItem("jwtToken");
          // Optionally redirect after a delay
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setError('Ошибка при загрузке списка пользователей.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="oracle-container my-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oracle-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="oracle-container my-8 text-center">
          <div className="text-red-600 font-bold text-lg">{error}</div>
          <button 
            className="oracle-btn oracle-btn-primary mt-4"
            onClick={() => navigate("/login")}
          >
            Перейти к логину
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper users-list-page">
      <div className="oracle-hero oracle-hero-medical">
        <div className="oracle-hero-content">
          <h1 className="oracle-hero-title">Список пользователей</h1>
          <p className="oracle-hero-description">Управление зарегистрированными пользователями</p>
        </div>
      </div>

      <div className="oracle-section">
        <div className="oracle-container">
          <div className="oracle-card p-6 shadow-lg rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Имя пользователя</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Роль</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{user.id}</td>
                      <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{user.userName}</td>
                      <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{user.email}</td>
                      <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800 font-medium">{user.role?.name || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UsersList; 
import React, { useState } from 'react';
import axios from 'axios'; // Импортируем axios
import './App.css'; // Импортируем стили

function App() {
  // Состояния для хранения введённого URL, алиаса, времени жизни, короткой ссылки и ошибки
  const [originalUrl, setOriginalUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');

  // Состояния для информации о ссылке и аналитики
  const [urlInfo, setUrlInfo] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Базовый URL для API
  const API_BASE_URL = 'http://localhost:5000';

  // Функция для обработки сокращения URL
  const handleShorten = async () => {
    if (!originalUrl) {
      setError('Пожалуйста, введите URL');
      return;
    }

    try {
      // Отправляем POST-запрос через axios
      const response = await axios.post(`${API_BASE_URL}/shorten`, {
        originalUrl,
        alias: alias || undefined, // Алиас необязательный
        expiresAt: expiresAt || undefined, // Время жизни необязательное
      });

      // Если запрос успешен, обновляем состояние
      if (response.data.url) {
        setShortUrl(response.data.url);
        setError('');
      } else {
        setError('Не удалось получить короткую ссылку');
        setShortUrl('');
      }
    } catch (err) {
      // Обрабатываем ошибку
      if (err.response) {
        // Ошибка от сервера
        setError(err.response.data.error || 'Произошла ошибка');
      } else {
        // Ошибка сети или другая ошибка
        setError('Ошибка при подключении к серверу');
      }
      setShortUrl('');
    }
  };

  // Функция для получения информации о ссылке
  const handleGetInfo = async () => {
    if (!shortUrl) {
      setError('Пожалуйста, сначала создайте короткую ссылку');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/info/${shortUrl}`);
      setUrlInfo(response.data);
      setError('');
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Произошла ошибка');
      } else {
        setError('Ошибка при подключении к серверу');
      }
      setUrlInfo(null);
    }
  };

  // Функция для получения аналитики
  const handleGetAnalytics = async () => {
    if (!shortUrl) {
      setError('Пожалуйста, сначала создайте короткую ссылку');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/${shortUrl}`);
      setAnalyticsData(response.data);
      setError('');
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Произошла ошибка');
      } else {
        setError('Ошибка при подключении к серверу');
      }
      setAnalyticsData(null);
    }
  };

  return (
    <div className="App">
      <h1>Сокращение URL</h1>
      <div className="url-shortener">
        {/* Поле для ввода оригинального URL */}
        <input
          type="text"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          placeholder="Введите оригинальный URL"
        />

        {/* Поле для ввода алиаса */}
        <input
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Введите алиас (необязательно)"
        />

        {/* Поле для ввода времени жизни ссылки */}
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          placeholder="Введите время жизни ссылки (необязательно)"
        />

        {/* Кнопка для генерации короткой ссылки */}
        <button onClick={handleShorten}>Сократить URL</button>

        {/* Отображение короткой ссылки */}
        {shortUrl && (
          <div className="result">
            <strong>Короткая ссылка:</strong>{' '}
            <a href={`${API_BASE_URL}/${shortUrl}`} target="_blank" rel="noopener noreferrer">
              {`${API_BASE_URL}/${shortUrl}`}
            </a>
          </div>
        )}

        {/* Кнопка для получения информации о ссылке */}
        {shortUrl && (
          <button onClick={handleGetInfo}>Получить информацию о ссылке</button>
        )}

        {/* Отображение информации о ссылке */}
        {urlInfo && (
          <div className="info">
            <h2>Информация о ссылке</h2>
            <p><strong>Оригинальный URL:</strong> {urlInfo.originalUrl}</p>
            <p><strong>Дата создания:</strong> {new Date(urlInfo.createdAt).toLocaleString()}</p>
            <p><strong>Количество переходов:</strong> {urlInfo.clickCount}</p>
          </div>
        )}

        {/* Кнопка для получения аналитики */}
        {shortUrl && (
          <button onClick={handleGetAnalytics}>Получить аналитику</button>
        )}

        {/* Отображение аналитики */}
        {analyticsData && (
          <div className="analytics">
            <h2>Аналитика</h2>
            <p><strong>Количество переходов:</strong> {analyticsData.clickCount}</p>
            <p><strong>Последние IP-адреса:</strong></p>
            <ul>
              {analyticsData.ipAddresses.map((ip, index) => (
                <li key={index}>{ip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Отображение ошибки */}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}

export default App;

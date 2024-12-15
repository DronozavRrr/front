import axios from 'axios'; // Убедитесь, что импорт указан

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Адрес вашего бэкенда
    timeout: 5000, // Опционально: установка тайм-аута
  });

  export default api; // Экспорт по умолчанию
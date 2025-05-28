import axios from 'axios';

const Logger = {
    // Эмодзи для разных типов логов
    emojis: {
        info: 'ℹ️',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        request: '📤',
        response: '📥',
        user: '👤',
        auth: '🔐',
        file: '📁',
        system: '⚙️'
    },

    // Логирование запросов
    logRequest: (config) => {
        const requestData = config.data ? { ...config.data } : {};
        
        // Удаляем пароль из логов
        if (requestData.password) {
            requestData.password = '[REDACTED]';
        }
        if (requestData.oldpassword) {
            requestData.oldpassword = '[REDACTED]';
        }
        if (requestData.matchingPassword) {
            requestData.matchingPassword = '[REDACTED]';
        }

        console.log(`${Logger.emojis.request} Request:`, {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: requestData,
            headers: config.headers
        });
    },

    // Логирование ответов
    logResponse: (response) => {
        const responseData = response.data ? { ...response.data } : {};
        
        // Удаляем пароль из логов
        if (responseData.password) {
            responseData.password = '[REDACTED]';
        }

        console.log(`${Logger.emojis.response} Response:`, {
            status: response.status,
            data: responseData
        });
    },

    // Логирование ошибок
    logError: (error) => {
        console.error(`${Logger.emojis.error} Error:`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    },

    // Логирование успешных действий
    logSuccess: (message, data = null) => {
        console.log(`${Logger.emojis.success} ${message}`, data || '');
    },

    // Логирование информации
    logInfo: (message, data = null) => {
        console.log(`${Logger.emojis.info} ${message}`, data || '');
    },

    // Логирование предупреждений
    logWarning: (message, data = null) => {
        console.warn(`${Logger.emojis.warning} ${message}`, data || '');
    },

    // Логирование действий пользователя
    logUserAction: (action, data = null) => {
        console.log(`${Logger.emojis.user} User Action: ${action}`, data || '');
    },

    // Логирование аутентификации
    logAuth: (action, data = null) => {
        console.log(`${Logger.emojis.auth} Auth: ${action}`, data || '');
    },

    // Логирование работы с файлами
    logFile: (action, data = null) => {
        console.log(`${Logger.emojis.file} File: ${action}`, data || '');
    },

    // Логирование системных событий
    logSystem: (event, data = null) => {
        console.log(`${Logger.emojis.system} System: ${event}`, data || '');
    }
};

// Добавляем перехватчики для axios
axios.interceptors.request.use(
    config => {
        Logger.logRequest(config);
        return config;
    },
    error => {
        Logger.logError(error);
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    response => {
        Logger.logResponse(response);
        return response;
    },
    error => {
        Logger.logError(error);
        return Promise.reject(error);
    }
);

export default Logger; 
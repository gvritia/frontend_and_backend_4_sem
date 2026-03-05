// Инициализация глобальных переменных
global.users = [];
global.products = [];
global.refreshTokens = []; // Хранилище для refresh токенов

// Константы для JWT
global.JWT_SECRET = 'your_jwt_secret_key_2026';
global.JWT_REFRESH_SECRET = 'your_refresh_secret_key_2026';
global.ACCESS_EXPIRES_IN = '15m'; // 15 минут
global.REFRESH_EXPIRES_IN = '7d'; // 7 дней

// Вспомогательные функции
global.findUserByEmail = (email) => {
    return global.users.find(user => user.email === email);
};

global.findUserById = (id) => {
    return global.users.find(user => user.id === id);
};

global.findProductById = (id) => {
    return global.products.find(product => product.id === id);
};

global.findRefreshToken = (token) => {
    return global.refreshTokens.find(rt => rt.token === token);
};

global.removeRefreshToken = (token) => {
    global.refreshTokens = global.refreshTokens.filter(rt => rt.token !== token);
};

console.log('Глобальные переменные инициализированы');
console.log('JWT секреты загружены');
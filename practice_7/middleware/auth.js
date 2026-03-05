const jwt = require('jsonwebtoken');

/**
 * Middleware для проверки JWT токена
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Требуется аутентификация',
            message: 'Отсутствует токен доступа'
        });
    }

    jwt.verify(token, global.JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: 'Токен истек',
                    message: 'Пожалуйста, выполните вход заново'
                });
            }
            return res.status(403).json({
                error: 'Недействительный токен',
                message: 'Токен не прошел проверку'
            });
        }

        // Сохраняем информацию о пользователе в запросе
        req.user = user;
        next();
    });
}

/**
 * Middleware для опциональной аутентификации
 * (не требует токена, но если есть - проверяет)
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, global.JWT_SECRET, (err, user) => {
        if (err) {
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    });
}

module.exports = { authenticateToken, optionalAuth };
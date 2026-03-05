const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Управление аутентификацией с JWT
 */

// Хеширование пароля
async function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

// Проверка пароля
async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

// Генерация токенов
function generateTokens(user) {
    const accessToken = jwt.sign(
        {
            sub: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
        },
        global.JWT_SECRET,
        { expiresIn: global.ACCESS_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { sub: user.id },
        global.JWT_REFRESH_SECRET,
        { expiresIn: global.REFRESH_EXPIRES_IN }
    );

    // Сохраняем refresh токен
    global.refreshTokens.push({
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней
    });

    return { accessToken, refreshToken };
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               first_name:
 *                 type: string
 *                 example: Иван
 *               last_name:
 *                 type: string
 *                 example: Иванов
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mySecurePassword123
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *       400:
 *         description: Ошибка валидации
 *       409:
 *         description: Пользователь с таким email уже существует
 */
router.post('/register', async (req, res) => {
    try {
        const { email, first_name, last_name, password } = req.body;

        // Валидация
        if (!email || !first_name || !last_name || !password) {
            return res.status(400).json({
                error: "Все поля обязательны: email, first_name, last_name, password"
            });
        }

        // Проверка формата email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Некорректный формат email" });
        }

        // Проверка длины пароля
        if (password.length < 6) {
            return res.status(400).json({ error: "Пароль должен содержать минимум 6 символов" });
        }

        // Проверка существования пользователя
        const existingUser = global.users.find(user => user.email === email);
        if (existingUser) {
            return res.status(409).json({ error: "Пользователь с таким email уже существует" });
        }

        // Хеширование пароля и создание пользователя
        const hashedPassword = await hashPassword(password);
        const newUser = {
            id: nanoid(10),
            email,
            first_name,
            last_name,
            password: hashedPassword,
            created_at: new Date().toISOString()
        };

        global.users.push(newUser);

        // Генерируем токены
        const { accessToken, refreshToken } = generateTokens(newUser);

        // Отправляем ответ без пароля
        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            user: userWithoutPassword,
            tokens: {
                accessToken,
                refreshToken,
                expiresIn: global.ACCESS_EXPIRES_IN
            },
            message: "Пользователь успешно создан"
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mySecurePassword123
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email и пароль обязательны" });
        }

        // Поиск пользователя
        const user = global.users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ error: "Неверный email или пароль" });
        }

        // Проверка пароля
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Неверный email или пароль" });
        }

        // Генерируем токены
        const { accessToken, refreshToken } = generateTokens(user);

        // Отправляем ответ без пароля
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            user: userWithoutPassword,
            tokens: {
                accessToken,
                refreshToken,
                expiresIn: global.ACCESS_EXPIRES_IN
            },
            message: "Вход выполнен успешно"
        });

    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление access токена
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Новые токены
 *       401:
 *         description: Недействительный refresh токен
 */
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh токен обязателен" });
        }

        // Проверяем наличие токена в хранилище
        const storedToken = global.findRefreshToken(refreshToken);
        if (!storedToken) {
            return res.status(401).json({ error: "Недействительный refresh токен" });
        }

        // Верифицируем токен
        jwt.verify(refreshToken, global.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                // Удаляем просроченный токен
                global.removeRefreshToken(refreshToken);
                return res.status(401).json({ error: "Refresh токен истек" });
            }

            // Находим пользователя
            const user = global.findUserById(decoded.sub);
            if (!user) {
                global.removeRefreshToken(refreshToken);
                return res.status(401).json({ error: "Пользователь не найден" });
            }

            // Удаляем старый refresh токен
            global.removeRefreshToken(refreshToken);

            // Генерируем новые токены
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

            res.json({
                tokens: {
                    accessToken,
                    refreshToken: newRefreshToken,
                    expiresIn: global.ACCESS_EXPIRES_IN
                }
            });
        });

    } catch (error) {
        console.error('Ошибка обновления токена:', error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Выход из системы
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный выход
 */
router.post('/logout', authenticateToken, (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        // Удаляем все refresh токены пользователя
        global.refreshTokens = global.refreshTokens.filter(rt => rt.userId !== req.user.sub);

        res.json({ message: "Выход выполнен успешно" });
    } catch (error) {
        console.error('Ошибка выхода:', error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 created_at:
 *                   type: string
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Пользователь не найден
 */
router.get('/me', authenticateToken, (req, res) => {
    try {
        // req.user содержит данные из токена (sub, email, first_name, last_name)
        const userId = req.user.sub;

        // Получаем полные данные пользователя из базы
        const user = global.findUserById(userId);

        if (!user) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        // Отправляем данные без пароля
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            ...userWithoutPassword,
            tokenInfo: {
                issuedAt: new Date(req.user.iat * 1000).toISOString(),
                expiresAt: new Date(req.user.exp * 1000).toISOString()
            }
        });
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

module.exports = router;
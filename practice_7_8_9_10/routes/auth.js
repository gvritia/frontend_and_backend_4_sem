const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email и password обязательны' });
    }

    if (global.findUserByEmail(email)) {
        return res.status(409).json({ error: 'Пользователь уже существует' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
        id: String(global.users.length + 1),
        email,
        passwordHash
    };

    global.users.push(newUser);
    res.status(201).json({ message: 'Пользователь создан', id: newUser.id, email: newUser.email });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email и password обязательны' });
    }

    const user = global.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Неверные данные' });
    }

    // Генерируем access + refresh
    const accessToken = jwt.sign(
        { sub: user.id, email: user.email },
        global.JWT_SECRET,
        { expiresIn: global.ACCESS_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { sub: user.id, email: user.email },
        global.JWT_REFRESH_SECRET,
        { expiresIn: global.REFRESH_EXPIRES_IN }
    );

    // Сохраняем refresh-токен в глобальном хранилище
    const decoded = jwt.decode(refreshToken);
    global.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(decoded.exp * 1000)
    });

    res.json({ accessToken, refreshToken });
});

router.post('/refresh', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1];

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh-токен обязателен в заголовке Authorization: Bearer <token>' });
    }

    global.removeExpiredRefreshTokens();

    const storedToken = global.findRefreshToken(refreshToken);
    if (!storedToken) {
        return res.status(401).json({ error: 'Недействительный refresh-токен' });
    }

    try {
        const payload = jwt.verify(refreshToken, global.JWT_REFRESH_SECRET);
        const user = global.findUserById(payload.sub);

        if (!user) {
            return res.status(401).json({ error: 'Пользователь не найден' });
        }

        global.removeRefreshToken(refreshToken);

        const newAccessToken = jwt.sign(
            { sub: user.id, email: user.email },
            global.JWT_SECRET,
            { expiresIn: global.ACCESS_EXPIRES_IN }
        );

        const newRefreshToken = jwt.sign(
            { sub: user.id, email: user.email },
            global.JWT_REFRESH_SECRET,
            { expiresIn: global.REFRESH_EXPIRES_IN }
        );

        const newDecoded = jwt.decode(newRefreshToken);
        global.refreshTokens.push({
            token: newRefreshToken,
            expiresAt: new Date(newDecoded.exp * 1000)
        });

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        global.removeRefreshToken(refreshToken);
        res.status(401).json({ error: 'Refresh-токен истёк или недействителен' });
    }
});

router.get('/me', (req, res, next) => {
    require('../middleware/auth').authenticateToken(req, res, () => {
        res.json({
            id: req.user.sub,
            email: req.user.email
        });
    });
});

module.exports = router;
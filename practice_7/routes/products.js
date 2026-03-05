const express = require('express');
const { nanoid } = require('nanoid');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Управление товарами (требуется JWT токен)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         created_at:
 *           type: string
 *         created_by:
 *           type: string
 *         created_by_email:
 *           type: string
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Смартфон"
 *               category:
 *                 type: string
 *                 example: "Электроника"
 *               description:
 *                 type: string
 *                 example: "Современный смартфон"
 *               price:
 *                 type: number
 *                 example: 45000
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *       401:
 *         description: Требуется аутентификация
 */
router.post('/', authenticateToken, (req, res) => {
    try {
        const { title, category, description, price } = req.body;

        // Валидация
        if (!title || !category || !description || price === undefined) {
            return res.status(400).json({
                error: "Все поля обязательны: title, category, description, price"
            });
        }

        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ error: "Цена должна быть положительным числом" });
        }

        const newProduct = {
            id: nanoid(10),
            title,
            category,
            description,
            price,
            created_at: new Date().toISOString(),
            created_by: req.user.sub,
            created_by_email: req.user.email
        };

        global.products.push(newProduct);
        res.status(201).json(newProduct);

    } catch (error) {
        console.error('Ошибка создания товара:', error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Фильтр по категории
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Минимальная цена
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Максимальная цена
 *     responses:
 *       200:
 *         description: Список товаров
 *       401:
 *         description: Требуется аутентификация
 */
router.get('/', authenticateToken, (req, res) => {
    try {
        let products = [...global.products];

        // Фильтрация по категории
        if (req.query.category) {
            products = products.filter(p =>
                p.category.toLowerCase().includes(req.query.category.toLowerCase())
            );
        }

        // Фильтрация по цене
        if (req.query.minPrice) {
            const minPrice = parseFloat(req.query.minPrice);
            if (!isNaN(minPrice)) {
                products = products.filter(p => p.price >= minPrice);
            }
        }

        if (req.query.maxPrice) {
            const maxPrice = parseFloat(req.query.maxPrice);
            if (!isNaN(maxPrice)) {
                products = products.filter(p => p.price <= maxPrice);
            }
        }

        res.status(200).json({
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Ошибка получения товаров:', error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Информация о товаре
 *       401:
 *         description: Требуется аутентификация
 *       404:
 *         description: Товар не найден
 */
router.get('/:id', authenticateToken, (req, res) => {
    try {
        const product = global.findProductById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: "Товар не найден" });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Ошибка получения товара:', error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Товар обновлен
 *       401:
 *         description: Требуется аутентификация
 *       403:
 *         description: Нет прав на редактирование
 *       404:
 *         description: Товар не найден
 */
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const productIndex = global.products.findIndex(p => p.id === req.params.id);

        if (productIndex === -1) {
            return res.status(404).json({ error: "Товар не найден" });
        }

        // Проверяем, является ли пользователь создателем товара
        if (global.products[productIndex].created_by !== req.user.sub) {
            return res.status(403).json({
                error: "Нет прав на редактирование этого товара",
                message: "Только создатель может редактировать товар"
            });
        }

        const { title, category, description, price } = req.body;
        const updatedProduct = { ...global.products[productIndex] };

        if (title) updatedProduct.title = title;
        if (category) updatedProduct.category = category;
        if (description) updatedProduct.description = description;
        if (price !== undefined) {
            if (typeof price !== 'number' || price <= 0) {
                return res.status(400).json({ error: "Цена должна быть положительным числом" });
            }
            updatedProduct.price = price;
        }

        updatedProduct.updated_at = new Date().toISOString();

        global.products[productIndex] = updatedProduct;
        res.status(200).json(updatedProduct);

    } catch (error) {
        console.error('Ошибка обновления товара:', error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар удален
 *       401:
 *         description: Требуется аутентификация
 *       403:
 *         description: Нет прав на удаление
 *       404:
 *         description: Товар не найден
 */
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const productIndex = global.products.findIndex(p => p.id === req.params.id);

        if (productIndex === -1) {
            return res.status(404).json({ error: "Товар не найден" });
        }

        // Проверяем, является ли пользователь создателем товара
        if (global.products[productIndex].created_by !== req.user.sub) {
            return res.status(403).json({
                error: "Нет прав на удаление этого товара",
                message: "Только создатель может удалить товар"
            });
        }

        const deletedProduct = global.products[productIndex];
        global.products.splice(productIndex, 1);

        res.status(200).json({
            message: "Товар успешно удален",
            id: deletedProduct.id,
            title: deletedProduct.title
        });

    } catch (error) {
        console.error('Ошибка удаления товара:', error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

module.exports = router;
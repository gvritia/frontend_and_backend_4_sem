const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");

// Swagger
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const port = 3000;

app.use(express.json());

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use((req, res, next) => {
    res.on("finish", () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (["POST", "PATCH"].includes(req.method)) {
            console.log("Body:", req.body);
        }
    });
    next();
});

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - age
 *       properties:
 *         id:
 *           type: string
 *           example: "abc123"
 *         name:
 *           type: string
 *           example: "Иван"
 *         age:
 *           type: number
 *           example: 25
 */

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Users API",
            version: "1.0.0",
            description: "API для работы с пользователями"
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ]
    },
    apis: ["./app.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

let users = [
    { id: nanoid(6), name: "Иван", age: 25 },
    { id: nanoid(6), name: "Мария", age: 30 }
];

function findUserOr404(id, res) {
    const user = users.find(u => u.id === id);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return null;
    }
    return user;
}

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей
 */
app.get("/api/users", (req, res) => {
    res.json(users);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 */
app.get("/api/users/:id", (req, res) => {
    const user = findUserOr404(req.params.id, res);
    if (!user) return;
    res.json(user);
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Создать пользователя
 *     tags: [Users]
 */
app.post("/api/users", (req, res) => {
    const { name, age } = req.body;

    if (!name || age === undefined) {
        return res.status(400).json({ error: "Name and age are required" });
    }

    const newUser = {
        id: nanoid(6),
        name: name.trim(),
        age: Number(age)
    };

    users.push(newUser);
    res.status(201).json(newUser);
});

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Обновить пользователя
 *     tags: [Users]
 */
app.patch("/api/users/:id", (req, res) => {
    const user = findUserOr404(req.params.id, res);
    if (!user) return;

    const { name, age } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (age !== undefined) user.age = Number(age);

    res.json(user);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Удалить пользователя
 *     tags: [Users]
 */
app.delete("/api/users/:id", (req, res) => {
    const exists = users.some(u => u.id === req.params.id);
    if (!exists) {
        return res.status(404).json({ error: "User not found" });
    }

    users = users.filter(u => u.id !== req.params.id);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger: http://localhost:${port}/api-docs`);
});
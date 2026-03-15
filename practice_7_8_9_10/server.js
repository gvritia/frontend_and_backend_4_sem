const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Импортируем глобальные переменные
require('./global');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Auth & Products API with JWT',
            version: '1.0.0',
            description: 'API для аутентификации с JWT и управления товарами',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'API с JWT аутентификацией работает',
        endpoints: {
            documentation: '/api-docs',
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me (требует токен)'
            },
            products: {
                create: 'POST /api/products (требует токен)',
                getAll: 'GET /api/products (требует токен)',
                getOne: 'GET /api/products/:id (требует токен)',
                update: 'PUT /api/products/:id (требует токен)',
                delete: 'DELETE /api/products/:id (требует токен)'
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});
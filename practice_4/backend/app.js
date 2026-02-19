const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");

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

let products = [
    {
        id: nanoid(6),
        name: "Игровая мышь Razer",
        category: "Мыши",
        description: "Высокоточная игровая мышь с RGB подсветкой",
        price: 79,
        stock: 15,
        rating: 4.8
    },
    {
        id: nanoid(6),
        name: "Механическая клавиатура Logitech",
        category: "Клавиатуры",
        description: "Механическая клавиатура с синими переключателями",
        price: 120,
        stock: 8,
        rating: 4.7
    },
    {
        id: nanoid(6),
        name: "Игровая гарнитура HyperX",
        category: "Гарнитуры",
        description: "Объёмный звук 7.1 для полного погружения",
        price: 95,
        stock: 12,
        rating: 4.6
    },
    {
        id: nanoid(6),
        name: "Коврик SteelSeries",
        category: "Аксессуары",
        description: "Большой игровой коврик для мыши",
        price: 25,
        stock: 30,
        rating: 4.5
    },
    {
        id: nanoid(6),
        name: "Геймпад Xbox",
        category: "Геймпады",
        description: "Беспроводной контроллер для ПК и Xbox",
        price: 65,
        stock: 10,
        rating: 4.9
    },
    {
        id: nanoid(6),
        name: "Веб-камера Logitech C920",
        category: "Камеры",
        description: "Full HD камера для стриминга",
        price: 85,
        stock: 7,
        rating: 4.4
    },
    {
        id: nanoid(6),
        name: "Игровой монитор 144Hz",
        category: "Мониторы",
        description: "Монитор с частотой обновления 144 Гц",
        price: 230,
        stock: 5,
        rating: 4.8
    },
    {
        id: nanoid(6),
        name: "Игровое кресло DXRacer",
        category: "Кресла",
        description: "Эргономичное кресло для геймеров",
        price: 310,
        stock: 4,
        rating: 4.9
    },
    {
        id: nanoid(6),
        name: "Микрофон Blue Yeti",
        category: "Микрофоны",
        description: "Студийный микрофон для стримов",
        price: 140,
        stock: 6,
        rating: 4.7
    },
    {
        id: nanoid(6),
        name: "Игровой стол",
        category: "Мебель",
        description: "Стол с кабель-менеджментом и RGB",
        price: 260,
        stock: 3,
        rating: 4.6
    }
];


function findProductOr404(id, res) {
    const product = products.find(p => p.id === id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }
    return product;
}


app.post("/api/products", (req, res) => {
    const { name, category, description, price, stock, rating } = req.body;

    if (!name || !category) {
        return res.status(400).json({ error: "Name and category are required" });
    }

    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(),
        description: description?.trim() || "",
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        rating: Number(rating) || 0
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.get("/api/products", (req, res) => {
    res.json(products);
});

app.get("/api/products/:id", (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;
    res.json(product);
});


app.patch("/api/products/:id", (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;

    const { name, category, description, price, stock, rating } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (rating !== undefined) product.rating = Number(rating);

    res.json(product);
});


app.delete("/api/products/:id", (req, res) => {
    const exists = products.some(p => p.id === req.params.id);
    if (!exists) {
        return res.status(404).json({ error: "Product not found" });
    }

    products = products.filter(p => p.id !== req.params.id);
    res.status(204).send();
});


app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});

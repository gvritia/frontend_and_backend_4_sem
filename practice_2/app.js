const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let products = [
    { id: 1, title: 'Телефон', price: 30000 },
    { id: 2, title: 'Ноутбук', price: 90000 },
    { id: 3, title: 'Наушники', price: 5000 },
];


app.get('/', (req, res) => {
    res.send('API товаров работает');
});


app.get('/products', (req, res) => {
    res.json(products);
});


app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);

    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }

    res.json(product);
});


app.post('/products', (req, res) => {
    const { title, price } = req.body;

    if (!title || price === undefined) {
        return res.status(400).json({ message: 'Название и стоимость обязательны' });
    }

    const newProduct = {
        id: Date.now(),
        title,
        price
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});


app.patch('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);

    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }

    const { title, price } = req.body;

    if (title !== undefined) product.title = title;
    if (price !== undefined) product.price = price;

    res.json(product);
});


app.delete('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);

    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }

    products = products.filter(p => p.id != req.params.id);
    res.json({ message: 'Товар удалён' });
});


app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});

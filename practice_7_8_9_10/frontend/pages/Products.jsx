import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ title: '', category: '', description: '', price: '' });
    const [editingId, setEditingId] = useState(null);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        const res = await apiClient.get('/products');
        setProducts(res.data.products || res.data);
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) {
            await apiClient.put(`/products/${editingId}`, form);
            setEditingId(null);
        } else {
            await apiClient.post('/products', form);
        }
        setForm({ title: '', category: '', description: '', price: '' });
        fetchProducts();
    };

    const handleDelete = async (id) => {
        if (confirm('Удалить товар?')) {
            await apiClient.delete(`/products/${id}`);
            fetchProducts();
        }
    };

    const handleEdit = (p) => {
        setForm({ title: p.title, category: p.category, description: p.description, price: p.price });
        setEditingId(p.id);
    };

    const handleView = async (id) => {
        const res = await apiClient.get(`/products/${id}`);
        alert(JSON.stringify(res.data, null, 2));
    };

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
            <h1>Управление товарами</h1>
            <button onClick={logout} style={{ float: 'right' }}>Выйти</button>

            {/* Форма создания/редактирования */}
            <form onSubmit={handleSubmit}>
                <input placeholder="Название" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                <input placeholder="Категория" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
                <input placeholder="Описание" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                <input type="number" placeholder="Цена" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} required />
                <button type="submit">{editingId ? 'Сохранить изменения' : 'Создать товар'}</button>
            </form>

            {/* Список товаров */}
            <table border="1" style={{ width: '100%', marginTop: 20 }}>
                <thead>
                <tr>
                    <th>ID</th><th>Название</th><th>Категория</th><th>Цена</th><th>Действия</th>
                </tr>
                </thead>
                <tbody>
                {products.map(p => (
                    <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.title}</td>
                        <td>{p.category}</td>
                        <td>{p.price} ₽</td>
                        <td>
                            <button onClick={() => handleView(p.id)}>Просмотр</button>
                            <button onClick={() => handleEdit(p)}>Редактировать</button>
                            <button onClick={() => handleDelete(p.id)}>Удалить</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
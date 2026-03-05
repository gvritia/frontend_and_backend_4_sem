import React, { useEffect, useState } from "react";
import { api } from "../../api";
import UserItem from "../../components/UserItem";
import UserModal from "../../components/UserModal";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
            alert("Ошибка загрузки пользователей");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingUser(null);
        setModalOpen(true);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingUser(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить пользователя?")) return;

        try {
            await api.deleteUser(id);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error(err);
            alert("Ошибка удаления пользователя");
        }
    };

    const handleSubmit = async (payload) => {
        try {
            if (editingUser) {
                const updated = await api.updateUser(payload.id, payload);
                setUsers((prev) =>
                    prev.map((u) => (u.id === payload.id ? updated : u))
                );
            } else {
                const created = await api.createUser(payload);
                setUsers((prev) => [...prev, created]);
            }
            closeModal();
        } catch (err) {
            console.error(err);
            alert("Ошибка сохранения пользователя");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>Пользователи</h1>
            <button onClick={openCreate}>+ Добавить пользователя</button>

            {loading ? (
                <p>Загрузка...</p>
            ) : (
                <div>
                    {users.map((user) => (
                        <UserItem
                            key={user.id}
                            user={user}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <UserModal
                open={modalOpen}
                initialUser={editingUser}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
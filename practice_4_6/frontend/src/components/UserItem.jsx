import React from "react";

export default function UserItem({ user, onEdit, onDelete }) {
    return (
        <div style={{ border: "1px solid #ccc", padding: 10, marginTop: 10 }}>
            <div><strong>{user.name}</strong></div>
            <div>Возраст: {user.age}</div>

            <button onClick={() => onEdit(user)}>Редактировать</button>
            <button onClick={() => onDelete(user.id)}>Удалить</button>
        </div>
    );
}
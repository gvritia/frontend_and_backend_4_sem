import React, { useEffect, useState } from "react";

export default function UserModal({ open, initialUser, onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");

    useEffect(() => {
        if (initialUser) {
            setName(initialUser.name);
            setAge(initialUser.age);
        } else {
            setName("");
            setAge("");
        }
    }, [initialUser]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            id: initialUser?.id,
            name,
            age: Number(age),
        });
    };

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 20 }}>
                <h3>{initialUser ? "Редактировать" : "Создать"} пользователя</h3>

                <div>
                    <input
                        placeholder="Имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <input
                        type="number"
                        placeholder="Возраст"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Сохранить</button>
                <button type="button" onClick={onClose}>Отмена</button>
            </form>
        </div>
    );
}
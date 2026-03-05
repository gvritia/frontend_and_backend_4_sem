import React, { useEffect, useState } from "react";

export default function ProductModal({
                                         open,
                                         mode,
                                         initialProduct,
                                         onClose,
                                         onSubmit,
                                     }) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [rating, setRating] = useState("");

    useEffect(() => {
        if (!open) return;

        setName(initialProduct?.name ?? "");
        setCategory(initialProduct?.category ?? "");
        setDescription(initialProduct?.description ?? "");
        setPrice(initialProduct?.price ?? "");
        setStock(initialProduct?.stock ?? "");
        setRating(initialProduct?.rating ?? "");
    }, [open, initialProduct]);

    if (!open) return null;

    const title =
        mode === "edit" ? "Редактирование товара" : "Создание товара";

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("Введите название");
            return;
        }

        onSubmit({
            id: initialProduct?.id,
            name,
            category,
            description,
            price: Number(price),
            stock: Number(stock),
            rating: Number(rating),
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div
                className="modal"
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal__header">
                    <div className="modal__title">{title}</div>
                    <button className="iconBtn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        Название
                        <input
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </label>

                    <label className="label">
                        Категория
                        <input
                            className="input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </label>

                    <label className="label">
                        Описание
                        <input
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </label>

                    <label className="label">
                        Цена
                        <input
                            className="input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </label>

                    <label className="label">
                        Количество
                        <input
                            className="input"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
                    </label>

                    <label className="label">
                        Рейтинг
                        <input
                            className="input"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                        />
                    </label>

                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--primary">
                            {mode === "edit" ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

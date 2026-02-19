import React from "react";

export default function ProductItem({ product, onEdit, onDelete }) {
    return (
        <div className="userRow">
            <div className="userMain">
                <div className="userId">#{product.id}</div>
                <div className="userName">{product.name}</div>
                <div className="userAge">{product.price}$</div>
                <div className="userAge">На складе: {product.stock}</div>
            </div>

            <div className="userActions">
                <button className="btn" onClick={() => onEdit(product)}>
                    Редактировать
                </button>
                <button
                    className="btn btn--danger"
                    onClick={() => onDelete(product.id)}
                >
                    Удалить
                </button>
            </div>
        </div>
    );
}

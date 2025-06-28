// src/components/RatingModal.tsx
import React, { useState } from "react";
import "../styles/ratingModal.css";

interface Props {
  storeName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

const RatingModal: React.FC<Props> = ({ storeName, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Por favor selecciona una calificación.");
      return;
    }
    onSubmit(rating, comment);
  };

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <h2>Valorar tienda: {storeName}</h2>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={star <= rating ? "filled" : ""}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          placeholder="Deja un comentario (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose}>Cancelar</button>
          <button className="submit-btn" onClick={handleSubmit}>Enviar</button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;

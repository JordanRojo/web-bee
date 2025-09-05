import React from 'react';
import ReactDOM from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import './ImageModal.css'; // Crea este archivo CSS

const ImageModal = ({ isOpen, imageUrl, onClose }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="image-modal-overlay" onClick={onClose}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="image-modal-close-button" onClick={onClose}>
                    <FaTimes />
                </button>
                <img src={imageUrl} alt="Imagen ampliada" className="image-modal-image" />
            </div>
        </div>,
        document.getElementById('modal-root') // Asegúrate de tener un div con id="modal-root" en tu index.html
    );
};

export default ImageModal;
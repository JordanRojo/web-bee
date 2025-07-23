import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    // Controla si el modal debe estar en el DOM.
    // Lo mantenemos en el DOM un poco más después de que isOpen se vuelve false
    // para permitir la animación de salida.
    const [shouldRenderInDOM, setShouldRenderInDOM] = useState(isOpen);
    const modalOverlayRef = useRef(null); // Referencia al div del overlay del modal

    useEffect(() => {
        let animationEndTimer;

        if (isOpen) {
            // Si el modal se está abriendo:
            setShouldRenderInDOM(true); // Aseguramos que el componente esté en el DOM

            // Pequeño retraso con requestAnimationFrame para asegurar que el DOM ha actualizado
            // y luego aplicamos la clase 'active' para iniciar la animación de entrada.
            requestAnimationFrame(() => {
                if (modalOverlayRef.current) {
                    modalOverlayRef.current.classList.add('active');
                }
            });
        } else {
            // Si el modal se está cerrando:
            if (modalOverlayRef.current) {
                // Removemos la clase 'active' para iniciar la animación de salida
                modalOverlayRef.current.classList.remove('active');
            }

            // Establecemos un temporizador para desmontar el componente del DOM
            // después de que la animación de salida haya terminado (300ms del CSS).
            animationEndTimer = setTimeout(() => {
                setShouldRenderInDOM(false);
            }, 300); // <-- Coincide con la duración de la transición en .modal-overlay y .modal-content
        }

        // Función de limpieza del efecto:
        return () => {
            clearTimeout(animationEndTimer); // Limpia el temporizador si el componente se desmonta o el efecto se re-ejecuta
        };
    }, [isOpen]); // El efecto se ejecuta cada vez que isOpen cambia

    // Si no debe estar en el DOM, no renderizamos nada.
    if (!shouldRenderInDOM) {
        return null;
    }

    // Obtenemos el elemento raíz para el portal.
    const portalRoot = document.getElementById('root');
    if (!portalRoot) {
        // En un entorno de desarrollo React, esto puede ser un error crítico.
        // Asegúrate de que tu public/index.html tenga <div id="root"></div>.
        console.error("El elemento con id 'root' no se encontró en el DOM. No se puede renderizar el modal.");
        return null;
    }

    return ReactDOM.createPortal(
        <div
            className={`modal-overlay ${isOpen ? 'active' : ''}`} // <-- ¡APLICAMOS LA CLASE 'active' AQUÍ!
            ref={modalOverlayRef}
            onClick={onClose} // Permite cerrar el modal haciendo clic fuera de él
        >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button className="modal-button cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="modal-button confirm" onClick={onConfirm}>
                        Confirmar
                    </button>
                </div>
            </div>
        </div>,
        portalRoot
    );
};

export default ConfirmationModal;
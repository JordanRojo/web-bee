import React, { useEffect, useState, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import './AlertMessage.css';

const AlertMessage = ({ message, type, duration = 3000, onDismiss }) => {
    const [showAlert, setShowAlert] = useState(false);
    const nodeRef = useRef(null); // MUY IMPORTANTE: La ref para CSSTransition

    useEffect(() => {
        let dismissTimer;
        let clearMessageTimer; // Nuevo temporizador para limpiar el mensaje en el padre

        if (message) {
            // Si hay un mensaje, lo mostramos
            setShowAlert(true);

            // Temporizador para iniciar la animación de salida
            dismissTimer = setTimeout(() => {
                setShowAlert(false);
            }, duration);

            // Temporizador para limpiar el mensaje en el componente padre después de que la
            // animación de salida haya terminado. El '300' debe coincidir con el 'timeout'
            // de CSSTransition y la duración de la transición CSS.
            clearMessageTimer = setTimeout(() => {
                if (onDismiss) {
                    onDismiss();
                }
            }, duration + 300); // Duración del mensaje + duración de la animación de salida
        } else {
            // Si el mensaje está vacío, nos aseguramos de que no se muestre.
            // Esto es crucial cuando el padre limpia el mensaje a través de onDismiss.
            setShowAlert(false);
        }

        // Función de limpieza del efecto
        return () => {
            clearTimeout(dismissTimer);
            clearTimeout(clearMessageTimer); // Limpiar ambos temporizadores
        };
    }, [message, duration, onDismiss]); // Dependencias del efecto

    // Condición de renderizado:
    // Solo renderizamos el componente CSSTransition si hay un mensaje O si showAlert es true
    // (es decir, el componente está en proceso de animación de entrada o salida).
    // Esto asegura que CSSTransition tenga algo que animar.
    if (!message && !showAlert) {
        return null;
    }

    return (
        <CSSTransition
            in={showAlert} // Controla cuándo se monta/desmonta y anima
            nodeRef={nodeRef} // ¡Esto es crucial! Debe apuntar al div que CSSTransition controla
            timeout={300} // Duración total de la animación de entrada/salida (CSS)
            classNames="alert-message"
            unmountOnExit // Remueve el componente del DOM después de la animación de salida
        >
            {/* El div al que nodeRef está asociado */}
            <div className={`alert-message ${type}`} ref={nodeRef}>
                <p>{message}</p>
            </div>
        </CSSTransition>
    );
};

export default AlertMessage;
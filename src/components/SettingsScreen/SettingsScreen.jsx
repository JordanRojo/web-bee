import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCog, FaBell, FaThermometerHalf, FaWeightHanging, FaTint, FaUserCircle, FaSave, FaArrowLeft } from 'react-icons/fa';
import './SettingsScreen.css'; // Asegúrate de crear este archivo CSS

const SettingsScreen = () => {
    // Estado para los umbrales de alerta
    const [tempThreshold, setTempThreshold] = useState(38.0); // Ejemplo: Temperatura alta
    const [humidityThreshold, setHumidityThreshold] = useState(75.0); // Ejemplo: Humedad alta
    const [weightThreshold, setWeightThreshold] = useState(30.0); // Ejemplo: Peso bajo

    // Estado para las preferencias de notificación
    const [notifyTemp, setNotifyTemp] = useState(true);
    const [notifyHumidity, setNotifyHumidity] = useState(true);
    const [notifyWeight, setNotifyWeight] = useState(true);
    const [notifyActivity, setNotifyActivity] = useState(false); // Ejemplo: Actividad anormal

    // Estado para simular la carga y el guardado
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(''); // Mensajes de éxito/error

    useEffect(() => {
        // Simular carga de configuraciones existentes
        setLoading(true);
        setTimeout(() => {
            // En una aplicación real, aquí harías una llamada a la API
            // para obtener las configuraciones guardadas por el usuario.
            // Por ahora, usamos valores por defecto o simulados.
            setTempThreshold(38.5);
            setHumidityThreshold(70.0);
            setWeightThreshold(35.0);
            setNotifyTemp(true);
            setNotifyHumidity(true);
            setNotifyWeight(true);
            setNotifyActivity(false);
            setLoading(false);
        }, 500);
    }, []);

    const handleSaveChanges = (e) => {
        e.preventDefault(); // Evitar recarga de página por el formulario
        setLoading(true);
        setMessage('');

        // Simular envío de datos a una API
        setTimeout(() => {
            // En una aplicación real, aquí enviarías los estados actuales
            // a tu backend.
            console.log("Configuraciones guardadas:");
            console.log("Temperatura Máx.:", tempThreshold);
            console.log("Humedad Máx.:", humidityThreshold);
            console.log("Peso Mín.:", weightThreshold);
            console.log("Notificar Temp:", notifyTemp);
            console.log("Notificar Humedad:", notifyHumidity);
            console.log("Notificar Peso:", notifyWeight);
            console.log("Notificar Actividad:", notifyActivity);

            setMessage('¡Configuraciones guardadas con éxito!');
            setLoading(false);
            // El mensaje desaparecerá después de un tiempo
            setTimeout(() => setMessage(''), 3000);
        }, 1000);
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <p>Cargando configuraciones...</p>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="settings-screen-container">
            <nav className="settings-navbar">
                <Link to="/dashboard" className="nav-link"><FaArrowLeft /> Volver al Dashboard</Link>
                {/* Puedes añadir más enlaces aquí si es necesario */}
            </nav>
            <div className="settings-content">
                <div className="settings-header-section">
                    <FaCog className="settings-icon" />
                    <div className="settings-title-group">
                        <h1 className="settings-title">Configuración de la Aplicación</h1>
                        <p className="settings-subtitle">Gestiona tus preferencias y umbrales de alerta.</p>
                    </div>
                </div>

                {message && (
                    <div className={`message-banner ${message.includes('éxito') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSaveChanges} className="settings-form">
                    <div className="settings-section">
                        <h2 className="section-title"><FaBell /> Notificaciones y Alertas</h2>
                        <div className="form-group-grid">
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="notifyTemp"
                                    checked={notifyTemp}
                                    onChange={(e) => setNotifyTemp(e.target.checked)}
                                />
                                <label htmlFor="notifyTemp">Notificar Temperatura Anormal</label>
                            </div>
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="notifyHumidity"
                                    checked={notifyHumidity}
                                    onChange={(e) => setNotifyHumidity(e.target.checked)}
                                />
                                <label htmlFor="notifyHumidity">Notificar Humedad Anormal</label>
                            </div>
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="notifyWeight"
                                    checked={notifyWeight}
                                    onChange={(e) => setNotifyWeight(e.target.checked)}
                                />
                                <label htmlFor="notifyWeight">Notificar Variación de Peso</label>
                            </div>
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="notifyActivity"
                                    checked={notifyActivity}
                                    onChange={(e) => setNotifyActivity(e.target.checked)}
                                />
                                <label htmlFor="notifyActivity">Notificar Actividad Anormal</label>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h2 className="section-title">Umbrales de Alerta Personalizados</h2>
                        <div className="form-group-grid">
                            <div className="form-group">
                                <label htmlFor="tempThreshold"><FaThermometerHalf /> Temp. Alta (°C):</label>
                                <input
                                    type="number"
                                    id="tempThreshold"
                                    value={tempThreshold}
                                    onChange={(e) => setTempThreshold(parseFloat(e.target.value))}
                                    step="0.1"
                                    className="setting-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="humidityThreshold"><FaTint /> Humedad Alta (%):</label>
                                <input
                                    type="number"
                                    id="humidityThreshold"
                                    value={humidityThreshold}
                                    onChange={(e) => setHumidityThreshold(parseFloat(e.target.value))}
                                    step="0.1"
                                    className="setting-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="weightThreshold"><FaWeightHanging /> Peso Bajo (kg):</label>
                                <input
                                    type="number"
                                    id="weightThreshold"
                                    value={weightThreshold}
                                    onChange={(e) => setWeightThreshold(parseFloat(e.target.value))}
                                    step="0.1"
                                    className="setting-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h2 className="section-title"><FaUserCircle /> Información del Perfil</h2>
                        <p className="profile-info-text">
                            Aquí se podría integrar la edición de tu información personal o del apiario.
                            (Funcionalidad no implementada en este ejemplo, pero fácilmente expandible).
                        </p>
                        {/* Puedes añadir campos de input para nombre, ubicación, etc. */}
                    </div>

                    <button type="submit" className="save-settings-button" disabled={loading}>
                        {loading ? 'Guardando...' : <><FaSave /> Guardar Cambios</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SettingsScreen;
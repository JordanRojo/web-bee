import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaHive, FaMapMarkerAlt, FaInfoCircle, FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './HiveManagementScreen.css';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import AlertMessage from '../AlertMessage/AlertMessage'; // <-- Importa el nuevo componente

// Datos de colmenas de ejemplo (se actualizarán a medida que agreguemos/editemos)
const initialHives = [
    { id: 'h1', name: 'Colmena 001', location: 'Sector Norte, Fila A', description: 'Colmena principal, producción alta.' },
    { id: 'h2', name: 'Colmena 002', location: 'Sector Norte, Fila B', description: 'Colmena joven, crecimiento estable.' },
    { id: 'h3', name: 'Colmena 003', location: 'Sector Sur, Fila A', description: 'Colmena recientemente dividida.' },
    { id: 'h4', name: 'Colmena 004', location: 'Sector Oeste, Fila C', description: 'Colmena para investigación de comportamiento.' },
];

const HiveManagementScreen = () => {
    const [hives, setHives] = useState([]);
    const [loading, setLoading] = useState(true);
    // Cambiamos 'message' a un objeto para incluir el tipo
    const [alert, setAlert] = useState({ message: '', type: '' });
    const [showForm, setShowForm] = useState(false);
    const [editingHive, setEditingHive] = useState(null);
    const [hiveName, setHiveName] = useState('');
    const [hiveLocation, setHiveLocation] = useState('');
    const [hiveDescription, setHiveDescription] = useState('');
    const [removingHiveId, setRemovingHiveId] = useState(null);

    // Nuevos estados para el modal de confirmación
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [hiveToDelete, setHiveToDelete] = useState(null);

    const navigate = useNavigate();
    const formRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setHives(initialHives);
            setLoading(false);
        }, 500);
    }, []);

    const generateUniqueId = () => {
        return `h_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    };

    const handleSaveHive = (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ message: '', type: '' }); // Limpiar cualquier alerta previa

        const newHiveData = {
            name: hiveName,
            location: hiveLocation,
            description: hiveDescription,
        };

        setTimeout(() => {
            if (editingHive) {
                setHives(hives.map(hive =>
                    hive.id === editingHive.id ? { ...hive, ...newHiveData } : hive
                ));
                setAlert({ message: '¡Colmena actualizada con éxito!', type: 'success' }); // Usar setAlert
            } else {
                const newId = generateUniqueId();
                setHives(prevHives => [...prevHives, { id: newId, ...newHiveData }]);
                setAlert({ message: '¡Nueva colmena agregada con éxito!', type: 'success' }); // Usar setAlert
            }
            setLoading(false);
            setShowForm(false);
            resetForm();
            // No necesitamos un setTimeout aquí para borrar el mensaje, el AlertMessage lo maneja
        }, 800);
    };

    const handleEditHive = (hive) => {
        setAlert({ message: '', type: '' }); // Limpiar cualquier alerta al abrir el formulario
        setEditingHive(hive);
        setHiveName(hive.name);
        setHiveLocation(hive.location);
        setHiveDescription(hive.description);
        setShowForm(true);

        setTimeout(() => {
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    // Abre el modal de confirmación
    const confirmDeleteHive = (hiveId) => {
        setAlert({ message: '', type: '' }); // Limpiar cualquier alerta al abrir el modal de confirmación
        setHiveToDelete(hiveId);
        setIsConfirmModalOpen(true);
    };

    // Lógica para eliminar la colmena (llamada desde el modal)
    const handleActualDeleteHive = () => {
        if (hiveToDelete) {
            setLoading(true);
            setAlert({ message: '', type: '' }); // Limpiar alerta antes de la operación de eliminación
            setRemovingHiveId(hiveToDelete); // Para la animación de salida de la tarjeta

            setTimeout(() => {
                setHives(hives.filter(hive => hive.id !== hiveToDelete));
                setAlert({ message: 'Colmena eliminada con éxito.', type: 'success' }); // Usar setAlert
                setLoading(false);
                setRemovingHiveId(null);
                setHiveToDelete(null); // Limpiar el estado de la colmena a eliminar
                setIsConfirmModalOpen(false); // Cerrar el modal después de la operación
                // No necesitamos un setTimeout aquí para borrar el mensaje, el AlertMessage lo maneja
            }, 400); // Coincide con la duración de la animación CSS de la tarjeta
        }
    };

    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false); // Cierra el modal
        setHiveToDelete(null); // Limpiar el estado si se cancela
        setAlert({ message: 'Operación de eliminación cancelada.', type: 'info' }); // Mensaje de cancelación (opcional, o déjalo vacío)
    };

    const resetForm = () => {
        setEditingHive(null);
        setHiveName('');
        setHiveLocation('');
        setHiveDescription('');
    };

    const handleAddHiveClick = () => {
        setAlert({ message: '', type: '' }); // Limpiar cualquier alerta al abrir el formulario de añadir
        resetForm();
        setShowForm(true);
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    // Función para que AlertMessage pueda limpiar el estado 'alert' en el padre
    const handleDismissAlert = () => {
        setAlert({ message: '', type: '' });
    };

    if (loading && hives.length === 0) {
        return (
            <div className="loading-screen">
                <p>Cargando colmenas...</p>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="hive-management-screen-container">
            <nav className="hive-management-navbar">
                <Link to="/dashboard" className="nav-link"><FaArrowLeft /> Volver al Dashboard</Link>
            </nav>

            <div className="hive-management-content">
                <div className="hive-management-header-section">
                    <FaHive className="hive-management-icon" />
                    <div className="hive-management-title-group">
                        <h1 className="hive-management-title">Gestión de Colmenas</h1>
                        <p className="hive-management-subtitle">Añade, edita o elimina las colmenas de tu apiario.</p>
                    </div>
                    <button className="add-hive-button" onClick={handleAddHiveClick}>
                        <FaPlus /> Añadir Nueva Colmena
                    </button>
                </div>

                {/* Reemplaza el message-banner antiguo con el nuevo AlertMessage */}
                <AlertMessage
                    message={alert.message}
                    type={alert.type}
                    onDismiss={handleDismissAlert}
                />

                <CSSTransition
                    in={showForm}
                    nodeRef={formRef}
                    timeout={300}
                    classNames="hive-form"
                    unmountOnExit
                >
                    <div className="hive-form-container" ref={formRef}>
                        <h2 className="section-title">{editingHive ? 'Editar Colmena' : 'Añadir Nueva Colmena'}</h2>
                        <form onSubmit={handleSaveHive} className="hive-form">
                            <div className="form-group">
                                <label htmlFor="hiveName">Nombre de la Colmena:</label>
                                <input
                                    type="text"
                                    id="hiveName"
                                    value={hiveName}
                                    onChange={(e) => setHiveName(e.target.value)}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="hiveLocation">Ubicación:</label>
                                <input
                                    type="text"
                                    id="hiveLocation"
                                    value={hiveLocation}
                                    onChange={(e) => setHiveLocation(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="hiveDescription">Descripción:</label>
                                <textarea
                                    id="hiveDescription"
                                    value={hiveDescription}
                                    onChange={(e) => setHiveDescription(e.target.value)}
                                    rows="3"
                                    className="form-input"
                                ></textarea>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-button" disabled={loading}>
                                    {loading ? 'Guardando...' : <><FaSave /> Guardar Colmena</>}
                                </button>
                                <button type="button" className="cancel-button" onClick={() => { setShowForm(false); resetForm(); }}>
                                    <FaTimes /> Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </CSSTransition>

                <div className="hive-list-section">
                    <h2 className="section-title">Tus Colmenas Registradas</h2>
                    {hives.length === 0 && !showForm ? (
                        <p className="no-hives-message">No tienes colmenas registradas. ¡Añade una!</p>
                    ) : (
                        <TransitionGroup className="hive-cards-grid">
                            {hives.map(hive => (
                                <CSSTransition
                                    key={hive.id}
                                    timeout={400}
                                    classNames={{
                                        exit: 'removing',
                                        enter: 'added'
                                    }}
                                    nodeRef={React.createRef()}
                                >
                                    <div
                                        className={`hive-card ${removingHiveId === hive.id ? 'removing' : ''}`}
                                        ref={React.createRef()}
                                    >
                                        <h3><FaHive /> {hive.name}</h3>
                                        <p><FaMapMarkerAlt /> Ubicación: {hive.location}</p>
                                        <p><FaInfoCircle /> Descripción: {hive.description}</p>
                                        <div className="hive-card-actions">
                                            <button className="edit-button" onClick={() => handleEditHive(hive)}>
                                                <FaEdit /> Editar
                                            </button>
                                            <button className="delete-button" onClick={() => confirmDeleteHive(hive.id)}>
                                                <FaTrash /> Eliminar
                                            </button>
                                        </div>
                                        <Link to={`/colmena/${hive.id}`} className="view-detail-link">Ver Detalles</Link>
                                    </div>
                                </CSSTransition>
                            ))}
                        </TransitionGroup>
                    )}
                </div>
            </div>

            {/* Agrega el componente ConfirmationModal aquí */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleActualDeleteHive}
                title="Confirmar Eliminación"
                message={
                    hiveToDelete ?
                    `Estás a punto de eliminar la colmena "${hives.find(h => h.id === hiveToDelete)?.name}". Esta acción es irreversible.` :
                    "¿Estás seguro de que quieres eliminar este elemento? Esta acción es irreversible."
                }
            />
        </div>
    );
};

export default HiveManagementScreen;
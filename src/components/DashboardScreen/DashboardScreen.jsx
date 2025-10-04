// src/components/DashboardScreen/DashboardScreen.jsx

import React, { useState, useEffect, useContext, useMemo, useRef } from "react"; // 🟢 IMPORTAR useRef
import "./DashboardScreen.css";
import {
  FaHive,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBell,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { GiBee } from "react-icons/gi";
import {
  MdOutlineThermostat,
  MdOutlineWaterDrop,
  MdOutlineScale,
  MdAnalytics,
} from "react-icons/md";
import { Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../../context/AuthProvider";
import { API_URL } from "../../helpers/apiURL";

// --- Componente re-utilizable: ColonySummaryCard (Sin cambios) ---
const ColonySummaryCard = ({
  name,
  id,
  status,
  temperature,
  humidity,
  weight,
  hasAlerts,
}) => {
  let statusClass = "colony-status-ok";
  let statusText = "Saludable";
  let statusIcon = <FaCheckCircle className="status-icon" />;

  switch (status) {
    case "ALERT":
    case "CRITICAL":
      statusClass = status === "ALERT" ? "colony-status-alert" : "colony-status-critical";
      statusText = status === "ALERT" ? "Alerta" : "Crítico";
      statusIcon = <FaExclamationTriangle className="status-icon" />;
      break;
    default:
      break;
  }

  const formatSensorData = (data, unit) => {
    return (data !== undefined && data !== null && !isNaN(Number(data)))
      ? `${Number(data).toFixed(1)} ${unit}`
      : `-- ${unit}`;
  };

  return (
    <Link to={`/colmena/${id}`} className="colony-card-link">
      <div className={`colony-summary-card ${statusClass}`}>
        <div className="card-header">
          <FaHive className="hive-icon" />
          <h3 className="colony-name">{name}</h3>
          {hasAlerts && <FaBell className="alert-bell-icon" />}
        </div>
        <div className="card-body">
          <div className="status-display">
            {statusIcon}
            <span className="status-text">Estado: {statusText}</span>
          </div>
          <div className="metrics-summary">
            <div className="metric-item">
              <MdOutlineThermostat />
              <span>{formatSensorData(temperature, '°C')}</span>
            </div>
            <div className="metric-item">
              <MdOutlineWaterDrop />
              <span>{formatSensorData(humidity, '%')}</span>
            </div>
            <div className="metric-item">
              <MdOutlineScale />
              <span>{formatSensorData(weight, 'kg')}</span>
            </div>
          </div>
          <p className="last-updated">Última actualización: hace 5 min</p>
        </div>
      </div>
    </Link>
  );
};

// --- Componente principal: DashboardScreen ---
const DashboardScreen = () => {
  const [colmenas, setColmenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { config } = useContext(AuthContext);

  const POLLING_INTERVAL = 3000;
  
  // CREAR LA REFERENCIA
  const coloniesSectionRef = useRef(null); 

  // Cálculo de resúmenes (Sin cambios)
  const { totalColonies, okColonies, alertColonies, activeAlertsCount } = useMemo(() => {
    const total = colmenas.length;
    const ok = colmenas.filter((c) => c.status === "OK").length;
    const alert = colmenas.filter(
      (c) => c.status === "ALERT" || c.status === "CRITICAL"
    ).length;
    const activeAlerts = colmenas.filter((c) => c.hasAlerts).length;

    return {
      totalColonies: total,
      okColonies: ok,
      alertColonies: alert,
      activeAlertsCount: activeAlerts,
    };
  }, [colmenas]);

  // Función auxiliar para restaurar el scroll
  const restoreScrollPosition = () => {
    // Solo restauramos el scroll si la referencia existe 
    // y el usuario ha hecho scroll (window.scrollY > 0)
    if (coloniesSectionRef.current && window.scrollY > 50) { // Usamos 50px como umbral
        // Obtenemos la posición de la sección respecto a la parte superior de la página
        const yOffset = coloniesSectionRef.current.getBoundingClientRect().top + window.scrollY;
        
        // Mover el scroll de forma suave (si el navegador lo soporta)
        window.scrollTo({ top: yOffset - 80, behavior: 'smooth' }); // Restamos 80px para dejar espacio
    }
  };

  // Lógica de Polling
  useEffect(() => {
    // Usamos una variable para rastrear la carga inicial
    let initialLoadComplete = false; 
    
    // Función para fetch de datos
    const fetchColmenas = async () => {
        try {
            const response = await axios.get(`${API_URL}/colmenas/obtener-todas-colmenas`, config);
            if (response.status === 200) {
                setColmenas(response.data);
                
                // Restaurar el scroll DESPUÉS de actualizar los datos, 
                // pero SÓLO si la carga inicial ya se completó.
                if (initialLoadComplete) {
                    restoreScrollPosition();
                }
            } else if (response.status === 204) {
                setColmenas([]);
            }
        } catch (error) {
            console.error("Error al obtener colmenas: ", error);
        } finally {
            if (!initialLoadComplete) {
                setLoading(false);
                initialLoadComplete = true; // Marcamos la carga inicial como completa
            }
        }
    };

    // Carga INICIAL
    fetchColmenas();

    // POLLING: Configura el intervalo
    const intervalId = setInterval(fetchColmenas, POLLING_INTERVAL);

    // LIMPIEZA
    return () => clearInterval(intervalId);

  }, [config]);

  // Mostrar pantalla de carga (solo se activa al inicio)
  if (loading) {
    return (
      <div className="loading-screen">
        <p>Cargando Dashboard...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-screen-container">
      <nav className="dashboard-navbar">
        <div className="navbar-logo">
          <GiBee className="nav-bee-icon" />
          <span>Monitor Beehive</span>
        </div>
        <div className="navbar-links">
          <Link to="/reports" className="nav-link">
            <FaFileAlt /> Reportes
          </Link>
          <Link to="/settings" className="nav-link">
            <FaCog /> Configuración
          </Link>
          <Link to="/hives" className="nav-link">
            <FaHive /> Gestionar Colmenas
          </Link>
          <Link to="/logout" className="nav-link logout-link">
            <FaSignOutAlt /> Cerrar Sesión
          </Link>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1 className="dashboard-title">Resumen del Colmenar</h1>

        <div className="global-summary-widgets">
          <div className="summary-widget total">
            <MdAnalytics className="widget-icon" />
            <span className="widget-value">{totalColonies}</span>
            <span className="widget-label">Colmenas Totales</span>
          </div>
          <div className="summary-widget ok">
            <FaCheckCircle className="widget-icon" />
            <span className="widget-value">{okColonies}</span>
            <span className="widget-label">Saludables</span>
          </div>
          <div className="summary-widget alert">
            <FaExclamationTriangle className="widget-icon" />
            <span className="widget-value">{alertColonies}</span>
            <span className="widget-label">En Alerta</span>
          </div>
          <Link to="/alerts" className="summary-widget alerts-link">
            <FaBell className="widget-icon" />
            <span className="widget-value">{activeAlertsCount}</span>
            <span className="widget-label">Alertas Activas</span>
          </Link>
        </div>

        {/* ASIGNAR LA REFERENCIA AL ENCABEZADO DE LA SECCIÓN */}
        <h2 className="section-title" ref={coloniesSectionRef}>Mis Colmenas</h2>
        <div className="colonies-grid">
          {colmenas.length === 0 ? (
            <div className="no-colmenas-message">
              <p>No tienes colmenas registradas. <Link to="/hives">¡Añade una ahora!</Link></p>
            </div>
          ) : (
            colmenas.map((colmena) => (
              <ColonySummaryCard
                key={colmena._id}
                id={colmena.colmena_id}
                name={colmena.nombre_colmena}
                status={colmena.status || "OK"}
                temperature={colmena.temperatura}
                humidity={colmena.humedad}
                weight={colmena.peso}
                hasAlerts={colmena.hasAlerts || false}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
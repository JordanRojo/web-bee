// src/components/DashboardScreen/DashboardScreen.jsx
import React, { useState, useEffect, useContext } from "react";
import "./DashboardScreen.css";
import {
  FaHive,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBell,
  FaFileAlt, // Nuevo: Para Reportes
  FaCog, // Nuevo: Para Configuración
  FaSignOutAlt, // Nuevo: Para Cerrar Sesión
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

// --- Componente re-utilizable: ColonySummaryCard ---
const ColonySummaryCard = ({
  name,
  id,
  status,
  temperature,
  humidity,
  weight,
  hasAlerts,
}) => {
  let statusClass = "";
  let statusText = "";
  let statusIcon = null;
  // switch (status) {
  //   case "OK":
  //     statusClass = "colony-status-ok";
  //     statusText = "Saludable";
  //     statusIcon = <FaCheckCircle className="status-icon" />;
  //     break;
  //   case "ALERT":
  //     statusClass = "colony-status-alert";
  //     statusText = "Alerta";
  //     statusIcon = <FaExclamationTriangle className="status-icon" />;
  //     break;
  //   case "CRITICAL":
  //     statusClass = "colony-status-critical";
  //     statusText = "Crítico";
  //     statusIcon = <FaExclamationTriangle className="status-icon" />;
  //     break;
  //   default:
  //     statusClass = "colony-status-unknown";
  //     statusText = "Desconocido";
  //     statusIcon = <FaExclamationTriangle className="status-icon" />;
  // }

  return (
    <Link to={`/colmena/${id}`} className="colony-card-link">
      <div className={`colony-summary-card`}>
        <div className="card-header">
          <FaHive className="hive-icon" />
          <h3 className="colony-name">{name}</h3>
          {/* {hasAlerts && <FaBell className="alert-bell-icon" />} */}
        </div>
        <div className="card-body">
          <div className="status-display">
            {statusIcon}
            <span className="status-text">Estado: {statusText}</span>
          </div>
          <div className="metrics-summary">
            <div className="metric-item">
              <MdOutlineThermostat />
              <span>{temperature}°C</span>
            </div>
            <div className="metric-item">
              <MdOutlineWaterDrop />
              <span>{humidity}%</span>
            </div>
            <div className="metric-item">
              <MdOutlineScale />
              <span>{weight} kg</span>
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
  const sampleColonies = [
    {
      id: "h1",
      name: "Colmena 001",
      status: "OK",
      temperature: 35,
      humidity: 60,
      weight: 45,
      hasAlerts: false,
    },
    {
      id: "h2",
      name: "Colmena 002",
      status: "ALERT",
      temperature: 38,
      humidity: 75,
      weight: 42,
      hasAlerts: true,
    },
    {
      id: "h3",
      name: "Colmena 003",
      status: "OK",
      temperature: 34,
      humidity: 58,
      weight: 50,
      hasAlerts: false,
    },
    {
      id: "h4",
      name: "Colmena 004",
      status: "CRITICAL",
      temperature: 40,
      humidity: 80,
      weight: 38,
      hasAlerts: true,
    },
    {
      id: "h5",
      name: "Colmena 005",
      status: "OK",
      temperature: 36,
      humidity: 62,
      weight: 48,
      hasAlerts: false,
    },
    {
      id: "h6",
      name: "Colmena 006",
      status: "ALERT",
      temperature: 37,
      humidity: 68,
      weight: 40,
      hasAlerts: true,
    },
    {
      id: "h7",
      name: "Colmena 007",
      status: "OK",
      temperature: 35,
      humidity: 61,
      weight: 46,
      hasAlerts: false,
    },
    {
      id: "h8",
      name: "Colmena 008",
      status: "ALERT",
      temperature: 39,
      humidity: 72,
      weight: 41,
      hasAlerts: true,
    },
  ];

  const totalColonies = sampleColonies.length;
  const okColonies = sampleColonies.filter((c) => c.status === "OK").length;
  const alertColonies = sampleColonies.filter(
    (c) => c.status === "ALERT" || c.status === "CRITICAL"
  ).length;
  const activeAlertsCount = sampleColonies.filter((c) => c.hasAlerts).length;
  const [colmenas, setColmenas] = useState([]);
  const { config, userId } = useContext(AuthContext);

  useEffect(() => {
    const getColmenas = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/colmenas/obtener-colmenas/${userId}`,
          config
        );
        if (response.status === 200) {
          setColmenas(response.data);
        } else if (response.status === 204) {
          alert("No hay colmenas registradas en la base de datos.");
        }
      } catch (error) {
        console.error("Error: ", error);
      }
    };
    getColmenas();
  }, [config]);

  return (
    <div className="dashboard-screen-container">
      <nav className="dashboard-navbar">
        <div className="navbar-logo">
          <GiBee className="nav-bee-icon" />
          <span>Monitor Beehive</span>
        </div>
        <div className="navbar-links">
          {/* Íconos añadidos a cada Link */}
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

      {/* Aquí el div dashboard-content será el que tenga el scroll */}
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

        <h2 className="section-title">Mis Colmenas</h2>
        <div className="colonies-grid">
          {colmenas.map((colmena) => (
            <ColonySummaryCard
              key={colmena._id}
              id={colmena.colmena_id}
              name={colmena.nombre_colmena}
              // status={colmena.status}
              temperature={colmena.temperatura}
              humidity={colmena.humedad}
              weight={colmena.peso}
              // hasAlerts={colmena.hasAlerts}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;

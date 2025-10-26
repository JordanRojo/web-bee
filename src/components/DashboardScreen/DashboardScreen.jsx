import React, { useState, useEffect, useContext, useMemo } from "react";
import "./DashboardScreen.css";
import {
  FaHive,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBell,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaTimes, // Ícono para cerrar el modal
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
// Importaciones de Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Componente re-utilizable: ColonySummaryCard (MODIFICADO) ---
const ColonySummaryCard = ({
  name,
  id,
  temperature,
  humidity,
  weight,
  lastUpdated, // <-- Nueva Propiedad
}) => {
  return (
    <Link to={`/colmena/${id}`} className="colony-card-link">
      <div className={`colony-summary-card`}>
        <div className="card-header">
          <FaHive className="hive-icon" />
          <h3 className="colony-name">{name}</h3>
        </div>
        <div className="card-body">
          <div className="status-display">
            <span className="status-text">Datos Recientes</span>
          </div>
          <div className="metrics-summary">
            <div className="metric-item">
              <MdOutlineThermostat />
              <span>{temperature ? temperature.toFixed(1) : 'N/A'}°C</span> 
            </div>
            <div className="metric-item">
              <MdOutlineWaterDrop />
              <span>{humidity ? humidity.toFixed(1) : 'N/A'}%</span>
            </div>
            <div className="metric-item">
              <MdOutlineScale />
              <span>{weight ? weight.toFixed(1) : 'N/A'} kg</span>
            </div>
          </div>
          {/* Aquí se muestra la hora de la última actualización */}
          <p className="last-updated">Actualizado: {lastUpdated}</p>
        </div>
      </div>
    </Link>
  );
};

// --- Helper para formatear datos para el gráfico y calcular el promedio (Sin cambios) ---
const formatDataForChart = (colmenas) => {
  if (!colmenas || colmenas.length === 0) return [];

  return colmenas.map((colmena) => ({
    name: colmena.nombre_colmena,
    Temperatura: colmena.temperatura || 0,
    Humedad: colmena.humedad || 0,
    Peso: colmena.peso || 0,
  }));
};

// --- Componente principal: DashboardScreen ---
const DashboardScreen = () => {
  const [colmenas, setColmenas] = useState([]);
  const { config, userId } = useContext(AuthContext);
  const [loading, setLoading] = useState(false); 
  
  // NUEVO ESTADO: Almacena la hora de la última actualización
  const [lastUpdatedTime, setLastUpdatedTime] = useState("N/A"); 

  // --- ESTADOS PARA LOS MODALES (Sin cambios) ---
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [activeAlertsData, setActiveAlertsData] = useState([]); 
  // ------------------------------------
  
  // --- FUNCIÓN CENTRAL DE CARGA DE DATOS (MODIFICADO) ---
  const getColmenas = async (isInitialLoad = false) => {
    if (isInitialLoad) {
        setLoading(true);
    }
    
    try {
      const response = await axios.get(
        `${API_URL}/colmenas/obtener-colmenas/${userId}`,
        config
      );
      if (response.status === 200) {
        setColmenas(response.data);
        // Almacena la hora actual al cargar los datos con éxito
        setLastUpdatedTime(new Date().toLocaleTimeString()); 
      } else if (response.status === 204) {
        console.log("No hay colmenas registradas en la base de datos.");
        setColmenas([]);
      }
    } catch (error) {
      console.error("Error al obtener colmenas: ", error);
    } finally {
        if (isInitialLoad) {
            setLoading(false);
        }
    }
  };

  // --- LÓGICA DE SIMULACIÓN DE ALERTAS (Sin cambios) ---
  const allAlertsData = useMemo(() => {
    return colmenas
      .map(colmena => {
        let alerts = [];
        if (colmena.temperatura < 30 || colmena.temperatura > 38) {
            alerts.push({ type: 'Temperatura Extrema', value: colmena.temperatura + '°C', severity: 'High' });
        }
        if (colmena.humedad < 50 || colmena.humedad > 75) {
            alerts.push({ type: 'Humedad Anormal', value: colmena.humedad + '%', severity: 'Medium' });
        }
        if (colmena.peso < 40) {
            alerts.push({ type: 'Peso Bajo', value: colmena.peso + 'kg', severity: 'Low' });
        }

        return {
            id: colmena.colmena_id,
            name: colmena.nombre_colmena,
            alerts: alerts,
        };
      })
      .filter(c => c.alerts.length > 0);
  }, [colmenas]);

  useEffect(() => {
    const activeAlerts = allAlertsData.filter(c => c.alerts.length > 0);
    setActiveAlertsData(activeAlerts);
  }, [allAlertsData]);
  // --------------------------------------------------------

  // --- EFECTO de Carga Inicial y Actualización Automática (Sin cambios) ---
  useEffect(() => {
    if (userId) {
        getColmenas(true); // Carga Inicial
        
        const intervalId = setInterval(() => {
            getColmenas(false); // Polling cada 3 segundos
        }, 3000); 

        return () => clearInterval(intervalId);
    }
  }, [config, userId]); 

  // --- Cálculos de Resumen y Promedios (Sin cambios) ---
  const totalColonies = colmenas.length;
  const okColonies = colmenas.filter(c => 
  		!(c.temperatura < 30 || c.temperatura > 38) &&
  		!(c.humedad < 50 || c.humedad > 75) &&
  		!(c.peso < 40)
  ).length; 

  const alertColonies = totalColonies - okColonies; 
  const activeAlertsCount = activeAlertsData.reduce((sum, colmena) => sum + colmena.alerts.length, 0);

  const { avgTemp, avgHum, avgWeight } = useMemo(() => {
    if (totalColonies === 0) return { avgTemp: 0, avgHum: 0, avgWeight: 0 };
    
    const totalTemp = colmenas.reduce((sum, c) => sum + (c.temperatura || 0), 0);
    const totalHum = colmenas.reduce((sum, c) => sum + (c.humedad || 0), 0);
    const totalWeight = colmenas.reduce((sum, c) => sum + (c.peso || 0), 0);

    return {
      avgTemp: totalTemp / totalColonies,
      avgHum: totalHum / totalColonies,
      avgWeight: totalWeight / totalColonies,
    };
  }, [colmenas, totalColonies]);

  const chartData = formatDataForChart(colmenas);
  // ----------------------------------------

  // --- Funciones de Modales (Sin cambios) ---
  const openChartModal = () => {
    if (colmenas.length > 0) {
        setIsChartModalOpen(true);
    } else {
        alert("No hay datos de colmenas cargados para mostrar el gráfico.");
    }
  };

  const closeChartModal = () => {
    setIsChartModalOpen(false);
  };

  const openAlertsModal = () => {
    if (activeAlertsCount > 0) {
        setIsAlertsModalOpen(true);
    } else {
        alert("No hay alertas activas.");
    }
  };

  const closeAlertsModal = () => {
    setIsAlertsModalOpen(false);
  };
  // -----------------------------

  if (loading) {
    return (
        <div className="dashboard-loading-container">
            <GiBee className="loading-bee" size={50} color="#ff9800" />
            <p>Cargando datos iniciales...</p>
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
        
        {/* Párrafo de actualización global ELIMINADO */}
        
        <div className="global-summary-widgets">
            {/* WIDGETS (Sin cambios) */}
            <button 
                onClick={openChartModal} 
                className="summary-widget total button-as-widget"
            >
                <MdAnalytics className="widget-icon" />
                <span className="widget-value">{totalColonies}</span>
                <span className="widget-label">Colmenas Totales</span>
            </button>
            
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
            
            <button 
                onClick={openAlertsModal} 
                className="summary-widget alerts-link button-as-widget"
            >
                <FaBell className="widget-icon" />
                <span className="widget-value">{activeAlertsCount}</span>
                <span className="widget-label">Alertas Activas</span>
            </button>
        </div>

        <h2 className="section-title">Mis Colmenas</h2>
        <div className="colonies-grid">
          {colmenas.map((colmena) => (
            <ColonySummaryCard
              key={colmena.colmena_id}
              id={colmena.colmena_id}
              name={colmena.nombre_colmena}
              temperature={colmena.temperatura}
              humidity={colmena.humedad}
              weight={colmena.peso}
              lastUpdated={lastUpdatedTime} // <-- Propiedad enviada aquí
            />
          ))}
        </div>
      </div>

      {/* --- MODALES (Sin cambios) --- */}
      {isChartModalOpen && (
          <div className="chart-modal-overlay" onClick={closeChartModal}>
            {/* ... Contenido del Chart Modal ... */}
            <div 
              className="chart-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close-button" onClick={closeChartModal}>
                <FaTimes />
              </button>
              <h2 className="modal-title-chart">
                <MdAnalytics /> Análisis Comparativo Global
              </h2>
              <p className="modal-subtitle-chart">
                Comparación de métricas: {colmenas.length} Colmenas
              </p>
              
              <div className="average-metrics-display">
                  <div className="avg-item">
                      <MdOutlineThermostat /> **Temp. Promedio:** <span>{avgTemp.toFixed(1)}°C</span>
                  </div>
                  <div className="avg-item">
                      <MdOutlineWaterDrop /> **Hum. Promedio:** <span>{avgHum.toFixed(1)}%</span>
                  </div>
                  <div className="avg-item">
                      <MdOutlineScale /> **Peso Promedio:** <span>{avgWeight.toFixed(1)} kg</span>
                  </div>
              </div>
              
              <div className="modal-chart-area">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="95%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                      <XAxis 
                        dataKey="name" 
                        interval={0} 
                        angle={-45} 
                        textAnchor="end" 
                        height={80} 
                        style={{ fontSize: '10px' }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [`${value.toFixed(1)} ${name === 'Peso' ? 'kg' : name === 'Humedad' ? '%' : '°C'}`, name]}
                        contentStyle={{ borderRadius: '8px', border: 'none' }}
                      />
                      <Legend layout="horizontal" verticalAlign="top" align="center" wrapperStyle={{ paddingTop: '10px' }}/>
                      <Bar dataKey="Temperatura" fill="#ff9800" />
                      <Bar dataKey="Humedad" fill="#2196f3" />
                      <Bar dataKey="Peso" fill="#4caf50" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="modal-no-data">No hay datos disponibles para graficar.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {isAlertsModalOpen && (
          <div className="alerts-modal-overlay" onClick={closeAlertsModal}>
            <div 
              className="alerts-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close-button" onClick={closeAlertsModal}>
                <FaTimes />
              </button>
              <h2 className="modal-title-alerts">
                <FaBell /> Alertas Activas ({activeAlertsCount} Total)
              </h2>
              <p className="modal-subtitle-alerts">
                Revisa los parámetros fuera de rango en tus colmenas.
              </p>
              
              <div className="alerts-list-container">
                {activeAlertsData.length > 0 ? (
                  activeAlertsData.map(colmenaAlert => (
                    <div key={colmenaAlert.id} className="colmena-alerts-group">
                      <h3 className="colmena-alert-name">
                          <FaHive /> **{colmenaAlert.name}**
                          <span className="alert-count-tag">{colmenaAlert.alerts.length} alertas</span>
                      </h3>
                      <div className="alert-items-grid">
                        {colmenaAlert.alerts.map((alert, index) => (
                          <div key={index} className={`alert-item-card alert-${alert.severity.toLowerCase()}`}>
                            <div className="card-severity-icon">
                              <FaExclamationTriangle />
                            </div>
                            <div className="card-details">
                              <span className="card-alert-type">**{alert.type}**</span>
                              <span className="card-alert-value">Valor: {alert.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {activeAlertsData.indexOf(colmenaAlert) < activeAlertsData.length - 1 && (
                          <hr className="colmena-separator"/>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="modal-no-data">¡Felicidades! No hay alertas activas en este momento.</p>
                )}
              </div>
            </div>
          </div>
        )}
      {/* --- FIN MODALES --- */}
    </div>
  );
};

export default DashboardScreen;
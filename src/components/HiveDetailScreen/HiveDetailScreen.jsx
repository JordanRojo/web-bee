import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaHive,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBell,
  FaCalendarAlt,
  FaThermometerHalf,
  FaTint,
  FaWeightHanging,
  FaFileAlt,
  FaCog,
  FaTimes,
  FaTimesCircle,
  FaDownload,
} from "react-icons/fa";
import {
  MdOutlineThermostat,
  MdOutlineWaterDrop,
  MdOutlineScale,
  MdAccessTime,
} from "react-icons/md";
import { GiBee } from "react-icons/gi";
import "./HiveDetailScreen.css";
import axios from "axios";
import { API_URL } from "../../helpers/apiURL";
import AuthContext from "../../context/AuthProvider";
import convierteFecha from "../../helpers/convierteFecha";

// NOTA: Se ha omitido la definición de `sampleHiveData` por brevedad,
// pero asumo que existe en tu archivo original.

const HiveDetailScreen = () => {
  const { hiveId } = useParams();
  const [hive, setHive] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [filterAlerts, setFilterAlerts] = useState("active");
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [alertasColmena, setAlertasColmena] = useState([]);
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);
  const [selectedSensorData, setSelectedSensorData] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageModalUrl, setCurrentImageModalUrl] = useState("");
  const [sensoresPorDia, setSensoresPorDia] = useState([]);
  const { config, userId } = useContext(AuthContext);

  // --- Funciones de Fetching ---

  // Obtiene los datos de la colmena y las métricas actuales
  const fetchCurrentMetrics = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/colmenas/obtener-colmena-particular/${hiveId}`,
        config
      );
      if (response.status === 200 && response.data && response.data.length > 0) {
        // Actualizamos el estado, manteniendo los datos si ya existen
        setHive((prevHive) => ({
          ...(prevHive || {}), 
          ...response.data[0], 
        }));
        setLastSyncTime(Date.now());
      } else {
        console.log("Colmena no encontrada o error en la respuesta de métricas.");
        // Si no se encuentra, mantenemos el estado anterior si existe
      }
    } catch (error) {
      console.error("ERROR al obtener métricas actuales: ", error);
    }
  };

  // Obtiene las alertas
  const fetchAlerts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/alertas/obtener-alertas-particular/${hiveId}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (response.status === 200) {
        setAlertasColmena(response.data);
      } else if (response.status === 204) {
        setAlertasColmena([]);
      }
    } catch (error) {
      console.error("ERROR al obtener alertas: ", error);
    }
  };

  // Obtiene los datos históricos (generalmente no necesita refresh rápido)
  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/sensores/obtener-historial-diario/${hiveId}`,
        config
      );
      if (response.status === 200) {
        setSensoresPorDia(response.data);
      } else if (response.status === 204) {
        setSensoresPorDia([]);
      }
    } catch (error) {
      console.error("ERROR:", error);
    }
  };

  // --- EFECTO 1: Carga Inicial de TODOS los datos ---
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchCurrentMetrics();
      await fetchAlerts();
      await fetchHistoricalData();
    };

    if (hiveId) {
      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiveId, config]);


  // --- EFECTO 2: Refresco de Métricas y Alertas cada 3 segundos ---
  useEffect(() => {
    if (!hiveId) return;

    // Configura el intervalo de actualización (3000ms = 3 segundos)
    const intervalId = setInterval(() => {
      // Solo actualizamos las métricas actuales y las alertas
      fetchCurrentMetrics();
      fetchAlerts();
      console.log(`Datos actualizados automáticamente para ${hiveId}`);
    }, 3000); 

    // Función de limpieza: se ejecuta al desmontar el componente o antes de un nuevo render.
    return () => {
      clearInterval(intervalId);
      console.log("Intervalo de refresco automático detenido.");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiveId, config]);


  // --- Lógica y Helpers (Sin cambios funcionales, solo reorganizados) ---
  const temperaturaHistorial = sensoresPorDia.map((item) => ({
    name: convierteFecha(item.fecha),
    value: item.temperatura_promedio,
  }));

  const humedadHistorial = sensoresPorDia.map((item) => ({
    name: convierteFecha(item.fecha),
    value: item.humedad_promedio,
  }));

  const pesoHistorial = sensoresPorDia.map((item) => ({
    name: convierteFecha(item.fecha),
    value: item.peso_promedio,
  }));

  const openImageModal = (imageUrl) => {
    setCurrentImageModalUrl(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setCurrentImageModalUrl("");
  };

  const closeSensorModal = () => {
    setIsSensorModalOpen(false);
    setSelectedSensorData(null);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "OK":
        return "status-ok";
      case "ALERT":
        return "status-alert";
      case "CRITICAL":
        return "status-critical";
      default:
        return "status-unknown";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "OK":
        return "Saludable";
      case "ALERT":
        return "Alerta";
      case "CRITICAL":
        return "Crítico";
      default:
        return "Desconocido";
    }
  };

  const getMetricStatus = (metricType, value) => {
    // ... (El cuerpo de esta función se mantiene sin cambios)
    switch (metricType) {
      case "temperature":
        if (value >= 32 && value <= 36)
          return { status: "ok", icon: <FaCheckCircle />, label: "Normal" };
        if ((value >= 30 && value < 32) || (value > 36 && value <= 38))
          return {
            status: "alert",
            icon: <FaExclamationTriangle />,
            label: "Alerta",
          };
        if (value < 30 || value > 38)
          return {
            status: "critical",
            icon: <FaTimesCircle />,
            label: "Crítico",
          };
        return { status: "unknown", icon: null, label: "Desconocido" };

      case "humidity":
        if (value >= 50 && value <= 70)
          return { status: "ok", icon: <FaCheckCircle />, label: "Normal" };
        if ((value >= 40 && value < 50) || (value > 70 && value <= 75))
          return {
            status: "alert",
            icon: <FaExclamationTriangle />,
            label: "Alerta",
          };
        if (value < 40 || value > 75)
          return {
            status: "critical",
            icon: <FaTimesCircle />,
            label: "Crítico",
          };
        return { status: "unknown", icon: null, label: "Desconocido" };

      case "weight":
        if (value > 40)
          return { status: "ok", icon: <FaCheckCircle />, label: "Normal" };
        if (value >= 30 && value <= 40)
          return {
            status: "alert",
            icon: <FaExclamationTriangle />,
            label: "Alerta",
          };
        if (value < 30)
          return {
            status: "critical",
            icon: <FaTimesCircle />,
            label: "Crítico",
          };
        return { status: "unknown", icon: null, label: "Desconocido" };

      case "queenStatus":
        if (value === "Activa")
          return { status: "ok", icon: <GiBee />, label: "Activa" };
        return {
          status: "alert",
          icon: <FaExclamationTriangle />,
          label: "Alerta",
        };
      default:
        return { status: "unknown", icon: null, label: "Desconocido" };
    }
  };


  const formatLastSyncTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const now = Date.now();
    const diffSeconds = Math.floor((now - timestamp) / 1000);

    if (diffSeconds < 60) {
      return `hace ${diffSeconds} segundo${diffSeconds === 1 ? "" : "s"}`;
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      return `hace ${minutes} minuto${minutes === 1 ? "" : "s"}`;
    } else if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return `hace ${hours} hora${hours === 1 ? "" : "s"}`;
    } else {
      const days = Math.floor(diffSeconds / 86400);
      return `hace ${days} día${days === 1 ? "" : "s"}`;
    }
  };

  const openSensorModal = (sensorType) => {
    // ... (El cuerpo de esta función se mantiene sin cambios)
    const sensorDetails = {
      temperature: {
        title: "Temperatura Diaria",
        dataKey: "temp",
        unit: "°C",
        icon: <FaThermometerHalf className="modal-icon" />,
      },
      humidity: {
        title: "Humedad Diaria",
        dataKey: "humidity",
        unit: "%",
        icon: <FaTint className="modal-icon" />,
      },
      weight: {
        title: "Peso Diario",
        dataKey: "weight",
        unit: " kg",
        icon: <FaWeightHanging className="modal-icon" />,
      },
    };

    // Usaremos los datos históricos de ejemplo, ya que tu backend solo devuelve promedios diarios
    const historicalDataToDisplay =
      sampleHiveData[hiveId]?.historicalData || [];

    const enhancedData = historicalDataToDisplay.map((record) => ({
      ...record,
      statusInfo: getMetricStatus(
        sensorType,
        record[sensorDetails[sensorType].dataKey]
      ),
    }));

    setSelectedSensorData({
      ...sensorDetails[sensorType],
      historicalData: enhancedData,
    });
    setIsSensorModalOpen(true);
  };

  if (!hive) {
    return (
      <div className="loading-screen">
        <p>Cargando detalles de la colmena...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  const descargarReporte = async (hiveId) => {
    console.log(config.headers);
    try {
      const response = await axios.get(
        `${API_URL}/reportes/obtener-reporte/${hiveId}/${userId}`,
        {
          responseType: "blob", // Important for binary data
          headers: config.headers,
        }
      );
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `reporte_colmena_${hiveId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(
        "No se pudo descargar el reporte. " +
          (error.response?.data?.message || "")
      );
      console.error(error);
    }
  };

  // Se calculan los estados de las métricas después de la carga inicial/refresco
  const tempStatus = getMetricStatus("temperature", hive.temperatura);
  const humidityStatus = getMetricStatus("humidity", hive.humedad);
  const weightStatus = getMetricStatus("weight", hive.peso);
  const queenStatusInfo = getMetricStatus("queenStatus", hive.sonido);

  const getFilteredAlerts = () => {
    if (filterAlerts === "active") {
      return alertasColmena.filter(
        (alerta) => alerta.estado_alerta === "pendiente"
      );
    } else if (filterAlerts === "resolved") {
      return alertasColmena.filter(
        (alerta) => alerta.estado_alerta === "resuelta"
      );
    }
    return alertasColmena;
  };

  return (
    <div className="hive-detail-screen-container">
      <nav className="detail-navbar">
        <div className="navbar-logo">
          <GiBee className="nav-bee-icon" />
          <span>Monitor Beehive</span>
        </div>
        <div className="navbar-links">
          <Link to="/dashboard" className="nav-link">
            <FaArrowLeft /> Volver al Dashboard
          </Link>
          <Link to="/reports" className="nav-link">
            <FaFileAlt /> Reportes
          </Link>
          <Link to="/settings" className="nav-link">
            <FaCog /> Configuración
          </Link>
        </div>
      </nav>

      <div className="detail-content">
        <div className="hive-header-section">
          <div className="hive-header-info">
            {hive.foto_colmena_url && (
              <img
                src={hive.foto_colmena_url}
                alt={`Imagen de ${hive.nombre_colmena}`}
                className="hive-detail-image"
                onClick={() => openImageModal(hive.foto_colmena_url)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/150x150/CCCCCC/000000?text=No+Image";
                }}
              />
            )}
            <FaHive className="hive-detail-icon" />
            <div className="hive-title-group">
              <h1 className="hive-detail-title">{hive.nombre_colmena}</h1>
              <p className="hive-location">{hive.nombre_apiario}</p>
            </div>
          </div>
          {/* <div className={`hive-detail-status ${getStatusClass(hive.status)}`}>
             <FaCheckCircle />
             <span>Estado: {getStatusText(hive.status)}</span>
           </div> */}
        </div>

        <div className="detail-tabs">
          <button
            className={
              activeTab === "overview" ? "tab-button active" : "tab-button"
            }
            onClick={() => setActiveTab("overview")}
          >
            Resumen Actual
          </button>
          <button
            className={
              activeTab === "historical" ? "tab-button active" : "tab-button"
            }
            onClick={() => setActiveTab("historical")}
          >
            Datos Históricos
          </button>
          <button
            className={
              activeTab === "alerts" ? "tab-button active" : "tab-button"
            }
            onClick={() => setActiveTab("alerts")}
          >
            Alertas
          </button>
          <button
            onClick={() => descargarReporte(hiveId)}
            className="tab-button download-button"
          >
            <FaDownload /> Descargar Reporte
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="tab-content overview-content">
            <h2 className="current-metrics-title">Métricas Actuales</h2>
            <div className="current-metrics-grid">
              <div
                className={`metric-card ${tempStatus.status}`}
                onClick={() => openSensorModal("temperature")}
              >
                {tempStatus.icon}
                <span className="metric-value">{hive.temperatura}°C</span>
                <span className="metric-label">Temperatura</span>
                <span className="metric-status-label">{tempStatus.label}</span>
              </div>
              <div
                className={`metric-card ${humidityStatus.status}`}
                onClick={() => openSensorModal("humidity")}
              >
                {humidityStatus.icon}
                <span className="metric-value">{hive.humedad}%</span>
                <span className="metric-label">Humedad</span>
                <span className="metric-status-label">
                  {humidityStatus.label}
                </span>
              </div>
              <div
                className={`metric-card ${weightStatus.status}`}
                onClick={() => openSensorModal("weight")}
              >
                {weightStatus.icon}
                <span className="metric-value">{hive.peso} kg</span>
                <span className="metric-label">Peso</span>
                <span className="metric-status-label">
                  {weightStatus.label}
                </span>
              </div>
              <div className={`metric-card ${queenStatusInfo.status}`}>
                {queenStatusInfo.icon}
                <span className="metric-value">{hive.sonido}</span>
                <span className="metric-label">Estado de la Reina</span>
                <span className="metric-status-label">
                  {queenStatusInfo.label}
                </span>
              </div>
            </div>
            <p className="last-sync-time">
              Última sincronización: <MdAccessTime />{" "}
              {formatLastSyncTime(lastSyncTime)}
            </p>
          </div>
        )}

        {activeTab === "historical" && (
          <div className="tab-content historical-content">
            <h2 className="historical-chart-title">
              Gráfico de Datos Históricos (Promedio Diario)
            </h2>
            <div className="chart-section">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={temperaturaHistorial}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    label={{
                      value: "Temperatura °C",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ff9800"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-section">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={humedadHistorial}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    label={{
                      value: "Humedad %",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2196f3"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-section">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={pesoHistorial}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    label={{
                      value: "Peso kg",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#4caf50"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="tab-content alerts-content">
            <h2 className="alerts-title">Alertas Registradas</h2>
            <div className="alert-filter-buttons">
              <button
                className={
                  filterAlerts === "active"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilterAlerts("active")}
              >
                Activas (
                {
                  alertasColmena.filter((a) => a.estado_alerta === "pendiente")
                    .length
                }
                ) 
              </button>
              <button
                className={
                  filterAlerts === "resolved"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilterAlerts("resolved")}
              >
                Resueltas (
                {
                  alertasColmena.filter((a) => a.estado_alerta === "resuelta")
                    .length
                }
                )
              </button>
              <button
                className={
                  filterAlerts === "all"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilterAlerts("all")}
              >
                Todas ({alertasColmena.length})
              </button>
            </div>
            {getFilteredAlerts().length === 0 ? (
              <p className="no-alerts-message">
                No hay alertas{" "}
                {filterAlerts === "active"
                  ? "activas"
                  : filterAlerts === "resolved"
                  ? "resueltas"
                  : ""}{" "}
                para mostrar.
              </p>
            ) : (
              <div className="alerts-list">
                {getFilteredAlerts().map((alerta) => (
                  <div
                    key={alerta._id}
                    className={`alert-item ${
                      alerta.estado_alerta === "resuelta" ? "resolved" : "active"
                    }`}
                  >
                    <div className="alert-icon-wrapper">
                      {alerta.estado_alerta === "resuelta" ? (
                        <FaCheckCircle className="alert-status-icon resolved-icon" />
                      ) : (
                        <FaExclamationTriangle className="alert-status-icon active-icon" />
                      )}
                    </div>
                    <div className="alert-details">
                      <h3 className="alert-type">{alerta.titulo_alerta}</h3>
                      <p className="alert-description">
                        {alerta.descripcion_alerta}
                      </p>
                      <span className="alert-timestamp">
                        <FaCalendarAlt />{" "}
                        {/* {new Date(alert.timestamp).toLocaleString()} */}
                      </span>
                    </div>
                    {alerta.estado_alerta === "pendiente" && (
                      <button className="resolve-button">
                        Marcar como Resuelta
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isImageModalOpen && (
        <div className="image-modal" onClick={closeImageModal}>
          <FaTimes className="image-modal-close" onClick={closeImageModal} />
          <img
            className="image-modal-content"
            src={currentImageModalUrl}
            alt="Imagen ampliada de la colmena"
          />
        </div>
      )}

      {isSensorModalOpen && selectedSensorData && (
        <div className="sensor-modal-overlay" onClick={closeSensorModal}>
          <div
            className="sensor-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-button" onClick={closeSensorModal}>
              <FaTimes />
            </button>
            <div className="modal-header">
              {selectedSensorData.icon}
              <div className="modal-header-text">
                <h2 className="modal-title">{selectedSensorData.title}</h2>
                <p className="modal-subtitle">
                  Registros del día:{" "}
                  {new Date().toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="data-table-container">
              {selectedSensorData.historicalData.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Valor ({selectedSensorData.unit})</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSensorData.historicalData.map((data, index) => (
                      <tr
                        key={index}
                        className={`row-status-${data.statusInfo.status}`}
                      >
                        <td>{data.date}</td>
                        <td>{data.time}</td>
                        <td>{data[selectedSensorData.dataKey]}</td>
                        <td className="status-cell">
                          <span
                            className={`status-label status-${data.statusInfo.status}`}
                          >
                            {data.statusInfo.icon} {data.statusInfo.label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data-message">
                  <FaBell /> No hay registros disponibles para este sensor en el
                  día.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HiveDetailScreen;
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

// Datos de ejemplo (sin cambios)
const sampleHiveData = {
  h1: {
    id: "h1",
    name: "Colmena 001 - Prado Verde",
    location: "Sector Norte, Apiario A",
    hiveImage:
      "https://images.unsplash.com/photo-1616053303666-888941f173b9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "OK",
    currentMetrics: {
      temperature: 34.8,
      humidity: 61.2,
      weight: 47.5,
      queenStatus: "Activa",
    },
    historicalData: [
      {
        date: "2025-09-12",
        time: "08:00 AM",
        temp: 34.2,
        humidity: 60.5,
        weight: 47.9,
      },
      {
        date: "2025-09-12",
        time: "09:00 AM",
        temp: 34.5,
        humidity: 61.1,
        weight: 47.8,
      },
      {
        date: "2025-09-12",
        time: "10:00 AM",
        temp: 36.1,
        humidity: 62.0,
        weight: 47.7,
      },
      {
        date: "2025-09-12",
        time: "11:00 AM",
        temp: 38.8,
        humidity: 62.8,
        weight: 47.5,
      },
      {
        date: "2025-09-12",
        time: "12:00 PM",
        temp: 36.5,
        humidity: 63.5,
        weight: 47.4,
      },
      {
        date: "2025-09-12",
        time: "01:00 PM",
        temp: 35.5,
        humidity: 63.0,
        weight: 47.3,
      },
      {
        date: "2025-09-12",
        time: "02:00 PM",
        temp: 34.0,
        humidity: 62.5,
        weight: 47.2,
      },
      {
        date: "2025-09-12",
        time: "03:00 PM",
        temp: 34.8,
        humidity: 62.1,
        weight: 47.1,
      },
      {
        date: "2025-09-12",
        time: "04:00 PM",
        temp: 34.5,
        humidity: 61.8,
        weight: 47.0,
      },
      {
        date: "2025-09-12",
        time: "05:00 PM",
        temp: 33.2,
        humidity: 61.5,
        weight: 46.9,
      },
    ],
    alerts: [
      {
        id: 1,
        type: "Temperatura Alta",
        description: "La temperatura ha superado los 38°C durante 30 min.",
        timestamp: "2025-07-17 14:30",
        resolved: false,
      },
      {
        id: 2,
        type: "Humedad Anormal",
        description: "Humedad por encima del 70% por 2 horas.",
        timestamp: "2025-07-16 09:15",
        resolved: true,
      },
      {
        id: 3,
        type: "Pérdida de Peso",
        description: "Caída significativa de peso en las últimas 24 horas.",
        timestamp: "2025-07-15 18:00",
        resolved: false,
      },
    ],
  },
  h2: {
    id: "h2",
    name: "Colmena 002 - Bosque Nativo",
    location: "Sector Oeste, Apiario B",
    hiveImage:
      "https://images.unsplash.com/photo-1613133610996-03714b7e9c90?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "ALERT",
    currentMetrics: {
      temperature: 39.1,
      humidity: 78.0,
      weight: 32.5,
      queenStatus: "Inactiva (Posible Alerta)",
    },
    historicalData: [
      {
        date: "2025-09-12",
        time: "10:00 AM",
        temp: 37,
        humidity: 70,
        weight: 43.0,
      },
      {
        date: "2025-09-12",
        time: "11:00 AM",
        temp: 38.2,
        humidity: 75,
        weight: 42.8,
      },
      {
        date: "2025-09-12",
        time: "12:00 PM",
        temp: 38.5,
        humidity: 78,
        weight: 42.5,
      },
      {
        date: "2025-09-12",
        time: "01:00 PM",
        temp: 38.1,
        humidity: 77,
        weight: 42.3,
      },
      {
        date: "2025-09-12",
        time: "02:00 PM",
        temp: 37.9,
        humidity: 76,
        weight: 42.1,
      },
      {
        date: "2025-09-12",
        time: "03:00 PM",
        temp: 38.3,
        humidity: 75,
        weight: 42.0,
      },
      {
        date: "2025-09-12",
        time: "04:00 PM",
        temp: 38.0,
        humidity: 77,
        weight: 41.8,
      },
      {
        date: "2025-09-12",
        time: "05:00 PM",
        temp: 38.4,
        humidity: 78,
        weight: 41.5,
      },
    ],
    alerts: [
      {
        id: 4,
        type: "Temperatura Crítica",
        description:
          "¡ADVERTENCIA! Temperatura constante > 38.5°C. Actuar de inmediato.",
        timestamp: "2025-07-17 10:00",
        resolved: false,
      },
      {
        id: 5,
        type: "Humedad Extrema",
        description: "Humedad muy alta, riesgo de moho y enfermedades.",
        timestamp: "2025-07-17 11:30",
        resolved: false,
      },
    ],
  },
  h3: {
    id: "h3",
    name: "Colmena 003 - Campo de Flores",
    location: "Sector Este, Apiario C",
    hiveImage:
      "https://images.unsplash.com/photo-1627883907797-17072a2e411b?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "OK",
    currentMetrics: {
      temperature: 36.5,
      humidity: 68.0,
      weight: 40.0,
      queenStatus: "Activa",
    },
    historicalData: [
      {
        date: "2025-09-12",
        time: "10:00 AM",
        temp: 35,
        humidity: 60,
        weight: 41.0,
      },
      {
        date: "2025-09-12",
        time: "11:00 AM",
        temp: 35.5,
        humidity: 62,
        weight: 40.8,
      },
      {
        date: "2025-09-12",
        time: "12:00 PM",
        temp: 36.0,
        humidity: 65,
        weight: 40.5,
      },
      {
        date: "2025-09-12",
        time: "01:00 PM",
        temp: 36.5,
        humidity: 68,
        weight: 40.0,
      },
      {
        date: "2025-09-12",
        time: "02:00 PM",
        temp: 36.2,
        humidity: 67,
        weight: 39.8,
      },
      {
        date: "2025-09-12",
        time: "03:00 PM",
        temp: 36.0,
        humidity: 66,
        weight: 39.7,
      },
      {
        date: "2025-09-12",
        time: "04:00 PM",
        temp: 36.1,
        humidity: 67,
        weight: 39.6,
      },
      {
        date: "2025-09-12",
        time: "05:00 PM",
        temp: 36.3,
        humidity: 67,
        weight: 39.5,
      },
    ],
    alerts: [],
  },
  h4: {
    id: "h4",
    name: "Colmena 004 - Apiario de la Montaña",
    location: "Zona Alpina, Apiario D",
    hiveImage: "https://placehold.co/150x150/D3D3D3/000000?text=Colmena004",
    status: "OK",
    currentMetrics: {
      temperature: 33.0,
      humidity: 55.0,
      weight: 45.0,
      queenStatus: "Activa",
    },
    historicalData: [],
    alerts: [],
  },
};

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

  useEffect(() => {
    const getColmenaEspecifica = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/colmenas/obtener-colmena-particular/${hiveId}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        if (response.status === 200) {
          console.log(response.data);
          setHive(response.data[0]);
          console.log(hive);
          setLastSyncTime(Date.now());
        } else {
          console.log("Colmena no encontrada.");
          setHive(null);
        }
      } catch (error) {
        console.error("ERROR: ", error);
      }
    };
    getColmenaEspecifica();
  }, []);

  useEffect(() => {
    const getAlertas = async () => {
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
          console.log(response.data);
          setAlertasColmena(response.data);
        } else if (response.status === 204) {
          alert("No hay alertas actualmente.");
        }
      } catch (error) {
        console.error("ERROR: ", error);
      }
    };
    getAlertas();
  }, []);

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

    const enhancedData = hive.historicalData.map((record) => ({
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

  // 👇 MOVER ESTA LÓGICA AQUÍ, DESPUÉS DE LA COMPROBACIÓN DE `hive`
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
              Gráfico de Datos Históricos (Últimas 8 Horas)
            </h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={hive.historicalData}
                  margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={getComputedStyle(
                      document.documentElement
                    ).getPropertyValue("--color-border-light")}
                  />
                  <XAxis
                    dataKey="name"
                    stroke={getComputedStyle(
                      document.documentElement
                    ).getPropertyValue("--color-mid-text")}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke={getComputedStyle(
                      document.documentElement
                    ).getPropertyValue("--color-accent-orange")}
                    label={{
                      value: "Temperatura (°C)",
                      angle: -90,
                      position: "insideLeft",
                      fill: getComputedStyle(
                        document.documentElement
                      ).getPropertyValue("--color-accent-orange"),
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke={getComputedStyle(
                      document.documentElement
                    ).getPropertyValue("--color-status-ok")}
                    label={{
                      value: "Humedad (%) / Peso (kg)",
                      angle: 90,
                      position: "insideRight",
                      fill: getComputedStyle(
                        document.documentElement
                      ).getPropertyValue("--color-status-ok"),
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border-light)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{
                      color: "var(--color-dark-text)",
                      fontWeight: "bold",
                    }}
                    itemStyle={{ color: "var(--color-mid-text)" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temp"
                    stroke="var(--color-accent-orange)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="humidity"
                    stroke="var(--color-status-ok)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--color-status-critical)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
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
                ) {/* Cantidad de alertas en estado "pendiente"*/}
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
                ) {/* Cantidad de alertas en estado "resuelta" */}
              </button>
              <button
                className={
                  filterAlerts === "all"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilterAlerts("all")}
              >
                Todas ({alertasColmena.length}){" "}
                {/* Cantidad total de alertas. */}
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
                      alert.resolved ? "resolved" : "active"
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

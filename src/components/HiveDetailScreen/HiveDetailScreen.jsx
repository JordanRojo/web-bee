import React, { useState, useEffect, useContext, useRef } from "react";
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


// =========================================================================
// FUNCIÓN AUXILIAR: CUSTOM TOOLTIP
// =========================================================================
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // El 'label' aquí es el timestamp numérico
        const dateString = new Date(label).toLocaleString('es-ES', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        return (
            <div className="custom-tooltip" style={{ 
                backgroundColor: 'var(--color-surface)', 
                border: '1px solid var(--color-border-light)', 
                padding: '10px', 
                borderRadius: '8px' 
            }}>
                <p className="label" style={{ 
                    color: 'var(--color-dark-text)', 
                    fontWeight: 'bold' 
                }}>{dateString}</p>
                {payload.map((p, index) => (
                    <p key={index} style={{ color: p.stroke }}>
                        {p.dataKey}: {p.value} {p.dataKey === 'temperatura' ? '°C' : p.dataKey === 'humedad' ? '%' : 'kg'}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};
// =========================================================================


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
    
    // ESTADO 1: Datos de las últimas 24h
    const [sensoresPorDia, setSensoresPorDia] = useState(null); 
    
    // ESTADO 2: Todos los datos históricos
    const [sensoresHistoricoCompleto, setSensoresHistoricoCompleto] = useState(null); 
    
    // Indicador de carga para la pestaña de historial
    const [isHistoricalLoading, setIsHistoricalLoading] = useState(false); 
    
    const { config, userId } = useContext(AuthContext);

    const POLLING_INTERVAL = 5000; 
    const metricsSectionRef = useRef(null);

    // Función auxiliar para restaurar el scroll
    const restoreScrollPosition = () => {
        if (activeTab === 'overview' && metricsSectionRef.current && window.scrollY > 50) {
            const yOffset = metricsSectionRef.current.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: yOffset - 80, behavior: 'smooth' }); 
        }
    };

    // Función unificada para obtener datos de la colmena y alertas
    const fetchAllData = async (isPolling = false) => {
        try {
            // 1. Obtener la Colmena Específica (incluye métricas actuales)
            const hiveResponse = await axios.get(
                `${API_URL}/colmenas/obtener-colmena-particular/${hiveId}`,
                config
            );
            if (hiveResponse.status === 200 && hiveResponse.data.length > 0) {
                setHive(hiveResponse.data[0]);
                setLastSyncTime(Date.now());
                
                if (isPolling) {
                    restoreScrollPosition();
                }
            } else {
                setHive(null);
            }

            // 2. Obtener Alertas
            const alertsResponse = await axios.get(
                `${API_URL}/alertas/obtener-alertas-particular/${hiveId}`,
                { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
            );
            if (alertsResponse.status === 200) {
                setAlertasColmena(alertsResponse.data);
            } else if (alertsResponse.status === 204) {
                setAlertasColmena([]);
            }

        } catch (error) {
            console.error("ERROR en la obtención de datos de la colmena: ", error);
        }
    };


    // useEffect para la carga inicial y el polling de métricas/alertas
    useEffect(() => {
        // 1. Carga inicial
        fetchAllData(false);

        // 2. POLLING: Configurar el intervalo para actualizaciones periódicas
        const intervalId = setInterval(() => {
            fetchAllData(true); // Pasamos 'true' para indicar que es una actualización de polling
        }, POLLING_INTERVAL);

        // 3. LIMPIEZA
        return () => clearInterval(intervalId);
        
    }, [hiveId, config]); 

    // useEffect 1: Obtener SOLO los datos del día (para el modal y el gráfico en Overview)
    useEffect(() => {
        const getSensoresPorDia = async () => {
            try {
                // Endpoint que trae solo los datos de las últimas 24h
                const response = await axios.get(`${API_URL}/sensores/obtener-historial-diario/${hiveId}`, config);
                if (response.status === 200) {
                    setSensoresPorDia(response.data);
                } else if (response.status === 204) {
                    setSensoresPorDia([]); // Establecer como array vacío si no hay datos.
                }
            } catch (error) {
                console.error("ERROR al obtener historial diario:", error);
                setSensoresPorDia([]); 
            }
        }
        getSensoresPorDia()
    }, [hiveId, config])


    // useEffect 2: Cargar el historial completo solo si se activa la pestaña
    useEffect(() => {
        // DEBUG: Confirma que la función se llama al cambiar de pestaña.
        console.log(`[Historical Load] activeTab: ${activeTab}, loaded: ${sensoresHistoricoCompleto !== null}, loading: ${isHistoricalLoading}`);

        const getSensoresHistoricoCompleto = async () => {
            // 1. Evitar carga si ya está cargado o si no estamos en la pestaña
            if (activeTab !== "historical" || sensoresHistoricoCompleto !== null || isHistoricalLoading) {
                 console.log("[Historical Load] Abortada por condición.");
                 return;
            }
            
            console.log("[Historical Load] Iniciando carga de datos históricos...");
            setIsHistoricalLoading(true); // Iniciar estado de carga
            
            try {
                // Usamos el endpoint para obtener TODO el historial
                const response = await axios.get(`${API_URL}/sensores/obtener-historial-completo/${hiveId}`, config);
                if (response.status === 200) {
                    setSensoresHistoricoCompleto(response.data);
                    console.log("[Historical Load] Datos cargados:", response.data.length, "registros.");
                } else if (response.status === 204) {
                    setSensoresHistoricoCompleto([]);
                    console.log("[Historical Load] No Content (204). Array vacío.");
                }
            } catch (error) {
                console.error("ERROR al obtener el historial completo:", error);
                setSensoresHistoricoCompleto([]);
            } finally {
                setIsHistoricalLoading(false); // Detener estado de carga
            }
        }
        
        // 2. Ejecutar la función
        getSensoresHistoricoCompleto();
        
    }, [hiveId, config, activeTab]); 

    // ------------------------------------------
    // Funciones Auxiliares (sin cambios)
    // ------------------------------------------

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
            case "CRITICAL":
                return "Alerta"; 
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
    
    // FUNCIÓN DE FILTRO: Compara solo la fecha para asegurar que sea "hoy"
    const isToday = (dateString) => {
        if (!dateString) return false;
        
        // Crea una fecha a partir del string, usando la zona horaria local del navegador.
        const recordDate = new Date(dateString);
        const today = new Date();

        // Compara el año, el mes y el día (basado en la hora local)
        return (
            recordDate.getFullYear() === today.getFullYear() &&
            recordDate.getMonth() === today.getMonth() &&
            recordDate.getDate() === today.getDate()
        );
    };

    // openSensorModal MODIFICADO: Usa el estado de las últimas 24h y lo filtra por fecha de hoy
    const openSensorModal = (sensorType) => {
        const sensorDetails = {
            temperature: {
                title: "Temperatura - Registros de Hoy", 
                dataKey: "temperatura", 
                unit: "°C",
                icon: <FaThermometerHalf className="modal-icon" />,
            },
            humidity: {
                title: "Humedad - Registros de Hoy", 
                dataKey: "humedad", 
                unit: "%",
                icon: <FaTint className="modal-icon" />,
            },
            weight: {
                title: "Peso - Registros de Hoy", 
                dataKey: "peso", 
                unit: " kg",
                icon: <FaWeightHanging className="modal-icon" />,
            },
        };

        // Usar los datos del día (sensoresPorDia) y filtrarlos por la fecha actual
        const rawData = sensoresPorDia || [];
        
        // Filtra los datos para que solo incluyan registros que sean "hoy"
        const todayData = rawData.filter(record => isToday(record.fecha)); // CORREGIDO: Usar record.fecha
        
        // Mapeo y formateo de datos (usando solo los datos de hoy)
        const enhancedData = todayData
        .filter(record => record[sensorDetails[sensorType].dataKey] !== undefined) // Filtrar registros sin el dato del sensor
        .map((record) => {
            const dateObj = new Date(record.fecha); // CORREGIDO: Usar record.fecha

            // Formatear Fecha y Hora (usando la zona horaria del usuario)
            const date = dateObj.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
            const time = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

            const value = record[sensorDetails[sensorType].dataKey];

            return {
                date,
                time,
                value,
                statusInfo: getMetricStatus(
                    sensorType,
                    value
                ),
            };
        }).sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)); // Ordenar por fecha y hora (más reciente primero);


        setSelectedSensorData({
            ...sensorDetails[sensorType],
            historicalData: enhancedData,
        });
        setIsSensorModalOpen(true);
    };

    // =========================================================================
    // LÓGICA DE DATOS DEL GRÁFICO (CORREGIDA PARA MANEJAR FORMATOS DE FECHA)
    // =========================================================================
    const chartData = (activeTab === "historical" 
        ? (sensoresHistoricoCompleto || []) 
        : (sensoresPorDia || [])
    )
        .map(record => {
            
            // CLAVE DE CORRECCIÓN: Usar record.fecha
            let dateString = record.fecha; 

            // Manejo de formatos de fecha complejos (como el que mencionas)
            let dateObj = new Date(dateString);
            
            if (isNaN(dateObj.getTime())) {
                // Intentar limpiar la cadena de fecha si new Date() falló
                 console.error(`[Date Error] Formato de fecha original falló: ${dateString}. Intentando parseo estricto.`);
                 // Esto intenta corregir el formato de offset, e.g., de +01:00 a +0100
                 const cleanDateString = dateString.replace(/([+-]\d{2}):(\d{2})$/, '$1$2').replace(/\.\d+/, '');
                 dateObj = new Date(cleanDateString);

                 if (isNaN(dateObj.getTime())) {
                     console.error(`[Date Error] Parseo estricto también falló para: ${cleanDateString}. Este registro será ignorado.`);
                     return null; 
                 }
            }

            const timestamp = dateObj.getTime(); 
            
            // DEBUG: Confirma que el timestamp ahora es un número válido
            if (activeTab === "historical" && (sensoresHistoricoCompleto || []).length > 0) {
                console.log("[Punto Histórico Debug]", {
                    timestamp: timestamp, 
                    isTimestampValid: !isNaN(timestamp),
                    temperatura: record.temperatura,
                    sourceDate: dateString
                });
            }

            // Si el timestamp no es un número válido, ignorar el punto
            if (isNaN(timestamp)) {
                 return null;
            }


            return {
                ...record,
                timestamp: timestamp, 
                formattedTime: dateObj.toLocaleString('es-ES', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }),
            };
        })
        // Filtrar los registros nulos si el parseo de fecha falló
        .filter(record => record !== null) 
        // Ordenar por el timestamp numérico
        .sort((a, b) => a.timestamp - b.timestamp); 
    // =========================================================================


    // Lógica de carga para el historial
    if (!hive || (activeTab === "historical" && isHistoricalLoading)) {
        return (
            <div className="loading-screen">
                <p>Cargando detalles de la colmena...</p>
                <div className="spinner"></div>
            </div>
        );
    }
    
    // Manejo de estado: si estamos en historial, pero los datos aún no llegan (aunque no haya error)
    if (activeTab === "historical" && sensoresHistoricoCompleto === null && !isHistoricalLoading) {
        return (
            <div className="loading-screen">
                <p>Preparando datos históricos...</p>
                <div className="spinner"></div>
                <p>Esto puede tardar unos segundos si es la primera carga.</p>
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
                        <h2 className="current-metrics-title" ref={metricsSectionRef}>Métricas Actuales</h2>
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
                            Gráfico de Datos Históricos (Todos los Registros)
                        </h2>
                        {/* Mensaje de "No hay datos" si el historial está vacío */}
                        {chartData.length === 0 && !isHistoricalLoading ? (
                            <p className="no-data-message">
                                <FaBell /> No hay datos históricos para esta colmena.
                            </p>
                        ) : (
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={400}>
                                    {/* Usa chartData, que se basa en sensoresHistoricoCompleto para esta pestaña */}
                                    <LineChart
                                        data={chartData}
                                        margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke={getComputedStyle(
                                                document.documentElement
                                            ).getPropertyValue("--color-border-light")}
                                        />
                                        <XAxis
                                            dataKey="timestamp" 
                                            type="number" 
                                            scale="time" 
                                            domain={['auto', 'auto']} 
                                            tickFormatter={(tick) => 
                                                new Date(tick).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                                            } 
                                            stroke={getComputedStyle(
                                                document.documentElement
                                            ).getPropertyValue("--color-mid-text")}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            domain={['auto', 'auto']} 
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
                                            domain={['auto', 'auto']} 
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
                                        <Tooltip content={<CustomTooltip />} /> 
                                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="temperatura" 
                                            stroke="var(--color-accent-orange)"
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 8 }}
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="humedad" 
                                            stroke="var(--color-status-ok)"
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 8 }}
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="peso" 
                                            stroke="var(--color-status-critical)"
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
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
                                Todas ({alertasColmena.length}){" "}
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
                                                {/* Asumo que tienes una propiedad fecha_creacion o similar para las alertas */}
                                                {new Date(alerta.fecha_creacion || Date.now()).toLocaleString('es-ES', { 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
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
                                    Últimos Registros del Día
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
                                                <td>{data.value}</td> 
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
                                    <FaBell /> No hay registros del día disponibles para este sensor.
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
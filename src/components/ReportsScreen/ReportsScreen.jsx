import React, { useState, useEffect, useMemo, useContext } from "react";
import { Link } from "react-router-dom";
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
import {
  FaFileAlt,
  FaArrowLeft,
  FaChartLine,
  FaFilter,
  FaHive,
  FaDownload,
  FaPrint,
  FaExclamationTriangle,
  FaBell,
  FaCog,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  MdOutlineThermostat,
  MdOutlineWaterDrop,
  MdOutlineScale,
} from "react-icons/md";
import { GiBee } from "react-icons/gi";
import "./ReportsScreen.css";
import axios from "axios";
import { API_URL } from "../../helpers/apiURL";
import AuthContext from "../../context/AuthProvider";

// --- Datos de ejemplo para el reporte ---
const allSampleReportsData = {
  overview: {
    totalHives: 15,
    healthyHives: 10,
    alertHives: 3,
    criticalHives: 2,
    averageTemperature: 34.5,
    averageHumidity: 62.1,
    averageWeight: 45.8,
    totalHoneyHarvestedLastMonth: 120,
    averageDailyWeightGain: 0.2,
  },
  dailySensorData: [
    {
      name: "Colmena 001",
      temperature: 34.8,
      humidity: 61.2,
      weight: 47.5,
      date: "2025-07-24",
      id: "h1",
    },
    {
      name: "Colmena 002",
      temperature: 39.1,
      humidity: 78.0,
      weight: 32.5,
      date: "2025-07-24",
      id: "h2",
    },
    {
      name: "Colmena 003",
      temperature: 36.5,
      humidity: 68.0,
      weight: 40.0,
      date: "2025-07-24",
      id: "h3",
    },
    {
      name: "Colmena 004",
      temperature: 33.9,
      humidity: 58.5,
      weight: 51.0,
      date: "2025-07-24",
      id: "h4",
    },
    {
      name: "Colmena 005",
      temperature: 34.2,
      humidity: 60.1,
      weight: 48.2,
      date: "2025-07-24",
      id: "h5",
    },
    {
      name: "Colmena 006",
      temperature: 37.0,
      humidity: 70.0,
      weight: 30.1,
      date: "2025-07-24",
      id: "h6",
    },
    {
      name: "Colmena 007",
      temperature: 35.5,
      humidity: 63.0,
      weight: 45.0,
      date: "2025-07-24",
      id: "h7",
    },
    {
      name: "Colmena 008",
      temperature: 38.0,
      humidity: 80.0,
      weight: 28.0,
      date: "2025-07-24",
      id: "h8",
    },
    {
      name: "Colmena 001",
      temperature: 34.0,
      humidity: 60.0,
      weight: 47.0,
      date: "2025-07-23",
      id: "h1",
    },
    {
      name: "Colmena 002",
      temperature: 38.5,
      humidity: 77.0,
      weight: 32.0,
      date: "2025-07-23",
      id: "h2",
    },
  ],
  alertHistory: [
    {
      id: 1,
      hiveId: "h1",
      hiveName: "Colmena 001",
      type: "Temperatura Alta",
      date: "2025-07-24",
      status: "Activa",
    },
    {
      id: 2,
      hiveId: "h2",
      hiveName: "Colmena 002",
      type: "Humedad Extrema",
      date: "2025-07-24",
      status: "Activa",
    },
    {
      id: 3,
      hiveId: "h1",
      hiveName: "Colmena 001",
      type: "Humedad Anormal",
      date: "2025-07-23",
      status: "Resuelta",
    },
    {
      id: 4,
      hiveId: "h2",
      hiveName: "Colmena 002",
      type: "Temperatura Crítica",
      date: "2025-07-24",
      status: "Activa",
    },
    {
      id: 5,
      hiveId: "h3",
      hiveName: "Colmena 003",
      type: "Pérdida de Peso",
      date: "2025-07-23",
      status: "Resuelta",
    },
    {
      id: 6,
      hiveId: "h4",
      hiveName: "Colmena 004",
      type: "Nivel de Batería Bajo",
      date: "2025-07-24",
      status: "Resuelta",
    },
    {
      id: 7,
      hiveId: "h5",
      hiveName: "Colmena 005",
      type: "Enjambre Detectado",
      date: "2025-07-23",
      status: "Resuelta",
    },
    {
      id: 8,
      hiveId: "h8",
      hiveName: "Colmena 008",
      type: "Peso Crítico",
      date: "2025-07-24",
      status: "Activa",
    },
    {
      id: 9,
      hiveId: "h1",
      hiveName: "Colmena 001",
      type: "Actividad Anormal",
      date: "2025-07-22",
      status: "Resuelta",
    },
    {
      id: 10,
      hiveId: "h2",
      hiveName: "Colmena 002",
      type: "Temperatura Baja",
      date: "2025-06-25",
      status: "Resuelta",
    },
  ],
};

const ReportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedHive, setSelectedHive] = useState("all");
  const [colmenas, setColmenas] = useState([]);
  const { config } = useContext(AuthContext);
  const getFilteredReportData = useMemo(() => {
    return (date, hiveId) => {
      const filteredDailySensorData =
        allSampleReportsData.dailySensorData.filter((d) => d.date === date);
      const filteredAlertHistory = allSampleReportsData.alertHistory.filter(
        (a) => a.date === date
      );

      if (hiveId !== "all") {
        const singleHiveData = filteredDailySensorData.filter(
          (d) => d.id === hiveId
        );
        const singleHiveAlerts = filteredAlertHistory.filter(
          (a) => a.hiveId === hiveId
        );

        const newOverview = {
          totalHives: singleHiveData.length,
          healthyHives: 0,
          alertHives: 0,
          criticalHives: 0,
          averageTemperature: 0,
          averageHumidity: 0,
          averageWeight: 0,
          totalHoneyHarvestedLastMonth: 0,
          averageDailyWeightGain: 0,
        };

        if (singleHiveData.length > 0) {
          const hive = singleHiveData[0];
          newOverview.averageTemperature = hive.temperature;
          newOverview.averageHumidity = hive.humidity;
          newOverview.averageWeight = hive.weight;
          if (hive.weight > 40) newOverview.healthyHives = 1;
          else if (hive.weight >= 30 && hive.weight <= 40)
            newOverview.alertHives = 1;
          else if (hive.weight < 30) newOverview.criticalHives = 1;
        }

        return {
          overview: newOverview,
          dailySensorData: singleHiveData,
          alertHistory: singleHiveAlerts,
        };
      } else {
        const newOverview = { ...allSampleReportsData.overview };

        if (filteredDailySensorData.length > 0) {
          const totalTemp = filteredDailySensorData.reduce(
            (sum, d) => sum + d.temperature,
            0
          );
          const totalHum = filteredDailySensorData.reduce(
            (sum, d) => sum + d.humidity,
            0
          );
          const totalWeight = filteredDailySensorData.reduce(
            (sum, d) => sum + d.weight,
            0
          );

          newOverview.totalHives = filteredDailySensorData.length;
          newOverview.averageTemperature =
            totalTemp / filteredDailySensorData.length;
          newOverview.averageHumidity =
            totalHum / filteredDailySensorData.length;
          newOverview.averageWeight =
            totalWeight / filteredDailySensorData.length;
          newOverview.healthyHives = filteredDailySensorData.filter(
            (h) => h.weight > 40
          ).length;
          newOverview.alertHives = filteredDailySensorData.filter(
            (h) => h.weight >= 30 && h.weight <= 40
          ).length;
          newOverview.criticalHives = filteredDailySensorData.filter(
            (h) => h.weight < 30
          ).length;
        } else {
          Object.keys(newOverview).forEach((key) => {
            if (typeof newOverview[key] === "number") newOverview[key] = 0;
          });
          newOverview.totalHives = 0;
        }

        return {
          overview: newOverview,
          dailySensorData: filteredDailySensorData,
          alertHistory: filteredAlertHistory,
        };
      }
    };
  }, []);

  const uniqueHives = useMemo(() => {
    const hives = new Set();
    allSampleReportsData.dailySensorData.forEach((d) =>
      hives.add({ id: d.id, name: d.name })
    );
    return Array.from(hives).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  useEffect(() => {
    const fetchInitialReportData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const initialData = getFilteredReportData(reportDate, "all");
      setReportData(initialData);
      setLoading(false);
    };
    fetchInitialReportData();
  }, [getFilteredReportData, reportDate]);

  const handleGenerateReport = (colmena_id) => {
    console.log(colmena_id);
    // setLoading(true);
    // setTimeout(() => {
    //   const filteredData = getFilteredReportData(reportDate, selectedHive);
    //   setReportData(filteredData);
    //   setLoading(false);
    // }, 800);
  };

  useEffect(() => {
    const getColmenas = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/colmenas/obtener-todas-colmenas`,
          {
            config,
          }
        );
        if (response.data && response.status === 200) {
          console.log(response.data);
          setColmenas(response.data);
        } else if (response.status === 204) {
          alert("No hay colmenas registradas en la base de datos.");
        }
      } catch (error) {
        console.error("Error: ", error);
      }
    };
    getColmenas();
  }, []);

  function formatDateToDMY(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  }
  const generarReporte = async (colmena_id) => {
    console.log(formatDateToDMY(reportDate), colmena_id);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/reportes/descargar-reporte/${colmena_id}/${formatDateToDMY(
          reportDate
        )}`,
        {
          responseType: "blob", // Important for binary data
          config,
        }
      );
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `reporte_colmena_${selectedHive}_${reportDate}.pdf`
      );
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

  const handleDownloadReport = () => {
    alert("Funcionalidad de descarga de reporte no implementada aún.");
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Generando reportes, por favor espera...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="reports-screen-container">
      <nav className="reports-navbar">
        <div className="navbar-logo">
          <GiBee className="nav-bee-icon" />
          <span>Monitor Beehive</span>
        </div>
        <div className="navbar-links">
          <Link to="/dashboard" className="nav-link">
            <FaArrowLeft /> Volver al Dashboard
          </Link>
          <Link to="/hives" className="nav-link">
            <FaHive />
            Gestionar Colmenas
          </Link>
          <Link to="/settings" className="nav-link">
            <FaCog />
            Configuración
          </Link>
        </div>
      </nav>

      <div className="reports-content">
        <div className="reports-header-section">
          <FaFileAlt className="reports-icon" />
          <div className="reports-title-group">
            <h1 className="reports-title">Reportes y Análisis de Apiario</h1>
            <p className="reports-subtitle">
              Información sensorizada del día: {reportDate}
            </p>
          </div>
          <div className="reports-actions">
            <button
              className="action-button download-button"
              onClick={handleDownloadReport}
            >
              <FaDownload /> Descargar
            </button>
            <button
              className="action-button print-button"
              onClick={handlePrintReport}
            >
              <FaPrint /> Imprimir
            </button>
          </div>
        </div>

        <div className="report-filters-section">
          <h2 className="section-title">
            <FaFilter /> Opciones de Filtrado
          </h2>
          <div className="filters-grid">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                generarReporte(selectedHive);
              }}
            >
              <div className="filter-group">
                <label htmlFor="reportDate">
                  <FaCalendarAlt /> Fecha del Reporte:
                </label>
                <input
                  type="date"
                  id="reportDate"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label htmlFor="hiveSelect">
                  <FaHive /> Seleccionar Colmena:
                </label>
                <select
                  id="hiveSelect"
                  value={selectedHive}
                  onChange={(e) => setSelectedHive(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Todas las Colmenas</option>
                  {colmenas.map((colmena) => (
                    <option key={colmena._id} value={colmena.colmena_id}>
                      {colmena.nombre_colmena}
                    </option>
                  ))}
                </select>
              </div>
              <button className="generate-report-button">
                Generar Reporte
              </button>
            </form>
          </div>
        </div>

        <div className="report-summary-section">
          <h2 className="section-title">
            <FaChartLine /> Resumen del Apiario ({reportDate})
          </h2>
          <div className="summary-cards-grid">
            <div className="summary-card status-ok">
              <FaHive className="summary-icon" />
              <span className="summary-value">
                {reportData.overview.healthyHives} /{" "}
                {reportData.overview.totalHives}
              </span>
              <span className="summary-label">Colmenas Saludables</span>
            </div>
            <div className="summary-card status-alert">
              <FaExclamationTriangle className="summary-icon" />
              <span className="summary-value">
                {reportData.overview.alertHives}
              </span>
              <span className="summary-label">Colmenas en Alerta</span>
            </div>
            <div className="summary-card status-critical">
              <FaExclamationTriangle className="summary-icon" />
              <span className="summary-value">
                {reportData.overview.criticalHives}
              </span>
              <span className="summary-label">Colmenas Críticas</span>
            </div>
            <div className="summary-card">
              <MdOutlineThermostat className="summary-icon" />
              <span className="summary-value">
                {reportData.overview.averageTemperature.toFixed(1)}°C
              </span>
              <span className="summary-label">Temp. Promedio Apiario</span>
            </div>
            <div className="summary-card">
              <MdOutlineWaterDrop className="summary-icon" />
              <span className="summary-value">
                {reportData.overview.averageHumidity.toFixed(1)}%
              </span>
              <span className="summary-label">Humedad Promedio Apiario</span>
            </div>
            <div className="summary-card">
              <MdOutlineScale className="summary-icon" />
              <span className="summary-value">
                {reportData.overview.averageWeight.toFixed(1)} kg
              </span>
              <span className="summary-label">Peso Promedio Apiario</span>
            </div>
          </div>
        </div>

        <div className="report-chart-section">
          <h2 className="section-title">
            <FaHive /> Datos Sensorizados Diarios por Colmena
          </h2>
          {reportData.dailySensorData.length === 0 ? (
            <p className="no-data-message">
              No hay datos sensorizados disponibles para esta fecha o colmena.
            </p>
          ) : (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={reportData.dailySensorData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border-light)"
                  />
                  <XAxis dataKey="name" stroke="var(--color-mid-text)" />
                  <YAxis
                    stroke="var(--color-mid-text)"
                    label={{
                      value: "Valores",
                      angle: -90,
                      position: "insideLeft",
                      fill: "var(--color-mid-text)",
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
                    formatter={(value, name) => {
                      if (name === "temperature")
                        return [`${value.toFixed(1)}°C`, "Temperatura"];
                      if (name === "humidity")
                        return [`${value.toFixed(1)}%`, "Humedad"];
                      if (name === "weight")
                        return [`${value.toFixed(1)} kg`, "Peso"];
                      return [`${value}`, name];
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px" }} />
                  <Bar
                    dataKey="temperature"
                    name="Temperatura"
                    fill="#FF7F50"
                  />
                  <Bar dataKey="humidity" name="Humedad" fill="#6A5ACD" />
                  <Bar dataKey="weight" name="Peso" fill="#FFC107" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="alert-history-section">
          <h2 className="section-title">
            <FaBell /> Historial de Alertas ({reportDate})
          </h2>
          {reportData.alertHistory.length === 0 ? (
            <p className="no-alerts-message">
              No se encontraron alertas para esta fecha o colmena.
            </p>
          ) : (
            <div className="alert-history-table-container">
              <table className="alert-history-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Colmena</th>
                    <th>Tipo de Alerta</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.alertHistory.map((alert) => (
                    <tr key={alert.id}>
                      <td>{alert.id}</td>
                      <td>{alert.hiveName}</td>
                      <td>{alert.type}</td>
                      <td>{alert.date}</td>
                      <td
                        className={`alert-status ${alert.status.toLowerCase()}`}
                      >
                        {alert.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsScreen;

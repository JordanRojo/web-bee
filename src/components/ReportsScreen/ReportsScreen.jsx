import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  FaFileAlt,
  FaArrowLeft,
  FaChartLine,
  FaFilter,
  FaCalendarAlt,
  FaHive,
  FaDownload,
  FaPrint,
  FaExclamationTriangle,
  FaBell,
  FaCog,
} from "react-icons/fa";
import {
  MdOutlineThermostat,
  MdOutlineWaterDrop,
  MdOutlineScale,
} from "react-icons/md";
import { GiBee } from "react-icons/gi";
import "./ReportsScreen.css";

// --- Datos de ejemplo AMPLIADOS para el reporte ---
const allSampleReportsData = {
  overview: {
    totalHives: 15,
    healthyHives: 10,
    alertHives: 3,
    criticalHives: 2,
    averageTemperature: 34.5,
    averageHumidity: 62.1,
    averageWeight: 45.8,
    totalHoneyHarvestedLastMonth: 120, // kg
    averageDailyWeightGain: 0.2, // kg/day
  },
  annualWeightTrend: [
    { name: "2024-01", value: 40.5, hive: "all" },
    { name: "2024-02", value: 38.2, hive: "all" },
    { name: "2024-03", value: 42.1, hive: "all" },
    { name: "2024-04", value: 48.0, hive: "all" },
    { name: "2024-05", value: 52.3, hive: "all" },
    { name: "2024-06", value: 55.1, hive: "all" },
    { name: "2024-07", value: 50.8, hive: "all" },
    { name: "2024-08", value: 49.5, hive: "all" },
    { name: "2024-09", value: 46.2, hive: "all" },
    { name: "2024-10", value: 44.0, hive: "all" },
    { name: "2024-11", value: 41.8, hive: "all" },
    { name: "2024-12", value: 39.7, hive: "all" },
    { name: "2025-01", value: 41.0, hive: "all" },
    { name: "2025-02", value: 39.5, hive: "all" },
    { name: "2025-03", value: 43.0, hive: "all" },
    { name: "2025-04", value: 49.0, hive: "all" },
    { name: "2025-05", value: 53.5, hive: "all" },
    { name: "2025-06", value: 56.0, hive: "all" },
    { name: "2025-07", value: 51.5, hive: "all" }, // Mes actual (Julio 2025)
    // Datos específicos por colmena para el ejemplo de filtrado
    { name: "2025-07", value: 47.5, hive: "h1" },
    { name: "2025-07", value: 32.5, hive: "h2" },
    { name: "2025-07", value: 40.0, hive: "h3" },
    { name: "2025-07", value: 51.0, hive: "h4" },
  ],
  hiveComparisonData: [
    {
      id: "h1",
      name: "Colmena 001",
      weight: 47.5,
      temperature: 34.8,
      humidity: 61.2,
    },
    {
      id: "h2",
      name: "Colmena 002",
      weight: 32.5,
      temperature: 39.1,
      humidity: 78.0,
    },
    {
      id: "h3",
      name: "Colmena 003",
      weight: 40.0,
      temperature: 36.5,
      humidity: 68.0,
    },
    {
      id: "h4",
      name: "Colmena 004",
      weight: 51.0,
      temperature: 33.9,
      humidity: 58.5,
    },
    {
      id: "h5",
      name: "Colmena 005",
      weight: 48.2,
      temperature: 34.2,
      humidity: 60.1,
    },
    {
      id: "h6",
      name: "Colmena 006",
      weight: 30.1,
      temperature: 37.0,
      humidity: 70.0,
    },
    {
      id: "h7",
      name: "Colmena 007",
      weight: 45.0,
      temperature: 35.5,
      humidity: 63.0,
    },
    {
      id: "h8",
      name: "Colmena 008",
      weight: 28.0,
      temperature: 38.0,
      humidity: 80.0,
    }, // Crítica
  ],
  alertHistory: [
    {
      id: 1,
      hiveId: "h1",
      hiveName: "Colmena 001",
      type: "Temperatura Alta",
      date: "2025-07-17",
      status: "Activa",
    },
    {
      id: 2,
      hiveId: "h2",
      hiveName: "Colmena 002",
      type: "Humedad Extrema",
      date: "2025-07-17",
      status: "Activa",
    },
    {
      id: 3,
      hiveId: "h1",
      hiveName: "Colmena 001",
      type: "Humedad Anormal",
      date: "2025-07-16",
      status: "Resuelta",
    },
    {
      id: 4,
      hiveId: "h2",
      hiveName: "Colmena 002",
      type: "Temperatura Crítica",
      date: "2025-07-17",
      status: "Activa",
    },
    {
      id: 5,
      hiveId: "h3",
      hiveName: "Colmena 003",
      type: "Pérdida de Peso",
      date: "2025-07-15",
      status: "Resuelta",
    },
    {
      id: 6,
      hiveId: "h4",
      hiveName: "Colmena 004",
      type: "Nivel de Batería Bajo",
      date: "2025-07-14",
      status: "Resuelta",
    },
    {
      id: 7,
      hiveId: "h5",
      hiveName: "Colmena 005",
      type: "Enjambre Detectado",
      date: "2025-07-13",
      status: "Resuelta",
    },
    {
      id: 8,
      hiveId: "h8",
      hiveName: "Colmena 008",
      type: "Peso Crítico",
      date: "2025-07-17",
      status: "Activa",
    },
    {
      id: 9,
      hiveId: "h1",
      hiveName: "Colmena 001",
      type: "Actividad Anormal",
      date: "2025-07-10",
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
  // TODOS LOS HOOKS DEBEN IR AQUÍ, AL PRINCIPIO DEL COMPONENTE, INCONDICIONALMENTE
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedHive, setSelectedHive] = useState("all");

  // Función para obtener los datos filtrados (simulada)
  const getFilteredReportData = useMemo(() => {
    return (start, end, hiveId) => {
      let filteredAnnualWeightTrend = allSampleReportsData.annualWeightTrend;
      let filteredHiveComparisonData = allSampleReportsData.hiveComparisonData;
      let filteredAlertHistory = allSampleReportsData.alertHistory;

      // Filtrar por fecha para tendencias anuales
      if (start && end) {
        const startDt = new Date(start + "T00:00:00"); // Asegurarse de que la hora sea el inicio del día
        const endDt = new Date(end + "T23:59:59"); // Asegurarse de que la hora sea el fin del día

        filteredAnnualWeightTrend =
          allSampleReportsData.annualWeightTrend.filter((d) => {
            const dataDate = new Date(d.name + "-01T00:00:00"); // Para YYYY-MM
            return dataDate >= startDt && dataDate <= endDt;
          });
      } else {
        // Si no hay rango de fechas, mostramos los últimos 12 meses de datos 'all' para el gráfico de tendencia
        filteredAnnualWeightTrend = allSampleReportsData.annualWeightTrend
          .filter((d) => d.hive === "all")
          .slice(-12);
      }

      // Filtrar por colmena para comparación y alertas
      if (hiveId !== "all") {
        filteredHiveComparisonData =
          allSampleReportsData.hiveComparisonData.filter(
            (d) => d.id === hiveId
          );
        filteredAlertHistory = allSampleReportsData.alertHistory.filter(
          (a) => a.hiveId === hiveId
        );
        // Si se selecciona una sola colmena, la tendencia anual solo mostrará el dato específico de esa colmena si existe
        // Es importante que si solo se muestra una colmena, los datos de tendencia sean relevantes para ella
        const singleHiveDataForTrend =
          allSampleReportsData.annualWeightTrend.find(
            (d) => d.hive === hiveId && d.name === "2025-07"
          );
        filteredAnnualWeightTrend = singleHiveDataForTrend
          ? [singleHiveDataForTrend]
          : [];
      } else {
        // Si 'all', asegurarnos de que la tendencia solo tenga datos 'all'
        // Esto es crucial para que no se mezclen datos de colmenas individuales cuando se muestra el reporte general
        filteredAnnualWeightTrend = filteredAnnualWeightTrend.filter(
          (d) => d.hive === "all"
        );
      }

      // Recalcular el resumen (overview) en función de los datos filtrados
      let newOverview = { ...allSampleReportsData.overview }; // Copia inicial
      if (hiveId !== "all") {
        const selectedHiveData = allSampleReportsData.hiveComparisonData.find(
          (h) => h.id === hiveId
        );
        if (selectedHiveData) {
          // Si se selecciona una colmena específica, el resumen es de esa colmena
          newOverview = {
            totalHives: 1,
            healthyHives: selectedHiveData.weight > 40 ? 1 : 0,
            alertHives:
              selectedHiveData.weight >= 30 && selectedHiveData.weight <= 40
                ? 1
                : 0,
            criticalHives: selectedHiveData.weight < 30 ? 1 : 0,
            averageTemperature: selectedHiveData.temperature,
            averageHumidity: selectedHiveData.humidity,
            averageWeight: selectedHiveData.weight,
            totalHoneyHarvestedLastMonth: 0, // No tenemos estos datos por colmena en el mock
            averageDailyWeightGain: 0, // No tenemos estos datos por colmena en el mock
          };
        } else {
          // Si la colmena no se encuentra, valores a 0
          newOverview = {
            totalHives: 0,
            healthyHives: 0,
            alertHives: 0,
            criticalHives: 0,
            averageTemperature: 0,
            averageHumidity: 0,
            averageWeight: 0,
            totalHoneyHarvestedLastMonth: 0,
            averageDailyWeightGain: 0,
          };
        }
      } else {
        // Si es 'all', reestablecemos los valores del overview inicial completo
        newOverview = { ...allSampleReportsData.overview };
      }

      return {
        overview: newOverview,
        annualWeightTrend: filteredAnnualWeightTrend,
        hiveComparisonData: filteredHiveComparisonData,
        alertHistory: filteredAlertHistory,
      };
    };
  }, []);

  // Obtenemos una lista única de colmenas para el selector
  // ESTE HOOK DEBE ESTAR ANTES DE CUALQUIER RETURN CONDICIONAL
  const uniqueHives = useMemo(() => {
    const hives = new Set();
    allSampleReportsData.hiveComparisonData.forEach((h) =>
      hives.add({ id: h.id, name: h.name })
    );
    allSampleReportsData.alertHistory.forEach((a) =>
      hives.add({ id: a.hiveId, name: a.hiveName })
    );
    return Array.from(hives).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  useEffect(() => {
    const fetchInitialReportData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simular retraso de red
      const initialData = getFilteredReportData("", "", "all");
      setReportData(initialData);
      setLoading(false);
    };
    fetchInitialReportData();
  }, [getFilteredReportData]); // getFilteredReportData está envuelto en useMemo, así que su referencia es estable.

  const handleGenerateReport = () => {
    setLoading(true);
    setTimeout(() => {
      const filteredData = getFilteredReportData(
        startDate,
        endDate,
        selectedHive
      );
      setReportData(filteredData);
      setLoading(false);
    }, 800);
  };

  const handleDownloadReport = () => {
    alert("Funcionalidad de descarga de reporte no implementada aún.");
  };

  const handlePrintReport = () => {
    window.print();
  };

  // AHORA SI, LOS RETURNS CONDICIONALES DESPUÉS DE TODOS LOS HOOKS DECLARADOS
  if (loading) {
    return (
      <div className="loading-screen">
        <p>Generando reportes, por favor espera...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="error-screen">
        <p>No se pudieron cargar los datos de los reportes.</p>
        <Link to="/dashboard" className="back-link">
          Volver al Dashboard
        </Link>
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
              Información consolidada para la toma de decisiones.
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
            <div className="filter-group">
              <label htmlFor="startDate">
                <FaCalendarAlt /> Fecha Inicio:
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="endDate">
                <FaCalendarAlt /> Fecha Fin:
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
                {uniqueHives.map((hive) => (
                  <option key={hive.id} value={hive.id}>
                    {hive.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="generate-report-button"
              onClick={handleGenerateReport}
            >
              Generar Reporte
            </button>
          </div>
        </div>

        <div className="report-summary-section">
          <h2 className="section-title">
            <FaChartLine /> Resumen del Apiario
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
            {/* <div className="summary-card highlight-card">
                            <GiBee className="summary-icon" />
                            <span className="summary-value">{reportData.overview.totalHoneyHarvestedLastMonth} kg</span>
                            <span className="summary-label">Miel Cosechada (Últ. Mes)</span>
                        </div>
                        <div className="summary-card highlight-card">
                            <FaChartLine className="summary-icon" />
                            <span className="summary-value">{reportData.overview.averageDailyWeightGain.toFixed(1)} kg/día</span>
                            <span className="summary-label">Ganancia de Peso Diaria Prom.</span>
                        </div> */}
          </div>
        </div>

        <div className="report-chart-section">
          <h2 className="section-title">
            <FaChartLine /> Tendencia de Peso Promedio Anual
          </h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={reportData.annualWeightTrend}
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
                    value: "Peso (kg)",
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
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Peso Promedio"
                  stroke="var(--color-primary-gold)"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="report-chart-section">
          <h2 className="section-title">
            <FaHive /> Comparación de Colmenas (Peso Actual)
          </h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={reportData.hiveComparisonData}
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
                    value: "Peso (kg)",
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
                  formatter={(value, name, props) => [
                    `${value.toFixed(1)} kg`,
                    `Temp: ${props.payload.temperature}°C, Hum: ${props.payload.humidity}%`,
                  ]}
                />
                <Bar
                  dataKey="weight"
                  name="Peso Actual"
                  fill="var(--color-accent-orange)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="alert-history-section">
          <h2 className="section-title">
            <FaBell /> Historial de Alertas
          </h2>
          {reportData.alertHistory.length === 0 ? (
            <p className="no-alerts-message">
              No se encontraron alertas en el historial con los filtros
              actuales.
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

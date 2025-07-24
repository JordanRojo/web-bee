import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaFileAlt, FaArrowLeft, FaChartLine, FaFilter, FaHive, FaDownload, FaPrint, FaExclamationTriangle, FaBell, FaCog, FaCalendarAlt } from 'react-icons/fa';
import { MdOutlineThermostat, MdOutlineWaterDrop, MdOutlineScale } from 'react-icons/md';
import { GiBee } from 'react-icons/gi';
import './ReportsScreen.css';

// --- Datos de ejemplo AMPLIADOS para el reporte ---
// Estos datos ahora se centran en valores diarios para simular la sensórica del día
const allSampleReportsData = {
    overview: {
        totalHives: 15,
        healthyHives: 10,
        alertHives: 3,
        criticalHives: 2,
        averageTemperature: 34.5,
        averageHumidity: 62.1,
        averageWeight: 45.8,
        totalHoneyHarvestedLastMonth: 120, // Este dato podría ser de "últimos 30 días" si se quiere mantener
        averageDailyWeightGain: 0.2 // kg/day
    },
    // Ahora, annualWeightTrend se convierte en dailySensorData para el día del reporte
    dailySensorData: [
        { name: 'Colmena 001', temperature: 34.8, humidity: 61.2, weight: 47.5, date: '2025-07-24' },
        { name: 'Colmena 002', temperature: 39.1, humidity: 78.0, weight: 32.5, date: '2025-07-24' },
        { name: 'Colmena 003', temperature: 36.5, humidity: 68.0, weight: 40.0, date: '2025-07-24' },
        { name: 'Colmena 004', temperature: 33.9, humidity: 58.5, weight: 51.0, date: '2025-07-24' },
        { name: 'Colmena 005', temperature: 34.2, humidity: 60.1, weight: 48.2, date: '2025-07-24' },
        { name: 'Colmena 006', temperature: 37.0, humidity: 70.0, weight: 30.1, date: '2025-07-24' },
        { name: 'Colmena 007', temperature: 35.5, humidity: 63.0, weight: 45.0, date: '2025-07-24' },
        { name: 'Colmena 008', temperature: 38.0, humidity: 80.0, weight: 28.0, date: '2025-07-24' }, // Crítica
        // Datos para otro día, para simular filtrado (si se pidiera un día específico)
        { name: 'Colmena 001', temperature: 34.0, humidity: 60.0, weight: 47.0, date: '2025-07-23' },
        { name: 'Colmena 002', temperature: 38.5, humidity: 77.0, weight: 32.0, date: '2025-07-23' },
    ],
    alertHistory: [
        { id: 1, hiveId: 'h1', hiveName: 'Colmena 001', type: 'Temperatura Alta', date: '2025-07-24', status: 'Activa' },
        { id: 2, hiveId: 'h2', hiveName: 'Colmena 002', type: 'Humedad Extrema', date: '2025-07-24', status: 'Activa' },
        { id: 3, hiveId: 'h1', hiveName: 'Colmena 001', type: 'Humedad Anormal', date: '2025-07-23', status: 'Resuelta' },
        { id: 4, hiveId: 'h2', hiveName: 'Colmena 002', type: 'Temperatura Crítica', date: '2025-07-24', status: 'Activa' },
        { id: 5, hiveId: 'h3', hiveName: 'Colmena 003', type: 'Pérdida de Peso', date: '2025-07-23', status: 'Resuelta' },
        { id: 6, hiveId: 'h4', hiveName: 'Colmena 004', type: 'Nivel de Batería Bajo', date: '2025-07-24', status: 'Resuelta' },
        { id: 7, hiveId: 'h5', hiveName: 'Colmena 005', type: 'Enjambre Detectado', date: '2025-07-23', status: 'Resuelta' },
        { id: 8, hiveId: 'h8', hiveName: 'Colmena 008', type: 'Peso Crítico', date: '2025-07-24', status: 'Activa' },
        { id: 9, hiveId: 'h1', hiveName: 'Colmena 001', type: 'Actividad Anormal', date: '2025-07-22', status: 'Resuelta' },
        { id: 10, hiveId: 'h2', hiveName: 'Colmena 002', type: 'Temperatura Baja', date: '2025-07-21', status: 'Resuelta' },
    ]
};

const ReportsScreen = () => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);
    // Solo necesitamos la fecha del reporte, no un rango
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]); // Fecha actual por defecto
    const [selectedHive, setSelectedHive] = useState('all');

    // Función para obtener los datos filtrados para el día del reporte
    const getFilteredReportData = useMemo(() => {
        return (date, hiveId) => {
            // Filtrar los datos sensorizados del día específico
            let filteredDailySensorData = allSampleReportsData.dailySensorData.filter(d => d.date === date);

            // Filtrar alertas para el día específico
            let filteredAlertHistory = allSampleReportsData.alertHistory.filter(a => a.date === date);

            // Filtrar por colmena si se selecciona una específica
            if (hiveId !== 'all') {
                filteredDailySensorData = filteredDailySensorData.filter(d => `h${d.name.split(' ')[1]}` === hiveId);
                filteredAlertHistory = filteredAlertHistory.filter(a => a.hiveId === hiveId);
            }

            // Recalcular el resumen (overview) en función de los datos filtrados
            let newOverview = {
                totalHives: filteredDailySensorData.length,
                healthyHives: 0,
                alertHives: 0,
                criticalHives: 0,
                averageTemperature: 0,
                averageHumidity: 0,
                averageWeight: 0,
                totalHoneyHarvestedLastMonth: allSampleReportsData.overview.totalHoneyHarvestedLastMonth, // Se mantiene si es un dato global
                averageDailyWeightGain: allSampleReportsData.overview.averageDailyWeightGain // Se mantiene si es un dato global
            };

            if (filteredDailySensorData.length > 0) {
                const totalTemp = filteredDailySensorData.reduce((sum, d) => sum + d.temperature, 0);
                const totalHum = filteredDailySensorData.reduce((sum, d) => sum + d.humidity, 0);
                const totalWeight = filteredDailySensorData.reduce((sum, d) => sum + d.weight, 0);

                newOverview.averageTemperature = totalTemp / filteredDailySensorData.length;
                newOverview.averageHumidity = totalHum / filteredDailySensorData.length;
                newOverview.averageWeight = totalWeight / filteredDailySensorData.length;

                filteredDailySensorData.forEach(hive => {
                    if (hive.weight > 40) newOverview.healthyHives++;
                    else if (hive.weight >= 30 && hive.weight <= 40) newOverview.alertHives++;
                    else if (hive.weight < 30) newOverview.criticalHives++;
                });
            } else {
                 // Si no hay datos para el día o colmena, establecer todo a 0 o valores predeterminados
                newOverview = {
                    totalHives: 0, healthyHives: 0, alertHives: 0, criticalHives: 0,
                    averageTemperature: 0, averageHumidity: 0, averageWeight: 0,
                    totalHoneyHarvestedLastMonth: 0, averageDailyWeightGain: 0
                };
            }

            return {
                overview: newOverview,
                dailySensorData: filteredDailySensorData, // Renombrado de annualWeightTrend
                alertHistory: filteredAlertHistory,
            };
        };
    }, []);

    // Obtenemos una lista única de colmenas para el selector de las colmenas con datos sensorizados
    const uniqueHives = useMemo(() => {
        const hives = new Set();
        allSampleReportsData.dailySensorData.forEach(d => hives.add({ id: `h${d.name.split(' ')[1]}`, name: d.name }));
        return Array.from(hives).sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    useEffect(() => {
        const fetchInitialReportData = async () => {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simular retraso de red
            const initialData = getFilteredReportData(reportDate, 'all'); // Usar la fecha actual por defecto
            setReportData(initialData);
            setLoading(false);
        };
        fetchInitialReportData();
    }, [getFilteredReportData, reportDate]); // Dependencia de reportDate para que se actualice si cambia la fecha por defecto

    const handleGenerateReport = () => {
        setLoading(true);
        setTimeout(() => {
            const filteredData = getFilteredReportData(reportDate, selectedHive);
            setReportData(filteredData);
            setLoading(false);
        }, 800);
    };

    const handleDownloadReport = () => {
        alert('Funcionalidad de descarga de reporte no implementada aún.');
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

    if (!reportData) {
        return (
            <div className="error-screen">
                <p>No se pudieron cargar los datos de los reportes.</p>
                <Link to="/dashboard" className="back-link">Volver al Dashboard</Link>
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
                    <Link to="/dashboard" className="nav-link"><FaArrowLeft /> Volver al Dashboard</Link>
                    <Link to="/hives" className="nav-link"><FaHive />Gestionar Colmenas</Link>
                    <Link to="/settings" className="nav-link"><FaCog />Configuración</Link>
                </div>
            </nav>

            <div className="reports-content">
                <div className="reports-header-section">
                    <FaFileAlt className="reports-icon" />
                    <div className="reports-title-group">
                        <h1 className="reports-title">Reportes y Análisis de Apiario</h1>
                        <p className="reports-subtitle">Información sensorizada del día: {reportDate}</p>
                    </div>
                    <div className="reports-actions">
                        <button className="action-button download-button" onClick={handleDownloadReport}>
                            <FaDownload /> Descargar
                        </button>
                        <button className="action-button print-button" onClick={handlePrintReport}>
                            <FaPrint /> Imprimir
                        </button>
                    </div>
                </div>

                <div className="report-filters-section">
                    <h2 className="section-title"><FaFilter /> Opciones de Filtrado</h2>
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label htmlFor="reportDate"><FaCalendarAlt /> Fecha del Reporte:</label>
                            <input
                                type="date"
                                id="reportDate"
                                value={reportDate}
                                onChange={(e) => setReportDate(e.target.value)}
                                className="filter-input"
                            />
                        </div>
                        <div className="filter-group">
                            <label htmlFor="hiveSelect"><FaHive /> Seleccionar Colmena:</label>
                            <select
                                id="hiveSelect"
                                value={selectedHive}
                                onChange={(e) => setSelectedHive(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">Todas las Colmenas</option>
                                {uniqueHives.map(hive => (
                                    <option key={hive.id} value={hive.id}>{hive.name}</option>
                                ))}
                            </select>
                        </div>
                        <button className="generate-report-button" onClick={handleGenerateReport}>
                            Generar Reporte
                        </button>
                    </div>
                </div>

                <div className="report-summary-section">
                    <h2 className="section-title"><FaChartLine /> Resumen del Apiario ({reportDate})</h2>
                    <div className="summary-cards-grid">
                        <div className="summary-card status-ok">
                            <FaHive className="summary-icon" />
                            <span className="summary-value">{reportData.overview.healthyHives} / {reportData.overview.totalHives}</span>
                            <span className="summary-label">Colmenas Saludables</span>
                        </div>
                        <div className="summary-card status-alert">
                            <FaExclamationTriangle className="summary-icon" />
                            <span className="summary-value">{reportData.overview.alertHives}</span>
                            <span className="summary-label">Colmenas en Alerta</span>
                        </div>
                        <div className="summary-card status-critical">
                            <FaExclamationTriangle className="summary-icon" />
                            <span className="summary-value">{reportData.overview.criticalHives}</span>
                            <span className="summary-label">Colmenas Críticas</span>
                        </div>
                        <div className="summary-card">
                            <MdOutlineThermostat className="summary-icon" />
                            <span className="summary-value">{reportData.overview.averageTemperature.toFixed(1)}°C</span>
                            <span className="summary-label">Temp. Promedio Apiario</span>
                        </div>
                        <div className="summary-card">
                            <MdOutlineWaterDrop className="summary-icon" />
                            <span className="summary-value">{reportData.overview.averageHumidity.toFixed(1)}%</span>
                            <span className="summary-label">Humedad Promedio Apiario</span>
                        </div>
                        <div className="summary-card">
                            <MdOutlineScale className="summary-icon" />
                            <span className="summary-value">{reportData.overview.averageWeight.toFixed(1)} kg</span>
                            <span className="summary-label">Peso Promedio Apiario</span>
                        </div>
                        <div className="summary-card highlight-card">
                            <GiBee className="summary-icon" />
                            <span className="summary-value">{reportData.overview.totalHoneyHarvestedLastMonth} kg</span>
                            <span className="summary-label">Miel Cosechada (Últ. Mes)</span>
                        </div>
                        <div className="summary-card highlight-card">
                            <FaChartLine className="summary-icon" />
                            <span className="summary-value">{reportData.overview.averageDailyWeightGain.toFixed(1)} kg/día</span>
                            <span className="summary-label">Ganancia de Peso Diaria Prom.</span>
                        </div>
                    </div>
                </div>

                <div className="report-chart-section">
                    <h2 className="section-title"><FaHive /> Datos Sensorizados Diarios por Colmena</h2>
                    {reportData.dailySensorData.length === 0 ? (
                        <p className="no-data-message">No hay datos sensorizados disponibles para esta fecha o colmena.</p>
                    ) : (
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={reportData.dailySensorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                                    <XAxis dataKey="name" stroke="var(--color-mid-text)" />
                                    <YAxis stroke="var(--color-mid-text)" label={{ value: 'Valores', angle: -90, position: 'insideLeft', fill: 'var(--color-mid-text)' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: '8px' }}
                                        labelStyle={{ color: 'var(--color-dark-text)', fontWeight: 'bold' }}
                                        itemStyle={{ color: 'var(--color-mid-text)' }}
                                        formatter={(value, name, props) => {
                                            if (name === 'temperature') return [`${value.toFixed(1)}°C`, 'Temperatura'];
                                            if (name === 'humidity') return [`${value.toFixed(1)}%`, 'Humedad'];
                                            if (name === 'weight') return [`${value.toFixed(1)} kg`, 'Peso'];
                                            return [`${value}`, name];
                                        }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                    <Bar dataKey="temperature" name="Temperatura" fill="#FF7F50" />
                                    <Bar dataKey="humidity" name="Humedad" fill="#6A5ACD" />
                                    <Bar dataKey="weight" name="Peso" fill="#FFC107" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="alert-history-section">
                    <h2 className="section-title"><FaBell /> Historial de Alertas ({reportDate})</h2>
                    {reportData.alertHistory.length === 0 ? (
                        <p className="no-alerts-message">No se encontraron alertas para esta fecha o colmena.</p>
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
                                    {reportData.alertHistory.map(alert => (
                                        <tr key={alert.id}>
                                            <td>{alert.id}</td>
                                            <td>{alert.hiveName}</td>
                                            <td>{alert.type}</td>
                                            <td>{alert.date}</td>
                                            <td className={`alert-status ${alert.status.toLowerCase()}`}>{alert.status}</td>
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
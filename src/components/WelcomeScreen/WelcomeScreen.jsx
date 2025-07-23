// src/pages/WelcomeScreen.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GiBee } from 'react-icons/gi';
// Importamos más iconos para los beneficios
import { FaShieldAlt, FaRocket, FaChartLine } from 'react-icons/fa'; // Iconos para beneficios
import { useInView } from 'react-intersection-observer';
import './WelcomeScreen.css'; // Asegúrate de que este CSS esté actualizado para los nuevos elementos

// --- Componente de Tarjeta Reversible para Características ---
const FeatureFlipCard = ({ title, description }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlipClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMouseEnter = () => {
    setIsFlipped(true);
  };

  const handleMouseLeave = () => {
    setIsFlipped(false);
  };

  return (
    <div
      className={`feature-flip-card-container ${isFlipped ? 'flipped' : ''}`}
      onClick={handleFlipClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="feature-flip-card-inner">
        <div className="feature-flip-card-front">
          <h4 className="feature-card-title">{title}</h4>
        </div>
        <div className="feature-flip-card-back">
          <p className="feature-card-description">{description}</p>
        </div>
      </div>
    </div>
  );
};

// --- Componentes Reutilizables ---
const Header = () => (
  <header className="header">
    <div className="header-logo-container">
      <GiBee className="nav-bee-icon" />
      <h1 className="header-title">Monitor Beehive</h1>
    </div>
    <nav>
      <Link to="/login" className="header-login-btn">
        Iniciar Sesión
      </Link>
    </nav>
  </header>
);

const Footer = () => (
  <footer className="footer">
    <p>&copy; {new Date().getFullYear()} Monitor Beehive. Todos los derechos reservados.</p>
    <div className="footer-links">
      <Link to="/privacy" className="footer-link">Política de Privacidad</Link>
      <Link to="/terms" className="footer-link">Términos y Condiciones</Link>
    </div>
  </footer>
);

// --- Componente Principal de la Pantalla de Bienvenida ---
const WelcomeScreen = () => {
  const { ref: purposeRef, inView: purposeInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { ref: featuresRef, inView: featuresInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { ref: benefitsRef, inView: benefitsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="welcome-container">
      <Header />

      {/* Sección Principal (Hero) - Mejoras visuales y enfoque */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h2 className="hero-title">
            Apicultura de Precisión con <span className="hero-highlight">Monitor Beehive</span>
          </h2>
          <p className="hero-subtitle">
            Transforma la gestión de tus colmenas con monitoreo inteligente en tiempo real y análisis predictivo para una apicultura más eficiente y sostenible.
          </p>
          <Link to="/login" className="hero-cta-button">
            Comienza Ahora
          </Link>
          {/* Opcional: una flecha que indique scroll hacia abajo para guiar al usuario */}
          <div className="scroll-indicator">
            <span className="scroll-arrow">&#x2193;</span> {/* Flecha hacia abajo */}
            <p className="scroll-text">Explora más</p>
          </div>
        </div>
      </section>

      {/* Sección Propósito - Animada desde abajo */}
      <div ref={purposeRef} className={`animation-wrapper ${purposeInView ? 'is-visible' : ''}`}>
        <section className="section purpose-section">
          <h3 className="section-title">Nuestro Propósito</h3>
          <p className="purpose-text">
            El manejo tradicional de colmenas enfrenta desafíos como la detección tardía de enfermedades, estrés
            y condiciones ambientales adversas. Monitor Beehive utiliza sensores IoT avanzados y algoritmos de IA
            para proporcionarte información crucial, permitiéndote tomar decisiones proactivas y asegurar la salud
            y productividad de tus abejas. Con nosotros, la trazabilidad y la prevención son la clave.
          </p>
        </section>
      </div>

      {/* Sección Características Destacadas - Animada desde la izquierda */}
      <div ref={featuresRef} className={`animation-wrapper from-left ${featuresInView ? 'is-visible' : ''}`}>
        <section className="section features-section">
          <h3 className="section-title">Características Destacadas</h3>
          <div className="features-grid">
            {[
              { title: 'Monitoreo en Tiempo Real', description: 'Peso, humedad, temperatura y sonido directamente desde la colmena.' },
              { title: 'Análisis Inteligente con IA', description: 'Clasificación de sonidos para identificar comportamientos inusuales y posibles amenazas.' },
              { title: 'Alertas Personalizadas', description: 'Notificaciones inmediatas sobre cualquier anomalía que requiera tu atención.' },
              { title: 'Informes Históricos', description: 'Accede a datos históricos y reportes descargables para análisis detallados.' },
              { title: 'Conectividad Ampliada (LoRa)', description: 'Cobertura confiable incluso en los entornos rurales más remotos.' },
              { title: 'Plataforma Intuitiva', description: 'Visualiza y gestiona todas tus colmenas desde una interfaz web y móvil fácil de usar.' }
            ].map((feature, index) => (
              <FeatureFlipCard
                key={index}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Sección Beneficios - Animada desde la derecha y con íconos */}
      <div ref={benefitsRef} className={`animation-wrapper from-right ${benefitsInView ? 'is-visible' : ''}`}>
        <section className="section benefits-section">
          <h3 className="section-title">Beneficios Clave</h3>
          <div className="benefits-grid">
            <div className="benefit-card">
              <FaShieldAlt className="benefit-icon" /> {/* Ícono de anticipación */}
              <h4 className="benefit-card-title">Anticipación Proactiva</h4>
              <p className="benefit-card-description">Identifica problemas antes de que afecten gravemente a tus colmenas, evitando pérdidas.</p>
            </div>
            <div className="benefit-card">
              <FaRocket className="benefit-icon" /> {/* Ícono de optimización */}
              <h4 className="benefit-card-title">Optimización Eficiente</h4>
              <p className="benefit-card-description">Minimiza las visitas innecesarias, reduciendo el estrés de las abejas y optimizando tu tiempo.</p>
            </div>
            <div className="benefit-card">
              <FaChartLine className="benefit-icon" /> {/* Ícono de datos */}
              <h4 className="benefit-card-title">Decisiones Basadas en Datos</h4>
              <p className="benefit-card-description">Accede a información precisa para mejorar la salud de la colmena y la producción de miel a largo plazo.</p>
            </div>
          </div>
          <div className="benefits-cta-container">
            <Link to="/login" className="benefits-cta-button">
              Descubre Monitor Beehive
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default WelcomeScreen;
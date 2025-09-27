import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { GiBee } from 'react-icons/gi';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import '../LoginScreen/LoginScreen.css';
import AuthContext from '../../context/AuthProvider';
import axios from 'axios';
import { API_URL } from '../../helpers/apiURL';

function ForgotPasswordScreen() {
    // Stage 1: Ingresar correo
    const [email, setEmail] = useState('');
    
    // Stage 2: Ingresar código
    const [code, setCode] = useState('');

    // Stage 3: Ingresar nueva contraseña
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState('code'); // Estado actual del flujo
    const navigate = useNavigate();
    const {correo, codigo, setCorreo, setCodigo} = useContext(AuthContext);
    // Ref para el input de código
    const codeInputRef = useRef(null);
    
    // Nuevo estado y hook para el confeti
    const [showConfetti, setShowConfetti] = useState(false);
    const { width, height } = useWindowSize();

    // Efecto para enfocar el input de código cuando el 'stage' cambia
    useEffect(() => {
        if (stage === 'code' && codeInputRef.current) {
            codeInputRef.current.focus();
        }
    }, [stage]);


    // Simula la verificación del código
    const handleCodeSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        if (code.length !== 4) {
            setError('El código debe ser de 4 dígitos.');
            setLoading(false);
            return;
        }
        try {
            // Lógica de simulación para verificar el código
            console.log('Verificando código:', code);
            if (code === codigo) {
                // Si el código es correcto (aquí simulamos que siempre lo es), avanza
                setStage('new-password');
                setError('');
                setCodigo("");
            }
            
        } catch (err) {
            setError('El código ingresado es incorrecto. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Simula el restablecimiento de la contraseña
    const handlePasswordReset = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        if (newPassword.length < 5) {
            setError('La contraseña debe tener al menos 5 caracteres.');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            // Lógica de simulación para guardar la nueva contraseña
            console.log('Restableciendo contraseña...');
            const data = {nueva_password: newPassword, email: correo}
            const response = await axios.post(`${API_URL}/auth/resetear-clave`, data);
            if (response.status === 200){
                // Si tiene éxito, activa el confeti y cambia a la etapa de éxito
                setStage('success');
                setShowConfetti(true);
                setCorreo("");
                // Oculta el confeti y redirige después de un breve momento
                setTimeout(() => {
                    setShowConfetti(false);
                    navigate('/login');
                }, 5000);
            }
        } catch (err) {
            setError('Ocurrió un error al restablecer la contraseña. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };
    
    // Función para volver al estado anterior
    const handleBack = () => {
        if (stage === 'code') {
            setStage('email');
        } else if (stage === 'new-password') {
            setStage('code');
        }
    };

    // Renderiza el componente según el "stage" actual
    const renderContent = () => {
        switch (stage) {
            case 'code':
                return (
                    <>
                        <h3 className="form-subtitle">Ingresa el Código</h3>
                        <p className="form-description">Hemos enviado un código de 4 dígitos a tu correo. Por favor, revísalo.</p>
                        <form onSubmit={handleCodeSubmit} className="login-form">
                            <div className="form-group code-input-container">
                                <label htmlFor="code" className="sr-only">Código de Verificación:</label>
                                <div className="code-display">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <span key={index} className="code-box">
                                            {code[index] || ''}
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="tel"
                                    id="code"
                                    className="login-input code-input"
                                    value={code}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                                        setCode(value);
                                    }}
                                    required
                                    maxLength="4"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    ref={codeInputRef}
                                />
                            </div>
                            {error && <p className={`error-message ${error ? 'show' : ''}`} role="alert">{error}</p>}
                            <button type="submit" className="login-button" disabled={loading}>
                                {loading ? 'Verificando...' : 'Verificar Código'}
                            </button>
                            <p className="back-to-login">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleBack(); }}>
                                    <FaArrowLeft className="back-icon" /> Volver
                                </a>
                            </p>
                        </form>
                    </>
                );
            case 'new-password':
                return (
                    <>
                        <h3 className="form-subtitle">Crear Nueva Contraseña</h3>
                        <p className="form-description">Ingresa y confirma tu nueva contraseña.</p>
                        <form onSubmit={handlePasswordReset} className="login-form">
                            <div className="form-group password-field">
                                <label htmlFor="new-password" className="input-label">Nueva Contraseña:</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        id="new-password"
                                        className="login-input"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                    />
                                    <span 
                                        className="password-toggle-icon"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                            </div>
                            <div className="form-group password-field">
                                <label htmlFor="confirm-password" className="input-label">Confirmar Contraseña:</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirm-password"
                                        className="login-input"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                    />
                                    <span 
                                        className="password-toggle-icon"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                            </div>
                            {error && <p className={`error-message ${error ? 'show' : ''}`} role="alert">{error}</p>}
                            <button type="submit" className="login-button" disabled={loading}>
                                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                            </button>
                            <p className="back-to-login">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleBack(); }}>
                                    <FaArrowLeft className="back-icon" /> Volver
                                </a>
                            </p>
                        </form>
                    </>
                );
            case 'success':
                return (
                    <div className="success-message-container">
                        <div className="success-icon-wrapper">
                            <FaCheckCircle className="success-check-icon" />
                        </div>
                        <h3 className="form-subtitle">¡Contraseña Cambiada!</h3>
                        <p className="form-description">Tu contraseña ha sido restablecida exitosamente.</p>
                        <p className="redirect-message">Serás redirigido al inicio de sesión en breve.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="login-screen-container">
            {showConfetti && <Confetti width={width} height={height} />}
            <div className="honeycomb-background-pattern"></div>
            <GiBee className="animated-bee bee-1" aria-hidden="true" />
            <GiBee className="animated-bee bee-2" aria-hidden="true" />
            <GiBee className="animated-bee bee-3" aria-hidden="true" />

            <div className="login-box">
                {/* ESTE ES EL BLOQUE QUE DEBES REEMPLAZAR */}
                <div className="forgot-password-logo-container">
                    <GiBee className="login-bee-icon" aria-hidden="true" />
                    <h2 className="login-title">Monitor Beehive</h2>
                </div>
                <p className="welcome-phrase">¡Recupera tu acceso a la colmena!</p>

                {renderContent()}
            </div>
        </div>
    );
}

export default ForgotPasswordScreen;
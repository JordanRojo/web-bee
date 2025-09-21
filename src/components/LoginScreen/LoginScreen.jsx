import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginScreen.css';

import { GiBee } from 'react-icons/gi';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// --- Funciones de validación y formateo de RUT (sin cambios) ---
const formatRut = (rut) => {
    if (!rut) return '';
    rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (rut.length <= 1) {
        return rut;
    }
    let rutBody = rut.slice(0, -1);
    let dv = rut.slice(-1);
    if (!/^[0-9]+$/.test(rutBody)) {
        return rut;
    }
    let formattedRutBody = '';
    let j = 0;
    for (let i = rutBody.length - 1; i >= 0; i--) {
        formattedRutBody = rutBody[i] + formattedRutBody;
        j++;
        if (j % 3 === 0 && i !== 0) {
            formattedRutBody = '.' + formattedRutBody;
        }
    }
    return formattedRutBody + '-' + dv;
};

const validateRut = (rut) => {
    const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (!rutLimpio || rutLimpio.length <= 1) {
        return false;
    }
    const cuerpoRut = rutLimpio.slice(0, -1);
    const digitoVerificador = rutLimpio.slice(-1);
    if (!/^[0-9]+$/.test(cuerpoRut)) {
        return false;
    }
    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpoRut.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpoRut.charAt(i), 10) * multiplicador;
        multiplicador = (multiplicador === 7) ? 2 : multiplicador + 1;
    }
    const resto = suma % 11;
    const dvCalculado = 11 - resto;
    if (dvCalculado === 11) {
        return digitoVerificador === '0';
    } else if (dvCalculado === 10) {
        return digitoVerificador === 'K';
    } else {
        return digitoVerificador === dvCalculado.toString();
    }
};

// --- Fin funciones de RUT ---

function LoginScreen() {
    const [rut, setRut] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const rutInputRef = useRef(null);
    const navigate = useNavigate();

    const handleRutChange = (e) => {
        const input = e.target;
        const prevSelectionStart = input.selectionStart;
        const prevValue = input.value;
        const newFormattedRut = formatRut(input.value);
        setRut(newFormattedRut);
        const lengthDiff = newFormattedRut.length - prevValue.length;
        if (rutInputRef.current) {
            setTimeout(() => {
                const newCursorPosition = prevSelectionStart + lengthDiff;
                rutInputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
            }, 0);
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
        const rutDePrueba = '213715313';
        const contrasenaDePrueba = '12345';

        if (!rut) {
            setError('Por favor, ingresa tu RUT.');
            setLoading(false);
            return;
        }
        if (!password) {
            setError('Por favor, ingresa tu contraseña.');
            setLoading(false);
            return;
        }
        if (!validateRut(rut)) {
            setError('El RUT ingresado no es válido. Por favor, verifica el formato y el dígito verificador.');
            setLoading(false);
            return;
        }
        
        if (rutLimpio !== rutDePrueba) {
            setError('RUT incorrecto. Por favor, inténtalo de nuevo.');
            setLoading(false);
            return;
        }
        if (password !== contrasenaDePrueba) {
            setError('Contraseña incorrecta. Por favor, inténtalo de nuevo.');
            setLoading(false);
            return;
        }

        try {
            const response = await new Promise(resolve => setTimeout(() => {
                resolve({ success: true, message: 'Inicio de sesión exitoso' });
            }, 2000));

            if (response.success) {
                console.log('Inicio de sesión exitoso:', response.message);
                navigate('/dashboard');
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('Ocurrió un error de conexión. Por favor, inténtalo de nuevo.');
            console.error('Error de login:', err);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-screen-container">
            <div className="honeycomb-background-pattern"></div>
            <GiBee className="animated-bee bee-1" aria-hidden="true" />
            <GiBee className="animated-bee bee-2" aria-hidden="true" />
            <GiBee className="animated-bee bee-3" aria-hidden="true" />

            <div className="login-box">
                <GiBee className="login-bee-icon" aria-hidden="true" />
                <h2 className="login-title">Monitor Beehive</h2>
                <p className="welcome-phrase">¡Ingresa y sé parte de la colmena!</p>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="rut" className="input-label">RUT:</label>
                        <input
                            type="text"
                            id="rut"
                            className="login-input"
                            value={rut}
                            onChange={handleRutChange}
                            required
                            aria-label="RUT"
                            placeholder="Ej: 12.345.678-9"
                            autoComplete="off"
                            maxLength="12"
                            ref={rutInputRef}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="input-label">Contraseña:</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                className="login-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                aria-label="Contraseña"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="toggle-password-button"
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    {error && <p className={`error-message ${error ? 'show' : ''}`} role="alert">{error}</p>}
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                    <p className="forgot-password">
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            navigate('/forgot-password'); // Redirige a la nueva ruta
                        }}>¿Olvidaste tu contraseña?</a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default LoginScreen;
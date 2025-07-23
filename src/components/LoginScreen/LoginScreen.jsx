import React, { useState, useRef } from 'react'; // Importamos useRef
import './LoginScreen.css';

// Importa los iconos necesarios de React Icons
import { GiBee } from 'react-icons/gi'; // Icono de abeja
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa'; // Iconos para mostrar/ocultar contraseña y flecha de retorno

// --- Funciones de validación y formateo de RUT ---
// Modificada para evitar el salto de cursor y mejorar la experiencia
const formatRut = (rut) => {
  if (!rut) return '';

  // 1. Limpiar el RUT: solo números y K/k
  rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();

  // 2. Separar número y dígito verificador (DV)
  let rutBody = rut.slice(0, -1);
  let dv = rut.slice(-1);

  // Si solo hay números, sin DV, o si se está borrando
  if (rut.length <= 1 || dv === '' || rutBody === '') {
    return rut; // Dejarlo como está, sin puntos ni guion
  }

  // 3. Formatear el cuerpo del RUT con puntos
  let formattedRutBody = '';
  let j = 0;
  for (let i = rutBody.length - 1; i >= 0; i--) {
    formattedRutBody = rutBody[i] + formattedRutBody;
    j++;
    if (j % 3 === 0 && i !== 0) {
      formattedRutBody = '.' + formattedRutBody;
    }
  }

  // 4. Unir el cuerpo formateado con el DV
  return formattedRutBody + '-' + dv;
};

// La función validateRut se mantiene igual
const validateRut = (rut) => {
  if (!/^[0-9]+[-|‐]{1}[0-9kK]$/.test(rut)) {
    return false; // Formato básico incorrecto
  }

  let tmp = rut.split('-');
  let digv = tmp[1];
  let rut_sin_dv = tmp[0].replace(/\./g, ''); // Eliminar puntos para la validación del DV

  if (digv === 'K') digv = 'k';

  let M = 0;
  let S = 1;
  for (; rut_sin_dv; rut_sin_dv = Math.floor(rut_sin_dv / 10)) {
    S = (S + rut_sin_dv % 10 * (9 - M++ % 6)) % 11;
  }
  return S ? String.fromCharCode(S + 48) === digv : 'k' === digv;
};
// --- Fin funciones de RUT ---

function LoginScreen() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordRut, setForgotPasswordRut] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Referencias para los inputs de RUT para manejar el cursor
  const rutInputRef = useRef(null);
  const forgotRutInputRef = useRef(null);


  // Manejador para el cambio en el input de RUT (LOGIN)
  const handleRutChange = (e) => {
    const input = e.target;
    const previousValue = input.value;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    // Obtener el valor sin formatear para calcular la nueva posición
    const rawValueBeforeFormat = previousValue.replace(/[^0-9kK]/g, '');

    const newFormattedRut = formatRut(input.value);
    setRut(newFormattedRut);

    // Calcular la diferencia en longitud debido al formateo
    const lengthDiff = newFormattedRut.length - previousValue.length;

    // Ajustar la posición del cursor si el formateo añadió/removió caracteres antes del cursor
    // Esto es un poco más complejo y a veces requiere una lógica más robusta.
    // Para simplificar, si se añadió un punto o guion, se mueve el cursor hacia adelante.
    if (rutInputRef.current) {
      setTimeout(() => { // Pequeño retraso para que React actualice el DOM
        const newCursorPosition = start + lengthDiff;
        // Evitar que el cursor se salga del campo
        rutInputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
  };

  // Manejador para el cambio en el input de RUT en "Olvidé mi contraseña"
  const handleForgotPasswordRutChange = (e) => {
    const input = e.target;
    const previousValue = input.value;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    const rawValueBeforeFormat = previousValue.replace(/[^0-9kK]/g, '');

    const newFormattedRut = formatRut(input.value);
    setForgotPasswordRut(newFormattedRut);

    const lengthDiff = newFormattedRut.length - previousValue.length;

    if (forgotRutInputRef.current) {
      setTimeout(() => {
        const newCursorPosition = start + lengthDiff;
        forgotRutInputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
  };


  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!rut || !password) {
      setError('Por favor, ingresa tu RUT y contraseña.');
      setLoading(false);
      document.querySelector('.error-message').classList.add('show');
      return;
    }

    // Validar el RUT antes de la llamada a la API
    if (!validateRut(rut)) {
      setError('El RUT ingresado no es válido. Por favor, verifica el formato y el dígito verificador.');
      setLoading(false);
      document.querySelector('.error-message').classList.add('show');
      return;
    }

    try {
      const response = await new Promise(resolve => setTimeout(() => {
        // Asegúrate de que este RUT de prueba sea válido según tu función validateRut
        // Por ejemplo, '12.345.678-9' es un RUT válido.
        if (rut === '12.345.678-9' && password === 'miContrasenaSegura') {
          resolve({ success: true, message: 'Inicio de sesión exitoso' });
        } else {
          resolve({ success: false, message: 'RUT o contraseña incorrectos.' });
        }
      }, 2000));

      if (response.success) {
        console.log('Inicio de sesión exitoso:', response.message);
        alert('¡Inicio de sesión exitoso! Redirigiendo al dashboard...');
      } else {
        setError(response.message);
        document.querySelector('.error-message').classList.add('show');
      }
    } catch (err) {
      setError('Ocurrió un error de conexión. Por favor, inténtalo de nuevo.');
      console.error('Error de login:', err);
      document.querySelector('.error-message').classList.add('show');
    } finally {
      setLoading(false);
      if (!response || !response.success) {
        setTimeout(() => {
          document.querySelector('.error-message')?.classList.remove('show');
        }, 3000);
      }
    }
  };

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!forgotPasswordRut) {
      setError('Por favor, ingresa tu RUT para recuperar la contraseña.');
      setLoading(false);
      document.querySelector('.error-message').classList.add('show');
      return;
    }

    // Validar el RUT antes de la llamada a la API
    if (!validateRut(forgotPasswordRut)) {
      setError('El RUT ingresado no es válido. Por favor, verifica el formato y el dígito verificador.');
      setLoading(false);
      document.querySelector('.error-message').classList.add('show');
      return;
    }

    try {
      const response = await new Promise(resolve => setTimeout(() => {
        // Usa el mismo RUT de prueba válido para la simulación
        if (forgotPasswordRut === '12.345.678-9') {
          resolve({ success: true, message: 'Si el RUT está registrado, recibirás un correo electrónico con instrucciones para restablecer tu contraseña.' });
        } else {
          resolve({ success: false, message: 'Si el RUT está registrado, recibirás un correo electrónico con instrucciones para restablecer tu contraseña.' });
        }
      }, 2500));

      if (response.success) {
        setSuccessMessage(response.message);
        setForgotPasswordRut('');
        document.querySelector('.error-message')?.classList.remove('show');
      } else {
        setError(response.message);
        document.querySelector('.error-message').classList.add('show');
      }
    } catch (err) {
      setError('Ocurrió un error al intentar recuperar la contraseña. Por favor, inténtalo de nuevo.');
      console.error('Error al recuperar contraseña:', err);
      document.querySelector('.error-message').classList.add('show');
    } finally {
      setLoading(false);
      if (!successMessage) {
        setTimeout(() => {
          document.querySelector('.error-message')?.classList.remove('show');
        }, 5000);
      }
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

        {!showForgotPassword ? (
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
                e.preventDefault(); // Evitar el desplazamiento de la página
                setShowForgotPassword(true);
                setError('');
                setSuccessMessage('');
              }}>¿Olvidaste tu contraseña?</a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit} className="login-form forgot-password-form">
            <h3 className="form-subtitle">Restablecer Contraseña</h3>
            <p className="form-description">Ingresa tu RUT y te enviaremos instrucciones para restablecer tu contraseña.</p>
            
            <div className="form-group">
              <label htmlFor="forgotRut" className="input-label">RUT:</label>
              <input
                type="text"
                id="forgotRut"
                className="login-input"
                value={forgotPasswordRut}
                onChange={handleForgotPasswordRutChange}
                required
                aria-label="RUT para restablecer contraseña"
                placeholder="Ej: 12.345.678-9"
                autoComplete="off"
                maxLength="12"
                ref={forgotRutInputRef}
              />
            </div>

            {error && <p className={`error-message ${error ? 'show' : ''}`} role="alert">{error}</p>}
            {successMessage && <p className="success-message show" role="status">{successMessage}</p>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Instrucciones'}
            </button>

            <p className="back-to-login">
              <a href="#" onClick={(e) => {
                e.preventDefault(); // Evitar el desplazamiento de la página
                setShowForgotPassword(false);
                setError('');
                setSuccessMessage('');
              }}>
                <FaArrowLeft className="back-icon" /> Volver al Inicio de Sesión
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginScreen;
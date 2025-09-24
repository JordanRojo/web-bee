import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaHive,
  FaMapMarkerAlt,
  FaImage,
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaExpandAlt,
  FaRegTimesCircle,
} from "react-icons/fa"; // Importa nuevos íconos
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./HiveManagementScreen.css";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import AlertMessage from "../AlertMessage/AlertMessage";
import ImageModal from "../ImageModal/ImageModal"; // Importa el nuevo componente de modal de imagen
import axios from "axios";
import AuthContext from "../../context/AuthProvider";
import { API_URL } from "../../helpers/apiURL";

// Datos de colmenas de ejemplo (se actualizarán a medida que agregemos/editemos)
const initialHives = [
  {
    id: "h1",
    name: "Colmena 001",
    apiaryName: "Apiario del Sol",
    hiveImage: "https://placehold.co/150x150/FFD700/000000?text=Colmena001",
  },
  {
    id: "h2",
    name: "Colmena 002",
    apiaryName: "Apiario de la Luna",
    hiveImage: "https://placehold.co/150x150/C0C0C0/000000?text=Colmena002",
  },
  {
    id: "h3",
    name: "Colmena 003",
    apiaryName: "Apiario del Río",
    hiveImage: "https://placehold.co/150x150/ADD8E6/000000?text=Colmena003",
  },
  {
    id: "h4",
    name: "Colmena 004",
    apiaryName: "Apiario de la Montaña",
    hiveImage: "",
  }, // Colmena sin imagen para probar el placeholder
];

const HiveManagementScreen = () => {
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingHive, setEditingHive] = useState(null);
  const [hiveName, setHiveName] = useState("");
  const [apiaryName, setApiaryName] = useState("");
  const [hiveImagePreview, setHiveImagePreview] = useState("");
  const [hiveImageFile, setHiveImageFile] = useState(null);
  const [hiveImageBase64, setHiveImageBase64] = useState(""); // <-- NUEVO ESTADO para la imagen en Base64

  const [removingHiveId, setRemovingHiveId] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [hiveToDelete, setHiveToDelete] = useState(null);

  // Nuevos estados para la ampliación de imagen
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageToDisplayInModal, setImageToDisplayInModal] = useState("");
  const { userToken, userId, config } = useContext(AuthContext);

  const navigate = useNavigate();
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const response = await axios.get(
          `${API_URL}/colmenas/obtener-todas-colmenas`,
          config
        );
        if (response.status === 200) {
          setHives(response.data);
          console.log(response.data);
        } else if (response.status === 204) {
          alert("No hay colmenas registradas en la base de datos.");
          setHives(initialHives);
        }
      } catch (error) {
        console.error("Error encontrado: ", error);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  // Limpiar la URL de objeto cuando el componente se desmonte o la imagen de previsualización cambie
  useEffect(() => {
    return () => {
      if (hiveImagePreview && hiveImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(hiveImagePreview);
      }
    };
  }, [hiveImagePreview]);

  const generateUniqueId = () => {
    return `h_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Revocar URL blob: anterior si existe
      if (hiveImagePreview && hiveImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(hiveImagePreview);
      }

      // Crear URL blob: para la previsualización inmediata en el formulario
      const objectUrl = URL.createObjectURL(file);
      setHiveImagePreview(objectUrl);
      setHiveImageFile(file);

      // Leer archivo como Base64 para guardarlo de forma "persistente" en el estado
      const reader = new FileReader();
      reader.onloadend = () => {
        setHiveImageBase64(reader.result); // Guarda la cadena Base64
      };
      reader.readAsDataURL(file); // Lee el archivo como una URL de datos (Base64)
    } else {
      setHiveImagePreview("");
      setHiveImageFile(null);
      setHiveImageBase64(""); // Limpiar también la cadena Base64
    }
  };

  const handleSaveHive = (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ message: "", type: "" });
    let imageToSave = "";
    if (hiveImageFile && hiveImageBase64) {
      // Si hay un nuevo archivo seleccionado Y ya se ha convertido a Base64, usamos el Base64
      imageToSave = hiveImageBase64; // <-- ¡Este es el cambio clave!
    } else if (editingHive && editingHive.hiveImage) {
      // Si estamos editando y no se seleccionó un nuevo archivo, mantenemos la imagen existente.
      imageToSave = editingHive.hiveImage;
    } else if (hiveImagePreview && hiveImagePreview.startsWith("http")) {
      // Caso donde hiveImagePreview podría ser una URL remota de una edición
      imageToSave = hiveImagePreview;
    } else {
      // Si no hay imagen, usar el placeholder genérico de "No Image"
      imageToSave = "https://placehold.co/150x150/CCCCCC/000000?text=No+Image";
    }

    const newHiveData = new FormData();
    newHiveData.append("nombre_colmena", hiveName);
    newHiveData.append("nombre_apiario", apiaryName);
    newHiveData.append("foto_colmena", hiveImageFile);
    newHiveData.append("id_apicultor", userId);
    console.log(newHiveData);
    setTimeout(async () => {
      if (editingHive) {
        try {
          const response = await axios.put(
            `${API_URL}/colmenas/actualizar-colmena/${editingHive.colmena_id}`,
            newHiveData,
            config
          );
          if (response.status === 200) {
            setHives(response.data);
            setAlert({
              message: "¡Colmena actualizada con éxito!",
              type: "success",
            });
          } else if (response.status === 204) {
            alert("No se realizaron cambios en la colmena.");
          }
        } catch (error) {
          console.error("Error encontrado: ", error);
        }
      } else {
        try {
          const response = await axios.post(
            `${API_URL}/colmenas/agregar-colmena`,
            newHiveData,
            config
          );
          if (response.data && response.status === 201) {
            setHives(response.data);
            setAlert({
              message: "¡Nueva colmena agregada con éxito!",
              type: "success",
            });
          } else {
            console.log("Error al agregar la colmena");
          }
        } catch (error) {
          console.error("Error: ", error);
        }
      }
      setLoading(false);
      setShowForm(false);
      resetForm(); // Esto limpiará la URL blob: y Base64 de la previsualización del formulario.
    }, 800);
  };

  const handleEditHive = (hive) => {
    setAlert({ message: "", type: "" });
    setEditingHive(hive);
    setHiveName(hive.nombre_colmena);
    setApiaryName(hive.nombre_apiario || "");
    setHiveImagePreview(hive.foto_colmena_url || ""); // Muestra la URL existente (sea remota o Base64) o vacía
    setHiveImageFile(null); // Asegura que no haya un archivo pendiente de una carga anterior
    // setHiveImageBase64(
    //   hive.foto_colmena_url && hive.foto_colmena_urlo.startsWith("data:") ? hive.hiveImage : ""
    // ); // Carga Base64 si ya existía
    setShowForm(true);

    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const confirmDeleteHive = (hiveId) => {
    setAlert({ message: "", type: "" });
    setHiveToDelete(hiveId);
    setIsConfirmModalOpen(true);
  };

  const handleActualDeleteHive = () => {
    if (hiveToDelete) {
      setLoading(true);
      setAlert({ message: "", type: "" });
      setRemovingHiveId(hiveToDelete);
      setTimeout(async () => {
        try {
          const response = await axios.delete(
            `${API_URL}/colmenas/eliminar-colmena/${hiveToDelete}`,
            config
          );
          if (response.status === 200) {
            setAlert({
              message: "Colmena eliminada con éxito.",
              type: "success",
            });
          } else if (response.status === 404) {
            alert("No se pudo eliminar la colmena.");
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
          setRemovingHiveId(null);
          setHiveToDelete(null);
          setIsConfirmModalOpen(false);
        }
      }, 400);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setHiveToDelete(null);
    setAlert({ message: "Operación de eliminación cancelada.", type: "info" });
  };

  const resetForm = () => {
    setEditingHive(null);
    setHiveName("");
    setApiaryName("");
    // Importante: si hiveImagePreview es un blob, hay que revocarlo para liberar memoria
    if (hiveImagePreview && hiveImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(hiveImagePreview);
    }
    setHiveImagePreview("");
    setHiveImageFile(null);
    setHiveImageBase64(""); // <-- Limpiar también el Base64
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Limpia el input de archivo visualmente
    }
  };

  const handleAddHiveClick = () => {
    setAlert({ message: "", type: "" });
    resetForm();
    setShowForm(true);
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleDismissAlert = () => {
    setAlert({ message: "", type: "" });
  };

  // Funciones para el modal de imagen
  const openImageModal = (imageSrc) => {
    setImageToDisplayInModal(imageSrc);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setImageToDisplayInModal("");
  };

  // Función para descartar la imagen de previsualización (del formulario)
  const handleDiscardImage = () => {
    if (hiveImagePreview && hiveImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(hiveImagePreview);
    }
    setHiveImagePreview("");
    setHiveImageFile(null);
    setHiveImageBase64(""); // <-- Limpiar también el Base64
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Limpia el input de archivo visualmente
    }
    setAlert({ message: "Imágen descartada correctamente.", type: "success" });
    // No enviamos un alert aquí, ya que el descarte es una acción del usuario en el formulario
  };

  if (loading && hives.length === 0) {
    return (
      <div className="loading-screen">
        <p>Cargando colmenas...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="hive-management-screen-container">
      <nav className="hive-management-navbar">
        <Link to="/dashboard" className="nav-link">
          <FaArrowLeft /> Volver al Dashboard
        </Link>
      </nav>

      <div className="hive-management-content">
        <div className="hive-management-header-section">
          <FaHive className="hive-management-icon" />
          <div className="hive-management-title-group">
            <h1 className="hive-management-title">Gestión de Colmenas</h1>
            <p className="hive-management-subtitle">
              Añade, edita o elimina las colmenas de tu apiario.
            </p>
          </div>
          <button className="add-hive-button" onClick={handleAddHiveClick}>
            <FaPlus /> Añadir Nueva Colmena
          </button>
        </div>

        <AlertMessage
          message={alert.message}
          type={alert.type}
          onDismiss={handleDismissAlert}
        />

        <CSSTransition
          in={showForm}
          nodeRef={formRef}
          timeout={300}
          classNames="hive-form"
          unmountOnExit
        >
          <div className="hive-form-container" ref={formRef}>
            <h2 className="section-title">
              {editingHive ? "Editar Colmena" : "Añadir Nueva Colmena"}
            </h2>
            <form
              onSubmit={handleSaveHive}
              className="hive-form"
              encType="multipart-form-data"
            >
              <div className="form-group">
                <label htmlFor="hiveName">Nombre de la Colmena:</label>
                <input
                  type="text"
                  name="nombre_colmena"
                  id="hiveName"
                  placeholder={editingHive ? editingHive.nombre_colmena : ""}
                  value={hiveName}
                  onChange={(e) => setHiveName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="apiaryName">Nombre del Apiario:</label>
                <input
                  type="text"
                  name="nombre_apiario"
                  id="apiaryName"
                  value={apiaryName}
                  placeholder={editingHive ? editingHive.nombre_apiario : ""}
                  onChange={(e) => setApiaryName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group full-width file-input-group">
                <label htmlFor="hiveImageFile">Imagen de la Colmena:</label>
                <input
                  type="file"
                  id="hiveImageFile"
                  accept="image/*"
                  name="foto_apiario"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="form-input-file"
                />
                {/* Se muestra la previsualización: preferimos hiveImagePreview (blob) si está, sino la imagen actual (Base64 o URL remota) */}
                {(hiveImagePreview ||
                  (editingHive && editingHive.hiveImage)) && (
                  <div className="image-preview">
                    <img
                      src={hiveImagePreview || editingHive.hiveImage}
                      alt="Vista previa de la colmena"
                      className="form-image-preview"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/150x150/CCCCCC/000000?text=No+Image";
                      }}
                    />
                    <p className="image-preview-text">
                      {hiveImagePreview.startsWith("blob:")
                        ? "Imagen local seleccionada"
                        : "Imagen actual (URL)"}
                    </p>
                    <div className="image-preview-actions">
                      {" "}
                      {/* Nuevos botones */}
                      <button
                        type="button"
                        className="action-button expand-button"
                        onClick={() =>
                          openImageModal(
                            hiveImagePreview ||
                              (editingHive && editingHive.hiveImage) ||
                              "https://placehold.co/150x150/CCCCCC/000000?text=No+Image"
                          )
                        }
                      >
                        <FaExpandAlt /> Ampliar
                      </button>
                      <button
                        type="button"
                        className="action-button discard-button"
                        onClick={handleDiscardImage}
                      >
                        <FaRegTimesCircle /> Descartar
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? (
                    "Guardando..."
                  ) : (
                    <>
                      <FaSave /> Guardar Colmena
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  <FaTimes /> Cancelar
                </button>
              </div>
            </form>
          </div>
        </CSSTransition>

        <div className="hive-list-section">
          <h2 className="section-title">Tus Colmenas Registradas</h2>
          {hives.length === 0 && !showForm ? (
            <p className="no-hives-message">
              No tienes colmenas registradas. ¡Añade una!
            </p>
          ) : (
            <TransitionGroup className="hive-cards-grid">
              {hives.map((hive) => (
                <CSSTransition
                  key={hive._id}
                  timeout={400}
                  classNames={{
                    exit: "removing",
                    enter: "added",
                  }}
                  nodeRef={React.createRef()}
                >
                  <div
                    className={`hive-card ${
                      removingHiveId === hive._id ? "removing" : ""
                    }`}
                    ref={React.createRef()}
                  >
                    {/* El contenedor de imagen siempre se renderiza */}
                    <div className="hive-card-image-container">
                      <img
                        // Aquí se aplica la lógica para mostrar la imagen o el placeholder
                        src={
                          hive.foto_colmena_url
                            ? hive.foto_colmena_url
                            : "https://placehold.co/150x150/CCCCCC/000000?text=No+Image"
                        }
                        alt={`Colmena ${hive.nombre_colmena}`}
                        className="hive-card-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/150x150/CCCCCC/000000?text=No+Image";
                        }}
                      />
                      <div className="hive-card-image-overlay">
                        {" "}
                        {/* Overlay para botón de ampliar */}
                        <button
                          className="expand-card-image-button"
                          onClick={() =>
                            openImageModal(
                              hive.foto_colmena_url
                                ? hive.foto_colmena_url
                                : "https://placehold.co/150x150/CCCCCC/000000?text=No+Image"
                            )
                          }
                        >
                          <FaExpandAlt />
                        </button>
                      </div>
                    </div>
                    <h3>
                      <FaHive /> {hive.nombre_colmena}
                    </h3>
                    <p>
                      <FaMapMarkerAlt /> Apiario: {hive.nombre_apiario}
                    </p>
                    <div className="hive-card-actions">
                      <button
                        className="edit-button"
                        onClick={() => handleEditHive(hive)}
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => confirmDeleteHive(hive.colmena_id)}
                      >
                        <FaTrash /> Eliminar
                      </button>
                    </div>
                    <Link
                      to={`/colmena/${hive._id}`}
                      className="view-detail-link"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </CSSTransition>
              ))}
            </TransitionGroup>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleActualDeleteHive}
        title="Confirmar Eliminación"
        message={
          hiveToDelete
            ? `Estás a punto de eliminar la colmena "${
                hives.find((h) => h._id === hiveToDelete)?.nombre_colmena
              }". Esta acción es irreversible.`
            : "¿Estás seguro de que quieres eliminar este elemento? Esta acción es irreversible."
        }
      />

      <ImageModal
        isOpen={isImageModalOpen}
        imageUrl={imageToDisplayInModal}
        onClose={closeImageModal}
      />
    </div>
  );
};

export default HiveManagementScreen;

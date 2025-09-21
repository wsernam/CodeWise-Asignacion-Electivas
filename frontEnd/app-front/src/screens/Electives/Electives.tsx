import React, { useState, useEffect } from "react";
// Importamos la store de electivas (Zustand)
import { useElectiveStore } from "../../store/electiveStore";
// Componentes de la interfaz
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
// Navegación entre rutas
import { useNavigate } from "react-router";
// Estilos y librería de notificaciones
import "./Electives.css";
import { message } from "antd";
// Tipado de las electivas
import type { IElective } from "../../Models/elective";

/**
 * Componente principal que muestra la lista de electivas,
 * permite buscar, agregar, editar y eliminar (desactivar) electivas.
 */
const Electives: React.FC = () => {
  // Estado global de electivas desde la store
  const electives = useElectiveStore((state) => state.electives);
  const fetchElectives = useElectiveStore((state) => state.fetchElectives);
  const deleteElective = useElectiveStore((state) => state.deleteElective);

  const navigate = useNavigate();

  // Estado local para el filtro de búsqueda por nombre
  const [searchTerm, setSearchTerm] = useState("");

  // Estado del modal de confirmación de eliminación
  const [confirm, setConfirm] = useState<{
    open: boolean;
    codigo: string;
    nombre: string;
  }>({
    open: false,
    codigo: "",
    nombre: "",
  });

  // Cargar las electivas al montar el componente
  useEffect(() => {
    fetchElectives();
  }, [fetchElectives]);

  /**
   * Filtra las electivas que están activas y cuyo nombre coincide
   * con el término de búsqueda (insensible a mayúsculas/minúsculas)
   */
  const filteredElectives: IElective[] = electives
    .filter((e) => e.active)
    .filter((e) => e.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  /**
   * handleDelete: elimina (desactiva) la electiva seleccionada
   * Muestra mensajes de éxito o error usando Ant Design
   */
  const handleDelete = async () => {
    try {
      await deleteElective(confirm.codigo);
      message.success("Electiva desactivada correctamente");
    } catch (error) {
      console.error("[UI] Error al eliminar:", error);
      message.error("No se pudo eliminar la electiva");
    } finally {
      // Cerramos el modal independientemente del resultado
      setConfirm({ open: false, codigo: "", nombre: "" });
    }
  };

  return (
    <div className="electives-form-container">
      {/* Encabezado de la página */}
      <Header />

      {/* Contenido principal */}
      <div className="electives-content">
        <div className="electives-card">
          <h2 className="electives-title">
            Sistema de Asignación de Electivas
          </h2>

          {/* Barra de acciones: búsqueda y botón de agregar */}
          <div className="actions-bar">
            <input
              type="text"
              placeholder="Buscar electiva"
              aria-label="Buscar electiva"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="btn-add"
              onClick={() => navigate("/electives/add")}
              aria-label="Agregar nueva electiva"
            >
              Agregar Electiva
            </button>
          </div>

          {/* Tabla de electivas */}
          <div className="electives-table-container">
            <table className="electives-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Programa</th>
                  <th>Opciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredElectives.length > 0 ? (
                  filteredElectives.map((e) => (
                    <tr key={e.codigo}>
                      <td>{e.codigo}</td>
                      <td>{e.nombre}</td>
                      <td>{e.programa}</td>
                      <td className="options">
                        {/* Botón de editar */}
                        <button
                          onClick={() =>
                            navigate(`/electives/edit/${e.codigo}`)
                          }
                          className="btn-icon edit"
                          aria-label={`Editar ${e.nombre}`}
                        >
                          ✏️
                        </button>

                        {/* Botón de eliminar: abre modal de confirmación */}
                        <button
                          onClick={() =>
                            setConfirm({
                              open: true,
                              codigo: e.codigo,
                              nombre: e.nombre,
                            })
                          }
                          className="btn-icon delete"
                          aria-label={`Eliminar ${e.nombre}`}
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  // Mensaje si no hay electivas que mostrar
                  <tr>
                    <td colSpan={4}>No se encontraron electivas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pie de página */}
      <Footer />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        open={confirm.open}
        message={`¿Seguro que deseas eliminar la electiva "${confirm.nombre}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, codigo: "", nombre: "" })}
      />
    </div>
  );
};

export default Electives;

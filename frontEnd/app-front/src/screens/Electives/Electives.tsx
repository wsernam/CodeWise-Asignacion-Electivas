// src/screens/Electives/Electives.tsx
import React, { useState } from "react";
import { useElectiveStore } from "../../store/electiveStore"; 
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useNavigate } from "react-router";
import "./Electives.css";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { message } from "antd";

const Electives: React.FC = () => {
  const electives = useElectiveStore((state) => state.electives);
  const deleteElective = useElectiveStore((state) => state.deleteElective);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedElective, setSelectedElective] = useState<{ codigo: string; nombre: string } | null>(null);

  const filteredElectives = electives.filter((e) =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir modal al hacer clic en eliminar
  const handleDeleteClick = (codigo: string, nombre: string) => {
    setSelectedElective({ codigo, nombre });
    setModalOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = () => {
    if (selectedElective) {
      deleteElective(selectedElective.codigo);
      message.success("Electiva eliminada correctamente");
    }
    setModalOpen(false);
    setSelectedElective(null);
  };

  // Cancelar eliminación
  const handleCancelDelete = () => {
    setModalOpen(false);
    setSelectedElective(null);
  };

  return (
    <div className="electives-form-container">
      <Header />

      <div className="electives-content">
        <div className="electives-card">
          <h2 className="electives-title">Sistema de Asignación de Electivas</h2>

          <div className="actions-bar">
            <input
              type="text"
              placeholder="Buscar electiva"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="btn-add"
              onClick={() => navigate("/electives/add")}
            >
              Agregar Electiva
            </button>
          </div>

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
                      {/* Editar */}
                      <button
                        onClick={() => navigate(`/electives/edit/${e.codigo}`)}
                        className="btn-icon edit"
                      >
                        ✏️
                      </button>

                      {/* Eliminar con modal personalizado */}
                      <button
                        onClick={() => handleDeleteClick(e.codigo, e.nombre)}
                        className="btn-icon delete"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>No se encontraron electivas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal personalizado */}
      <ConfirmModal
        isOpen={modalOpen}
        title="¿Seguro que deseas eliminar esta electiva?"
        message={selectedElective ? `Electiva: ${selectedElective.nombre}` : ""}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <Footer />
    </div>
  );
};

export default Electives;

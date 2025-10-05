import React, { useState, useEffect } from "react";
import { useElectiveStore } from "../../store/electiveStore";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import ConfirmModal from "../../components/shared/ConfirmModal/ConfirmModal";
import WarningModal from "../../components/shared/WarningModal/WarningModal";
import SuccessModal from "../../components/shared/SuccessModal/SuccessModal";

import { useNavigate } from "react-router";
import type { IElective } from "../../models/elective";
import "./ListElective.css";

const Electives: React.FC = () => {
  const electives = useElectiveStore((state) => state.electives);
  const fetchElectives = useElectiveStore((state) => state.fetchElectives);
  const deleteElective = useElectiveStore((state) => state.deleteElective);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [confirm, setConfirm] = useState<{
    open: boolean;
    codigo: string;
    nombre: string;
  }>({
    open: false,
    codigo: "",
    nombre: "",
  });
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const [success, setSuccess] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  useEffect(() => {
    fetchElectives();
  }, [fetchElectives]);

  // Búsqueda por código O nombre
  const filteredElectives: IElective[] = electives
    .filter((e) => e.active)
    .filter(
      (e) =>
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleDelete = async () => {
    try {
      await deleteElective(confirm.codigo);
      setSuccess({
        open: true,
        message: `Electiva "${confirm.nombre}" desactivada correctamente`,
      });
      setConfirm({ open: false, codigo: "", nombre: "" });
    } catch (error) {
      setWarning({
        open: true,
        message: "No se pudo desactivar la electiva",
      });
      setConfirm({ open: false, codigo: "", nombre: "" });
    }
  };

  const handleConfirmDelete = (codigo: string, nombre: string) => {
    setConfirm({
      open: true,
      codigo: codigo,
      nombre: nombre,
    });
  };

  const handleSuccessClose = () => {
    setSuccess({ open: false, message: "" });
  };

  const handleWarningClose = () => {
    setWarning({ open: false, message: "" });
  };

  const handleConfirmCancel = () => {
    setConfirm({ open: false, codigo: "", nombre: "" });
  };

  return (
    <div className="auth-page">
      <Header />
      <Navbar />

      <div className="auth-page-content">
        <Card padding="xl" className="electives-card">
          <h2>Sistema de Asignación de Electivas</h2>

          <div className="actions-bar">
            <input
              type="text"
              placeholder="Buscar por código o nombre"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={() => navigate("/electives/add")}
            >
              Agregar Electiva
            </Button>
          </div>

          <div className="table-container">
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
                        <button
                          onClick={() =>
                            navigate(`/electives/edit/${e.codigo}`)
                          }
                          className="btn-icon"
                          title="Editar electiva"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() =>
                            handleConfirmDelete(e.codigo, e.nombre)
                          }
                          className="btn-icon"
                          title="Desactivar electiva"
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      {electives.filter((e) => e.active).length === 0
                        ? "No hay electivas activas"
                        : "No hay se encontraron electivas que conicidan con la búsqueda"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Footer />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        open={confirm.open}
        message={`¿Seguro que deseas desactivar la electiva "${confirm.nombre}"?`}
        onConfirm={handleDelete}
        onCancel={handleConfirmCancel}
      />

      {/* Modal de éxito */}
      <SuccessModal
        open={success.open}
        message={success.message}
        onClose={handleSuccessClose}
      />

      {/* Modal de advertencia/error */}
      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={handleWarningClose}
      />
    </div>
  );
};

export default Electives;

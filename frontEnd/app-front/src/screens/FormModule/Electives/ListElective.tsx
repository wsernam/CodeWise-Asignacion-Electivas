import React, { useState, useEffect } from "react";
import { useElectiveStore } from "../../../store/Form/electiveStore";
import { useProgramStore } from "../../../store/Form/programStore";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import WarningModal from "../../../components/shared/WarningModal/WarningModal";
import SuccessModal from "../../../components/shared/SuccessModal/SuccessModal";
import { useNavigate } from "react-router";
import type { IElective } from "../../../models/Form/elective";
import "./ListElective.css";

const Electives: React.FC = () => {
  const programs = useProgramStore((state) => state.programs);
  const fetchPrograms = useProgramStore((state) => state.fetchPrograms);
  const electives = useElectiveStore((state) => state.electives);
  const fetchElectives = useElectiveStore((state) => state.fetchElectives);
  const deleteElective = useElectiveStore((state) => state.deleteElective);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [confirm, setConfirm] = useState<{
    open: boolean;
    ele_codigo: string;
    ele_nombre: string;
  }>({
    open: false,
    ele_codigo: "",
    ele_nombre: "",
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
    fetchPrograms();
    fetchElectives();
  }, [fetchElectives, fetchPrograms]);

  // Búsqueda por código O nombre y solo activas (ele_estado)
  const filteredElectives: IElective[] = electives
    .filter((e) => e.ele_estado)
    .filter(
      (e) =>
        e.ele_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(e.ele_codigo).toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleDelete = async () => {
    try {
      await deleteElective(confirm.ele_codigo); // se envía ele_codigo
      setSuccess({
        open: true,
        message: `Electiva "${confirm.ele_nombre}" desactivada correctamente`,
      });
      setConfirm({ open: false, ele_codigo: "", ele_nombre: "" });
    } catch (error) {
      setWarning({
        open: true,
        message: "No se pudo desactivar la electiva",
      });
      setConfirm({ open: false, ele_codigo: "", ele_nombre: "" });
    }
  };

  const handleConfirmDelete = (ele_codigo: string, ele_nombre: string) => {
    setConfirm({
      open: true,
      ele_codigo,
      ele_nombre,
    });
  };

  return (
    <div className="auth-page">
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
                    <tr key={e.ele_codigo}>
                      <td>{e.ele_codigo}</td>
                      <td>{e.ele_nombre}</td>
                      <td>
                        {programs.find(
                          (p) => String(p.pro_codigo) === String(e.pro_codigo)
                        )?.pro_nombre || ""}
                      </td>
                      <td className="options">
                        <button
                          onClick={() =>
                            navigate(`/electives/edit/${e.ele_codigo}`)
                          }
                          className="btn-icon"
                          title="Editar electiva"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            handleConfirmDelete(e.ele_codigo, e.ele_nombre)
                          }
                          className="btn-icon btn-icon-delete"
                          title="Desactivar electiva"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", padding: 20 }}
                    >
                      {electives.filter((e) => e.ele_estado).length === 0
                        ? "No hay electivas activas"
                        : "No se encontraron electivas que coincidan con la búsqueda"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        open={confirm.open}
        message={`¿Seguro que deseas desactivar la electiva "${confirm.ele_nombre}"?`}
        onConfirm={handleDelete}
        onCancel={() =>
          setConfirm({ open: false, ele_codigo: "", ele_nombre: "" })
        }
      />

      {/* Modal de éxito */}
      <SuccessModal
        open={success.open}
        message={success.message}
        onClose={() => setSuccess({ open: false, message: "" })}
      />

      {/* Modal de advertencia/error */}
      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={() => setWarning({ open: false, message: "" })}
      />
    </div>
  );
};

export default Electives;

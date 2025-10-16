import React, { useState, useEffect } from "react";
import { useElectiveStore } from "../../store/electiveStore";
import { useProgramStore } from "../../store/programStore";
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
                          ✏️
                        </button>
                        <button
                          onClick={() =>
                            handleConfirmDelete(e.ele_codigo, e.ele_nombre)
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

      <Footer />

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

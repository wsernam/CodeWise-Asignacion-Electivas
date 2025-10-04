// src/screens/Electives/Electives.tsx
import React, { useState, useEffect } from "react";
import { useElectiveStore } from "../../store/electiveStore";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import ConfirmModal from "../../components/shared/ConfirmModal/ConfirmModal";
import { useNavigate } from "react-router";
import { message } from "antd";
import type { IElective } from "../../models/elective";
import { useProgramStore } from "../../store/programStore";
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
    codigo: string;
    nombre: string;
  }>({
    open: false,
    codigo: "",
    nombre: "",
  });

  useEffect(() => {
    fetchPrograms();
    fetchElectives();
  }, [fetchElectives, fetchPrograms]);

  useEffect(() => {
  console.log("PROGRAMS =>", programs);
  console.log("ELECTIVES =>", electives);
  }, [programs, electives]);


  const filteredElectives: IElective[] = electives
    .filter((e) => e.active)
    .filter((e) => e.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = async () => {
    try {
      await deleteElective(confirm.codigo);
      message.success("Electiva desactivada correctamente");
    } catch (error) {
      message.error("No se pudo eliminar la electiva");
    } finally {
      setConfirm({ open: false, codigo: "", nombre: "" });
    }
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
              placeholder="Buscar electiva"
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
                {filteredElectives.map((e) => (
                  <tr key={e.codigo}>
                    <td>{e.codigo}</td>
                    <td>{e.nombre}</td>
                    <td>{programs.find(p => String(p.codigo) === String(e.programa))?.nombre || ""}</td>
                    <td className="options">
                      <button
                        onClick={() => navigate(`/electives/edit/${e.codigo}`)}
                        className="btn-icon"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() =>
                          setConfirm({
                            open: true,
                            codigo: e.codigo,
                            nombre: e.nombre,
                          })
                        }
                        className="btn-icon"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Footer />

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

import React, { useState, useEffect } from "react";
import { useProgramStore } from "../../store/programStore";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import { useNavigate } from "react-router";
import type { IProgram as Program } from "../../models/program";
import "./ListProgram.css";

const ListProgram: React.FC = () => {
  const programs = useProgramStore((state) => state.programs);
  const fetchPrograms = useProgramStore((state) => state.fetchPrograms);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const filteredPrograms: Program[] = programs
    .filter((p) => p.pro_activo !== false)
    .filter(
      (p) =>
        p.pro_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.pro_codigo.toString().includes(searchTerm.toLowerCase()) ||
        p.fac_nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="auth-page">
      <Header />
      <Navbar />

      <div className="auth-page-content">
        <Card padding="xl" className="programs-card">
          <h2>Sistema de Gestión de Programas</h2>

          <div className="actions-bar">
            <input
              type="text"
              placeholder="Buscar programa"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={() => navigate("/programs/create")}
            >
              Agregar Programa
            </Button>
          </div>

          <div className="table-container">
            <table className="programs-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Facultad</th>
                  <th>Opciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((p) => (
                  <tr key={p.pro_codigo}>
                    <td>{p.pro_codigo}</td>
                    <td>{p.pro_nombre}</td>
                    <td>{p.fac_nombre}</td>
                    <td className="options">
                      <button
                        onClick={() =>
                          navigate(`/programs/edit/${p.pro_codigo}`)
                        }
                        className="btn-icon"
                        title="Editar programa"
                      >
                        ✏️
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
    </div>
  );
};

export default ListProgram;

import React, { useState, useEffect } from "react";
import { useProgramStore } from "../../../store/Form/programStore";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import { useNavigate } from "react-router";
//import type { IProgram as Program } from "../../models/program";
import type { IProgram as Program } from "../../../models/Form/program";
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
        String(p.pro_codigo)
          .toLocaleLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        p.fac_nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <Card padding="xl" className="programs-card">
          <h2>Sistema de Gestión de Programas</h2>

          <div className="actions-bar">
            <input
              type="text"
              placeholder="Buscar por código, nombre o facultad"
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
                {filteredPrograms.length > 0 ? (
                  filteredPrograms.map((p) => (
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", padding: 20 }}
                    >
                      {programs.filter((p) => p.pro_activo).length === 0
                        ? "No hay programas registrados"
                        : "No se encontraron programas que coincidan con la búsqueda"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ListProgram;

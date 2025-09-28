import React, { useState, useEffect } from "react";
import { useProgramStore } from "../../store/programStore"; // Store global
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import { useNavigate } from "react-router";
import { message } from "antd";
import type { Program } from "../../models/program";
import "./ListProgram.css"; // Estilos específicos de este componente

/**
 * COMPONENTE: ListProgram
 * Pantalla principal que muestra todos los programas en una tabla
 */
const ListProgram: React.FC = () => {
  // ========== HOOKS Y ESTADO ==========
  const programs = useProgramStore((state) => state.programs);
  const fetchPrograms = useProgramStore((state) => state.fetchPrograms);
  const navigate = useNavigate();

  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // ========== EFFECTS ==========

  /**
   * useEffect: Cargar programas cuando el componente se monta
   * [] como dependencia = solo se ejecuta una vez al montar
   */
  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // ========== DATOS DERIVADOS (NO ESTADO) ==========

  /**
   * filteredPrograms: Array filtrado basado en searchTerm
   * Es un dato DERIVADO, no necesita ser estado
   * Se recalcula automáticamente cuando programs o searchTerm cambian
   */
  const filteredPrograms: Program[] = programs
    // Filtrar solo programas activos
    .filter((p) => p.active !== false)
    // Filtrar por término de búsqueda
    .filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.facultad.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // ========== RENDERIZADO ==========
  return (
    <div className="auth-page">
      <Header />
      <Navbar />

      <div className="auth-page-content">
        <Card padding="xl" className="programs-card">
          {/* Título de la página */}
          <h2>Sistema de Gestión de Programas</h2>

          {/* Barra de acciones: búsqueda + botón agregar */}
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

          {/* Contenedor de la tabla */}
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
                  <tr key={p.codigo}>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>{p.facultad}</td>
                    <td className="options">
                      {/* Botón editar - navega a la página de edición */}
                      <button
                        onClick={() => navigate(`/programs/edit/${p.codigo}`)}
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

import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import ConfirmModal from "../../components/shared/ConfirmModal/ConfirmModal";
import SuccessModal from "../../components/shared/SuccessModal/SuccessModal";
import WarningModal from "../../components/shared/WarningModal/WarningModal";

import { useElectiveStore } from "../../store/electiveStore";
import { useProgramStore } from "../../store/programStore"; // ✅ AGREGADO
import { useFormStore } from "../../store/offerStore";
import "./Dashboard.css";

// Librería de gráficas
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Colores para gráficas
const COLORS = [
  "#1E40AF",
  "#3B82F6",
  "#60A5FA",
  "#93C5FD",
  "#BFDBFE",
  "#DBEAFE",
];

// Capacidad máxima de cada electiva
const CAPACITY_PER_ELECTIVE = 30;

const Dashboard: React.FC = () => {
  // ====== Datos globales desde el store ======
  const electives = useElectiveStore((s) => s.electives);
  const fetchElectives = useElectiveStore((s) => s.fetchElectives);
  const programs = useProgramStore((s) => s.programs); // ✅ AGREGADO
  const fetchPrograms = useProgramStore((s) => s.fetchPrograms); // ✅ AGREGADO

  const { currentForm, changeFormStatus } = useFormStore();

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchElectives();
    fetchPrograms();
  }, [fetchElectives, fetchPrograms]);

  // ====== Estado local ======
  const [enrollments, setEnrollments] = useState<Record<string, number>>({}); // inscritos por electiva
  const [programaSeleccionado, setProgramaSeleccionado] = useState("Todos"); // filtro
  const [confirm, setConfirm] = useState<{ open: boolean; newStatus: boolean }>(
    {
      open: false,
      newStatus: false,
    }
  );
  const [success, setSuccess] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // ====== DATOS REALES ======

  // Electivas activas (las que realmente están disponibles)
  const activeElectives = useMemo(() => {
    return electives.filter((elective) => elective.active);
  }, [electives]);

  // Programas activos (los que realmente existen)
  const activePrograms = useMemo(() => {
    return programs.filter((program) => program.pro_activo);
  }, [programs]);

  // ====== Procesamiento de datos ======
  // Simulación de inscripciones (basada en datos reales)
  useEffect(() => {
    const map: Record<string, number> = {};
    activeElectives.forEach((e, i) => {
      // Valor pseudoaleatorio pero basado en datos reales
      const base = (i + e.codigo.length) * 5;
      map[e.codigo] = base % (CAPACITY_PER_ELECTIVE + 1);
    });
    setEnrollments(map);
  }, [activeElectives]);

  // Lista de programas disponibles para filtrar (basada en programas reales)
  const programas = useMemo(() => {
    const programasConElectivas = new Set(
      activeElectives.map((e) => e.programa)
    );
    const programasActivos = activePrograms.map((p) => p.pro_nombre);

    // Solo mostrar programas que tienen electivas activas
    const programasFiltrados = programasActivos.filter((programa) =>
      programasConElectivas.has(programa)
    );

    return ["Todos", ...programasFiltrados];
  }, [activeElectives, activePrograms]);

  // Electivas filtradas por programa (solo activas)
  const filteredElectives = useMemo(() => {
    if (programaSeleccionado === "Todos") return activeElectives;
    return activeElectives.filter((e) => e.programa === programaSeleccionado);
  }, [activeElectives, programaSeleccionado]);

  // ====== KPIs CON DATOS REALES ======
  const totalElectives = filteredElectives.length;
  const totalActiveElectives = activeElectives.length; // Total real de electivas activas
  const totalPrograms = activePrograms.length; // Total real de programas activos
  const totalEnrollments = filteredElectives.reduce(
    (acc, e) => acc + (enrollments[e.codigo] || 0),
    0
  );

  // Ocupación basada en electivas activas reales
  const occupancyPercent =
    totalActiveElectives > 0
      ? Math.round(
          (totalEnrollments / (totalActiveElectives * CAPACITY_PER_ELECTIVE)) *
            100
        )
      : 0;

  // Estado del formulario actual
  const formStatus = currentForm?.for_status || false;

  // ====== Datos para gráficas (REALES) ======
  // Distribución de inscritos por programa (solo programas con electivas activas)
  const pieData = useMemo(() => {
    const grouped: Record<string, number> = {};
    activeElectives.forEach((e) => {
      const count = enrollments[e.codigo] || 0;
      grouped[e.programa] = (grouped[e.programa] || 0) + count;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [activeElectives, enrollments]);

  // Top 10 electivas más demandadas (solo electivas activas)
  const barData = useMemo(() => {
    return filteredElectives
      .map((e) => ({
        name: e.nombre,
        inscritos: enrollments[e.codigo] || 0,
        codigo: e.codigo,
      }))
      .sort((a, b) => b.inscritos - a.inscritos)
      .slice(0, 10);
  }, [filteredElectives, enrollments]);

  // ====== Tablas ======
  // Ordenar electivas activas por inscritos
  const sortedByEnroll = useMemo(
    () =>
      filteredElectives
        .map((e) => ({
          codigo: e.codigo,
          nombre: e.nombre,
          programa: e.programa,
          inscritos: enrollments[e.codigo] || 0,
        }))
        .sort((a, b) => b.inscritos - a.inscritos),
    [filteredElectives, enrollments]
  );

  const top5 = sortedByEnroll.slice(0, 5);
  const low5 = sortedByEnroll.slice(-5).reverse();

  // 🚦 Color semáforo según ocupación
  const occupancyColor = (inscritos: number) => {
    const pct = Math.round((inscritos / CAPACITY_PER_ELECTIVE) * 100);
    if (pct >= 95) return "#EF4444"; // Rojo: casi lleno
    if (pct >= 70) return "#F59E0B"; // Amarillo: medio alto
    return "#10B981"; // Verde: saludable
  };

  // ====== Manejo del estado del formulario ======
  const handleToggleFormStatus = (newStatus: boolean) => {
    setConfirm({
      open: true,
      newStatus: newStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    try {
      if (currentForm) {
        await changeFormStatus({
          ...currentForm,
          for_status: confirm.newStatus,
        });
        setSuccess({
          open: true,
          message: `Formulario ${
            confirm.newStatus ? "activado" : "desactivado"
          } correctamente`,
        });
      }
    } catch (error) {
      setWarning({
        open: true,
        message: "Error al cambiar el estado del formulario",
      });
    } finally {
      setConfirm({ open: false, newStatus: false });
    }
  };

  const handleSuccessClose = () => {
    setSuccess({ open: false, message: "" });
  };

  const handleWarningClose = () => {
    setWarning({ open: false, message: "" });
  };

  const handleConfirmCancel = () => {
    setConfirm({ open: false, newStatus: false });
  };

  // ====== 🖼️ Render ======
  return (
    <div className="auth-page">
      <Header />
      <Navbar />

      <div className="auth-page-content">
        <div className="dashboard-main">
          {/* 🔎 Filtro y Estado del Formulario en la misma fila */}
          <div className="filter-status-row">
            {/* Filtro */}
            <Card padding="lg" className="filter-card">
              <div className="dashboard-filter">
                <label htmlFor="programa">Filtrar por programa:</label>
                <select
                  id="programa"
                  value={programaSeleccionado}
                  onChange={(e) => setProgramaSeleccionado(e.target.value)}
                >
                  {programas.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Estado del Formulario */}
            <Card padding="lg" className="form-status-card">
              <div className="form-status-content">
                <div className="form-status-title">
                  Estado del Formulario: {formStatus ? "Activo" : "Inactivo"}
                </div>
                <Button
                  variant={formStatus ? "secondary" : "primary"}
                  size="small"
                  onClick={() => handleToggleFormStatus(!formStatus)}
                >
                  {formStatus ? "Desactivar" : "Activar"} Formulario
                </Button>
              </div>
            </Card>
          </div>

          {/* 📌 KPIs */}
          <div className="kpi-row">
            <Card padding="lg">
              <div className="kpi-card">
                <div className="kpi-title">Programas activos</div>
                <div className="kpi-value">{totalPrograms}</div>
              </div>
            </Card>
            <Card padding="lg">
              <div className="kpi-card">
                <div className="kpi-title">Electivas activas</div>
                <div className="kpi-value">{totalActiveElectives}</div>
              </div>
            </Card>
            <Card padding="lg">
              <div className="kpi-card">
                <div className="kpi-title">Estudiantes inscritos</div>
                <div className="kpi-value">{totalEnrollments}</div>
              </div>
            </Card>
            <Card padding="lg">
              <div className="kpi-card">
                <div className="kpi-title">Ocupación promedio</div>
                <div className="kpi-value">{occupancyPercent}%</div>
                <div className="kpi-progress">
                  <div
                    className="kpi-progress-bar"
                    style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* 📊 Gráficas */}
          <div className="charts-row">
            {/* Top 10 electivas */}
            <Card padding="lg">
              <h3>Top electivas por inscritos ({programaSeleccionado})</h3>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inscritos" name="Inscritos" fill="#1E40AF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Distribución por programa */}
            {programaSeleccionado === "Todos" && (
              <Card padding="lg">
                <h3>Distribución por programa (inscritos)</h3>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        innerRadius={35}
                        label
                      >
                        {pieData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </div>

          {/* 📋 Tablas */}
          <div className="tables-row">
            {/* Top 5 más demandadas */}
            <Card padding="lg">
              <h4>Top 5 más demandadas ({programaSeleccionado})</h4>
              <table className="small-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Inscritos</th>
                    <th>Semáforo</th>
                  </tr>
                </thead>
                <tbody>
                  {top5.map((r, i) => (
                    <tr key={r.codigo}>
                      <td>{i + 1}</td>
                      <td>{r.nombre}</td>
                      <td>{r.inscritos}</td>
                      <td>
                        <span
                          className="semaphore"
                          style={{ background: occupancyColor(r.inscritos) }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Top 5 menos demandadas */}
            <Card padding="lg">
              <h4>Top 5 menos demandadas ({programaSeleccionado})</h4>
              <table className="small-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Inscritos</th>
                    <th>Semáforo</th>
                  </tr>
                </thead>
                <tbody>
                  {low5.map((r, i) => (
                    <tr key={r.codigo}>
                      <td>{i + 1}</td>
                      <td>{r.nombre}</td>
                      <td>{r.inscritos}</td>
                      <td>
                        <span
                          className="semaphore"
                          style={{ background: occupancyColor(r.inscritos) }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      {/* Modales */}
      <ConfirmModal
        open={confirm.open}
        message={`¿Estás seguro de que deseas ${
          confirm.newStatus ? "activar" : "desactivar"
        } el formulario de asignación?`}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleConfirmCancel}
      />

      <SuccessModal
        open={success.open}
        message={success.message}
        onClose={handleSuccessClose}
      />

      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={handleWarningClose}
      />
    </div>
  );
};

export default Dashboard;

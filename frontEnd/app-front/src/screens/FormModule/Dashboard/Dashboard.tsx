import React, { useEffect, useMemo, useState } from "react";
import Card from "../../../components/ui/Card/Card";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import SuccessModal from "../../../components/shared/SuccessModal/SuccessModal";
import WarningModal from "../../../components/shared/WarningModal/WarningModal";

import { useFormStatusStore } from "../../../store/Form/formStatusStore";
import { useElectiveStore } from "../../../store/Form/electiveStore";
import { useProgramStore } from "../../../store/Form/programStore";
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
import { getSelectionDashboardService } from "../../../services/Form/selectionService";
import { getLastOffersPeriod } from "../../../services/Form/offerService";

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
const CAPACITY_PER_ELECTIVE = 18;

const Dashboard: React.FC = () => {
  // ====== Datos globales desde el store ======
  const electives = useElectiveStore((s) => s.electives);
  const fetchElectives = useElectiveStore((s) => s.fetchElectives);
  const programs = useProgramStore((s) => s.programs); // ✅ AGREGADO
  const fetchPrograms = useProgramStore((s) => s.fetchPrograms); // ✅ AGREGADO
  const { formStatus, changeFormStatus, fetchFormStatus } =
    useFormStatusStore();
  
  // ====== Estado local para año y semestre ======
  const [year, setYear] = useState<number>(0);
  const [semester, setSemester] = useState<number>(1);

  //======= Consultar los inscritos por filtro ======
  const [inscritos, setInscritos] = useState<number>(0);
  const [inscritosPorPrograma, setInscritosPorPrograma] = useState<Record<string, number>>({});
  // ====== Consultar el periodo de la última oferta ======
  // ====== Cargar año y semestre desde backend ======
  useEffect(() => {
    const loadPeriod = async () => {
      try {
        const period = await getLastOffersPeriod(); 
        // period = { ofe_anio: 2024, ofe_num_semestre: 1 }

        setYear(period.ofe_anio);
        setSemester(period.ofe_num_semestre);

        console.log("[Dashboard] Periodo cargado:", period);

      } catch (err) {
        console.error("[Dashboard] Error cargando periodo", err);
      }
    };

    loadPeriod();
  }, []);
  // Cargar datos al montar el componente
  useEffect(() => {
    fetchElectives();
    fetchPrograms();
    fetchFormStatus();
  }, [fetchElectives, fetchPrograms, fetchFormStatus]);

  // ====== Estado local ======
  const [enrollments, setEnrollments] = useState<Record<string, number>>({}); // inscritos por electiva
  const [programaSeleccionado, setProgramaSeleccionado] = useState("Todos"); // filtro
  const [programaSeleccionadoCodigo, setProgramaSeleccionadoCodigo] = useState<string>("Todos");
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
    return electives.filter((elective) => elective.ele_estado);
  }, [electives]);

  // Programas activos (los que realmente existen)
  const activePrograms = useMemo(() => {
    return programs.filter((program) => program.pro_activo);
  }, [programs]);

  // ====== Procesamiento de datos ======
  // Cargar inscripciones reales desde el backend
useEffect(() => {
  const fetchEnrollments = async () => {
    try {
      const data = await getSelectionDashboardService(programaSeleccionadoCodigo, year, semester);
      const dataElectivas = data.electivas;
      if (programaSeleccionadoCodigo !== "Todos") {
        setInscritos(data.totales.find(t => t.pro_codigo === programaSeleccionadoCodigo)?.total_inscritos || 0);
      }
      else {
        const total = data.total || 0;
        setInscritos(total);
        setInscritosPorPrograma(data.totales.reduce((acc, curr) => {
          acc[curr.pro_codigo] = curr.total_inscritos;
          return acc;
        }, {} as Record<string, number>));
      }

      // Convertimos el array en un map: { ele_codigo : inscritos }
      const map: Record<string, number> = {};
      dataElectivas.forEach(item => {
        map[item.ele_codigo] = item.inscritos;
      });
      console.error("[Dashboard] inscritos", map)
      setEnrollments(map);
    } catch (error) {
      console.error("[Dashboard] Error cargando inscritos reales:", error);
      // Si falla, dejamos el map vacío o consideras fallback
      setEnrollments({});
    }
  };

  fetchEnrollments();
}, [programaSeleccionado, year, semester]);


  // Lista de programas disponibles para filtrar (basada en programas reales)
  const programas = useMemo(() => {
    const programasConElectivas = new Set(
      activeElectives.map((e) => e.pro_codigo)
    );
    const programasActivos = activePrograms.map((p) => p.pro_nombre);

    // Solo mostrar programas que tienen electivas activas
    const programasFiltrados = programasActivos;

    return ["Todos", ...programasFiltrados];
  }, [activeElectives, activePrograms]);

  // Electivas filtradas por programa (solo activas)
  const filteredElectives = useMemo(() => {
    if (programaSeleccionado === "Todos") return activeElectives;
    return activeElectives.filter((e) => e.pro_codigo === programaSeleccionadoCodigo);
  }, [activeElectives, programaSeleccionado]);

  // ====== KPIs CON DATOS REALES ======
  const totalActiveElectives = activeElectives.length; // Total real de electivas activas
  const totalPrograms = activePrograms.length; // Total real de programas activos
  const totalEnrollments = filteredElectives.reduce(
    (acc, e) => acc + (enrollments[e.ele_codigo] || 0),
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

  // ====== Datos para gráficas (REALES) ======
  // Distribución de inscritos por programa (solo programas con electivas activas)
  const pieData = useMemo(() => {
    const grouped = inscritosPorPrograma;
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [activeElectives, enrollments]);

  // Top 10 electivas más demandadas (solo electivas activas)
  const barData = useMemo(() => {
    return filteredElectives
      .map((e) => ({
        name: e.ele_nombre,
        inscritos: enrollments[e.ele_codigo] || 0,
        codigo: e.ele_codigo,
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
          codigo: e.ele_codigo,
          nombre: e.ele_nombre,
          programa: e.pro_codigo,
          inscritos: enrollments[e.ele_codigo] || 0,
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
  const handleToggleFormStatus = async (newStatus: boolean) => {
    try {
      await changeFormStatus(newStatus);
      setSuccess({
        open: true,
        message: `Formulario ${
          newStatus ? "activado" : "desactivado"
        } correctamente`,
      });
    } catch (error) {
      setWarning({
        open: true,
        message: "Error al cambiar el estado del formulario",
      });
    }
  };

  const handleConfirmStatusChange = async () => {
    try {
      // llamar el action con el booleano (el store maneja el update)
      await changeFormStatus(confirm.newStatus);

      setSuccess({
        open: true,
        message: `Formulario ${
          confirm.newStatus ? "activado" : "desactivado"
        } correctamente`,
      });
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

  // ====== Render ======
  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <div className="dashboard-main">
          {/* Filtro y Estado del Formulario en la misma fila */}
          <div className="filter-status-row">
            {/* Filtro */}
            <Card padding="lg" className="filter-card">
              <div className="dashboard-filter">
                <div className="form-status-title">Filtrar por programa:</div>
                <select
                  id="programa"
                  value={programaSeleccionado}
                  onChange={(e) => {
                    const nombre = e.target.value;
                    setProgramaSeleccionado(nombre);

                    if (nombre === "Todos") {
                      setProgramaSeleccionadoCodigo("Todos");
                      return;
                    }

                    const programa = activePrograms.find(p => p.pro_nombre === nombre);
                    setProgramaSeleccionadoCodigo(programa?.pro_codigo || "Todos");
                  }}
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
                <div className="form-status-title">Estado del Formulario</div>
                <div className="toggle-wrapper">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={formStatus}
                      onChange={(e) => handleToggleFormStatus(e.target.checked)}
                      className="toggle-input"
                    />
                    <span className="toggle-slider">
                      <span className="toggle-knob">
                        {formStatus ? "✓" : "✕"}
                      </span>
                    </span>
                  </label>
                  <span className="toggle-status-text">
                    {formStatus ? "Activado" : "Desactivado"}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* KPIs */}
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
                <div className="kpi-value">{inscritos}</div>
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

          {/* Gráficas */}
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

          {/* Tablas */}
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

import React, { useEffect, useMemo, useState } from "react";

import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";
import Card from "../../components/ui/Card/Card";

import { useElectiveStore } from "../../store/electiveStore";
import "./Dashboard.css";

//  Librería de gráficas
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

  // Cargar electivas al montar el componente
  useEffect(() => {
    fetchElectives();
  }, [fetchElectives]);

  // ====== Estado local ======
  const [enrollments, setEnrollments] = useState<Record<string, number>>({}); // inscritos por electiva
  const [programaSeleccionado, setProgramaSeleccionado] = useState("Todos"); // filtro

  // ====== Procesamiento de datos ======
  // Simulación de inscripciones (⚠️ aquí deberías conectar con backend real)
  useEffect(() => {
    const map: Record<string, number> = {};
    electives.forEach((e, i) => {
      // Si no hay inscripciones reales, generamos un valor pseudoaleatorio
      const base = (i + 3) * 7;
      map[e.codigo] = base % (CAPACITY_PER_ELECTIVE + 1);
    });
    setEnrollments(map);
  }, [electives]);

  // Lista de programas disponibles para filtrar
  const programas = useMemo(() => {
    const setProg = new Set(electives.map((e) => e.programa));
    return ["Todos", ...Array.from(setProg)];
  }, [electives]);

  // Electivas filtradas por programa
  const filteredElectives = useMemo(() => {
    if (programaSeleccionado === "Todos") return electives;
    return electives.filter((e) => e.programa === programaSeleccionado);
  }, [electives, programaSeleccionado]);

  // ====== KPIs ======
  const totalElectives = filteredElectives.length;
  const activeElectives = filteredElectives.filter((e) => e.active).length;
  const totalEnrollments = filteredElectives.reduce(
    (acc, e) => acc + (enrollments[e.codigo] || 0),
    0
  );
  const occupancyPercent = activeElectives
    ? Math.round(
        (totalEnrollments / (activeElectives * CAPACITY_PER_ELECTIVE)) * 100
      )
    : 0;

  // ====== Datos para gráficas ======
  // Distribución de inscritos por programa
  const pieData = useMemo(() => {
    const grouped: Record<string, number> = {};
    electives.forEach((e) => {
      const count = enrollments[e.codigo] || 0;
      grouped[e.programa] = (grouped[e.programa] || 0) + count;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [electives, enrollments]);

  // Top 10 electivas más demandadas
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
  // Ordenar todas las electivas por inscritos
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

  // ====== 🖼️ Render ======
  return (
    <div className="auth-page">
      <Header />
      <Navbar />

      <div className="auth-page-content">
        <div className="dashboard-main">
          {/* 🔎 Filtro */}
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

          {/* 📌 KPIs */}
          <div className="kpi-row">
            <Card padding="lg">
              <div className="kpi-card">
                <div className="kpi-title">Electivas totales</div>
                <div className="kpi-value">{totalElectives}</div>
              </div>
            </Card>
            <Card padding="lg">
              <div className="kpi-card">
                <div className="kpi-title">Electivas activas</div>
                <div className="kpi-value">{activeElectives}</div>
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
    </div>
  );
};

export default Dashboard;

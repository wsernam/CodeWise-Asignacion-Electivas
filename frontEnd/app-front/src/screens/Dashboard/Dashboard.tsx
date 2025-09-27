// src/screens/Dashboard/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header/Header";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { useElectiveStore } from "../../store/electiveStore";
import type { IElective } from "../../Models/elective";
import "./Dashboard.css";

// Recharts
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

const COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#8b5cf6",
];

const CAPACITY_PER_ELECTIVE = 30;

const Dashboard: React.FC = () => {
  const electives = useElectiveStore((s) => s.electives);
  const fetchElectives = useElectiveStore((s) => s.fetchElectives);

  useEffect(() => {
    fetchElectives();
  }, [fetchElectives]);

  const [enrollments, setEnrollments] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    electives.forEach((e, i) => {
      const numericPart =
        parseInt((e.codigo || "").replace(/\D/g, ""), 10) || (i + 1) * 5;
      map[e.codigo] = Math.max(0, numericPart % (CAPACITY_PER_ELECTIVE + 1));
    });
    setEnrollments(map);
  }, [electives]);

  // 🔹 programas únicos
  const programas = useMemo(() => {
    const setProg = new Set(electives.map((e) => e.programa));
    return ["Todos", ...Array.from(setProg)];
  }, [electives]);

  const [programaSeleccionado, setProgramaSeleccionado] = useState("Todos");

  // 🔹 electivas filtradas
  const filteredElectives = useMemo(() => {
    if (programaSeleccionado === "Todos") return electives;
    return electives.filter((e) => e.programa === programaSeleccionado);
  }, [electives, programaSeleccionado]);

  // KPIs
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

  // Pie chart (solo cuando programaSeleccionado = Todos)
  const pieData = useMemo(() => {
    const grouped: Record<string, number> = {};
    electives.forEach((e) => {
      const count = enrollments[e.codigo] || 0;
      grouped[e.programa] = (grouped[e.programa] || 0) + count;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [electives, enrollments]);

  // Bar chart
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

  // Top5 / Low5
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

  // semáforo
  const occupancyColor = (inscritos: number) => {
    const pct = Math.round((inscritos / CAPACITY_PER_ELECTIVE) * 100);
    if (pct >= 95) return "#ef4444"; // rojo
    if (pct >= 70) return "#f59e0b"; // ámbar
    return "#10b981"; // verde
  };

  return (
    <div className="dashboard-container">
      <Header />
      <Navbar />

      <main className="dashboard-main">
        {/* 🔹 Selector de programa */}
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

        {/* KPI row */}
        <section className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-title">Electivas totales</div>
            <div className="kpi-value">{totalElectives}</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">Electivas activas</div>
            <div className="kpi-value">{activeElectives}</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">Estudiantes inscritos</div>
            <div className="kpi-value">{totalEnrollments}</div>
          </div>

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
        </section>

        {/* Charts */}
        <section className="charts-row">
          <div className="chart-card">
            <h3 className="chart-title">
              Top electivas por inscritos ({programaSeleccionado})
            </h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inscritos" name="Inscritos" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 🔹 Mostrar PieChart solo cuando el filtro sea "Todos" */}
          {programaSeleccionado === "Todos" && (
            <div className="chart-card">
              <h3 className="chart-title">
                Distribución por programa (inscritos)
              </h3>
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
            </div>
          )}
        </section>

        {/* Tables */}
        <section className="tables-row">
          <div className="table-card">
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
                        title={`${Math.round(
                          (r.inscritos / CAPACITY_PER_ELECTIVE) * 100
                        )}% lleno`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-card">
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;

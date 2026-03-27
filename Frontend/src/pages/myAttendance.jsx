import React, { useEffect, useState } from "react";
import StatsPanel from "../components/StatsPanel";
import { getAttendanceData } from "../services/userViewsService";
import "../styles/myAttendance.css";

function parseMonthlyData(data = "") {
  const match = String(data).match(/(\d+)\/(\d+)\s*\((\d+)%\)/);
  if (!match) {
    return { done: 0, total: 0, percent: 0 };
  }

  return {
    done: Number(match[1]),
    total: Number(match[2]),
    percent: Number(match[3])
  };
}

export default function MyAttendance() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [monthly, setMonthly] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let mounted = true;

    getAttendanceData().then(data => {
      if (!mounted) return;
      setStats(data.stats);
      setMonthly(data.monthly);
      setHistory(data.history);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="user-page container reveal-up">
      <header className="user-page-header">
        <p className="eyebrow">Panel de usuario</p>
        <h1>Mi asistencia</h1>
      </header>

      <section className="user-section">
        <h2>Indicadores principales</h2>
        {loading ? <div className="attendance-loading" /> : <StatsPanel stats={stats} />}
      </section>

      <section className="user-section">
        <h2>Asistencia mensual</h2>
        <div className="monthly-list">
          {monthly.map(item => (
            <article key={item.month} className="monthly-item">
              <div className="monthly-item-head">
                <strong>{item.month}</strong>
                <span>{item.data}</span>
              </div>
              <div className="monthly-progress" aria-hidden="true">
                <span style={{ width: `${parseMonthlyData(item.data).percent}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="user-section">
        <h2>Historial detallado</h2>
        <div className="attendance-history-table-wrap">
          <table className="attendance-history-table">
            <thead>
              <tr>
                <th>Actividad</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Lugar</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.map(row => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>
                    <span className="history-pill">{row.type || "Actividad"}</span>
                  </td>
                  <td>{new Date(row.date).toLocaleDateString("es-CL")}</td>
                  <td>{row.time || "-"}</td>
                  <td>{row.place || "-"}</td>
                  <td>
                    <span className={row.status === "Asistio" ? "status-ok" : "status-miss"}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

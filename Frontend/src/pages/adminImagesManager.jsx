import React, { useEffect, useState } from "react";
import AdminImageUpload from "../components/AdminImageUpload";
import api from "../services/api";

export default function AdminImagesManager() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadTipos();
  }, [refreshKey]);

  const loadTipos = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/imagenes");
      setTipos(Array.isArray(data?.tipos) ? data.tipos : []);
    } catch (err) {
      console.error("Error cargando tipos de actividad:", err);
      setError(err.response?.data?.message || "No se pudo cargar el catalogo de tipos.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async tipo => {
    if (!window.confirm(`¿Eliminar el tipo de actividad \"${tipo.nombre}\"?`)) return;

    setDeleting(tipo.id_tipo);
    setError(null);
    try {
      await api.delete(`/imagenes/${tipo.id_tipo}`);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error("Error eliminando tipo:", err);
      setError(err.response?.data?.message || "No se pudo eliminar el tipo de actividad.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <header>
        <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Catalogo de tipos de actividad</h1>
        <p className="mt-2 text-[0.92rem] text-[var(--text-muted)]">
          Administra los tipos de actividad y su imagen principal de portada.
        </p>
      </header>

      <AdminImageUpload key={refreshKey} onSaved={() => setRefreshKey(prev => prev + 1)} />

      <section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="m-0 text-[1.1rem] font-bold text-[var(--text)]">Tipos registrados</h2>
          <button
            type="button"
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="inline-flex items-center rounded-sm border border-[#d8e6dd] bg-white px-4 py-2 text-[0.82rem] font-semibold text-[#355447] transition-colors hover:bg-[#f5f9f7]"
          >
            Recargar
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-sm border border-[#efcdc7] bg-[linear-gradient(180deg,#fff6f4,#fff0ed)] px-3.5 py-2.5 text-[0.84rem] font-medium text-[#8b2f22]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid place-items-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
            <p className="m-0 mt-3 text-[0.88rem] text-[var(--text-muted)]">Cargando catalogo...</p>
          </div>
        ) : tipos.length === 0 ? (
          <div className="rounded-sm border border-[#d8e6dd] bg-white px-4 py-6 text-center">
            <p className="m-0 text-[0.9rem] text-[var(--text-muted)]">Aun no hay tipos registrados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tipos.map(tipo => (
              <article key={tipo.id_tipo} className="overflow-hidden rounded-sm border border-[#d8e6dd] bg-white shadow-[0_10px_25px_-22px_rgba(16,38,26,0.55)]">
                <img src={tipo.imagen_url} alt={tipo.nombre} className="h-44 w-full object-cover" />
                <div className="grid gap-3 p-4">
                  <div>
                    <h3 className="m-0 text-[1rem] font-semibold text-[var(--text)]">{tipo.nombre}</h3>
                    <p className="m-0 mt-1 text-[0.82rem] text-[var(--text-muted)]">{tipo.descripcion || "Sin descripcion"}</p>
                  </div>

                  <a
                    href={tipo.imagen_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-[0.78rem] font-medium text-[var(--primary)] hover:underline"
                  >
                    Ver imagen en Firebase
                  </a>

                  <div className="flex items-center justify-between border-t border-[#edf2ef] pt-3">
                    <span className="text-[0.74rem] text-[var(--text-muted)]">
                      Actualizado: {new Date(tipo.updatedAt).toLocaleDateString("es-CL")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(tipo)}
                      disabled={deleting === tipo.id_tipo}
                      className={[
                        "inline-flex items-center rounded-sm border px-3 py-1.5 text-[0.78rem] font-semibold transition-colors",
                        deleting === tipo.id_tipo
                          ? "cursor-not-allowed border-[#d7dfda] bg-[#eff2f0] text-[#8a9891]"
                          : "border-[#efcdc7] bg-[#fff4f2] text-[#8b2f22] hover:bg-[#ffeceb]"
                      ].join(" ")}
                    >
                      {deleting === tipo.id_tipo ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

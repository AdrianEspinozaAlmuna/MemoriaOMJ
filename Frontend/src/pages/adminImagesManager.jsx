import React, { useEffect, useRef, useState } from "react";
import { Plus, Pencil, RefreshCw, Trash2, Upload } from "lucide-react";
import Modal from "../components/Modal";
import api from "../services/api";

function buildImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target?.result || null);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function processImage(file, tipoNombre) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const srcW = img.naturalWidth;
        const srcH = img.naturalHeight;
        const minW = 800;
        const minH = 450;
        const targetAspect = 16 / 9;

        if (srcW < minW || srcH < minH) {
          URL.revokeObjectURL(url);
          reject(new Error(`Imagen demasiado pequeña. Mínimo ${minW}x${minH}px.`));
          return;
        }

        let sx = 0;
        let sy = 0;
        let sWidth = srcW;
        let sHeight = srcH;
        const srcAspect = srcW / srcH;

        if (srcAspect > targetAspect) {
          sWidth = Math.round(srcH * targetAspect);
          sx = Math.round((srcW - sWidth) / 2);
        } else if (srcAspect < targetAspect) {
          sHeight = Math.round(srcW / targetAspect);
          sy = Math.round((srcH - sHeight) / 2);
        }

        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 675;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 1200, 675);

        canvas.toBlob(blob => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("No se pudo procesar la imagen."));
            return;
          }

          const ext = blob.type === "image/png" ? ".png" : ".jpg";
          resolve(new File([blob], `${tipoNombre || "tipo"}${ext}`, { type: blob.type }));
        }, "image/jpeg", 0.82);
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen para procesar."));
    };

    img.src = url;
  });
}

function normalizeTipo(tipo = {}) {
  return {
    id_tipo: tipo.id_tipo,
    nombre: tipo.nombre || "",
    descripcion: tipo.descripcion || "",
    imagen_url: tipo.imagen_url || "",
    updatedAt: tipo.updatedAt || tipo.updated_at || null
  };
}

function emptyForm() {
  return { nombre: "", descripcion: "" };
}

export default function AdminImagesManager() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadTipos();
  }, [refreshKey]);

  const loadTipos = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/imagenes");
      setTipos(Array.isArray(data?.tipos) ? data.tipos.map(normalizeTipo) : []);
    } catch (err) {
      console.error("Error cargando tipos de actividad:", err);
      setError(err.response?.data?.message || "No se pudo cargar el catalogo de tipos.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTipo(null);
    setForm(emptyForm());
    setSelectedFile(null);
    setPreview("");
    setFormError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  const openEditModal = tipo => {
    setEditingTipo(tipo);
    setForm({ nombre: tipo.nombre || "", descripcion: tipo.descripcion || "" });
    setSelectedFile(null);
    setPreview(tipo.imagen_url || "");
    setFormError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFileSelect = async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Selecciona un archivo de imagen valido.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("La imagen no puede superar 5MB.");
      return;
    }

    try {
      const previewData = await buildImagePreview(file);
      setSelectedFile(file);
      setPreview(previewData || "");
      setFormError("");
    } catch (err) {
      setFormError(err.message || "No se pudo leer la imagen seleccionada.");
    }
  };

  const handleSubmit = async () => {
    const nombre = form.nombre.trim().toLowerCase();
    const descripcion = form.descripcion.trim();

    if (!nombre) {
      setFormError("Debes indicar un tipo de actividad.");
      return;
    }

    if (!editingTipo && !selectedFile) {
      setFormError("Debes seleccionar una imagen.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (selectedFile) {
        const processedFile = await processImage(selectedFile, nombre);
        const formData = new FormData();
        formData.append("file", processedFile);
        formData.append("nombre", nombre);
        if (descripcion) formData.append("descripcion", descripcion);
        if (editingTipo?.id_tipo) formData.append("id_tipo", String(editingTipo.id_tipo));

        await api.post("/imagenes/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else if (editingTipo?.id_tipo) {
        await api.post("/imagenes", {
          id_tipo: editingTipo.id_tipo,
          nombre,
          imagen_url: editingTipo.imagen_url,
          descripcion
        });
      } else {
        setFormError("Debes seleccionar una imagen.");
        return;
      }

      setIsModalOpen(false);
      setEditingTipo(null);
      setForm(emptyForm());
      setSelectedFile(null);
      setPreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error("Error guardando tipo de actividad:", err);
      setFormError(err.response?.data?.message || "No se pudo guardar el tipo de actividad.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async tipo => {
    if (!window.confirm(`¿Eliminar el tipo de actividad "${tipo.nombre}"?`)) return;

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

      <section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="m-0 text-[1.1rem] font-bold text-[var(--text)]">Tipos registrados</h2>
            <p className="m-0 mt-1 text-[0.84rem] text-[var(--text-muted)]">Edita el nombre, reemplaza la imagen o elimina tipos de actividad.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="inline-flex items-center gap-2 rounded-sm border border-[#d8e6dd] bg-white px-4 py-2 text-[0.82rem] font-semibold text-[#355447] transition-colors hover:bg-[#f5f9f7]"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-[0.82rem] font-semibold text-white transition-colors hover:bg-[var(--primary-strong)]"
            >
              <Plus className="h-4 w-4" />
              Agregar tipo
            </button>
          </div>
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
                      Actualizado: {tipo.updatedAt ? new Date(tipo.updatedAt).toLocaleDateString("es-CL") : "—"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(tipo)}
                        className="inline-flex items-center gap-1 rounded-sm border border-[#d8e6dd] bg-white px-3 py-1.5 text-[0.78rem] font-semibold text-[#355447] transition-colors hover:bg-[#f5f9f7]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </button>
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
                        <Trash2 className="h-3.5 w-3.5" />
                        {deleting === tipo.id_tipo ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal
        isOpen={isModalOpen}
        title={editingTipo ? "Editar tipo de actividad" : "Nuevo tipo de actividad"}
        onClose={closeModal}
        panelClassName="sm:max-w-[720px]"
      >
        <div className="grid gap-4 p-1">
          <div>
            <label className="mb-2 block text-[0.86rem] font-semibold text-[var(--text)]">Tipo de actividad</label>
            <input
              type="text"
              value={form.nombre}
              onChange={event => setForm(previous => ({ ...previous, nombre: event.target.value }))}
              placeholder="Ej: danza"
              className="w-full rounded-sm border border-[#d8e6dd] bg-white px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-[0.86rem] font-semibold text-[var(--text)]">Descripcion</label>
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={event => setForm(previous => ({ ...previous, descripcion: event.target.value }))}
              placeholder="Ej: Actividades artisticas de expresion corporal"
              className="w-full resize-y rounded-sm border border-[#d8e6dd] bg-white px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-[0.86rem] font-semibold text-[var(--text)]">Imagen</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-[#c9dbcf] bg-white px-4 py-6 text-[0.87rem] font-medium text-[#4a6256] transition-colors hover:bg-[#f5f9f7]"
            >
              <Upload className="h-4 w-4" />
              {editingTipo ? "Cambiar imagen (PNG/JPG/GIF, max 5MB)" : "Seleccionar imagen (PNG/JPG/GIF, max 5MB)"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              hidden
            />
          </div>

          {preview && (
            <div className="overflow-hidden rounded-sm border border-[#d8e6dd] bg-white">
              <img src={preview} alt="Vista previa" className="h-48 w-full object-cover" />
            </div>
          )}

          {formError && (
            <div className="rounded-sm border border-[#efcdc7] bg-[linear-gradient(180deg,#fff6f4,#fff0ed)] px-3.5 py-2.5 text-[0.84rem] font-medium text-[#8b2f22]">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-[#edf2ef] pt-3">
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex items-center rounded-sm border border-[#d8e6dd] bg-white px-4 py-2.5 text-[0.9rem] font-semibold text-[#355447] transition-colors hover:bg-[#f5f9f7]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !form.nombre}
              className="inline-flex items-center rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-5 py-2.5 text-[0.9rem] font-semibold text-white transition-all hover:bg-[#0a7f3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05a63d]/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? (editingTipo ? "Guardando cambios..." : "Guardando...") : (editingTipo ? "Guardar cambios" : "Guardar tipo")}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
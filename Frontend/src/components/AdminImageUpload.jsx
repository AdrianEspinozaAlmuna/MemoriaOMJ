import React, { useState, useRef } from "react";
import api from "../services/api";

const tiposDefault = [
  "danza",
  "charla",
  "taller",
  "deporte",
  "musica",
  "arte",
  "tecnologia",
  "cine",
  "fotografia",
  "otro"
];

export default function AdminImageUpload({ onSaved }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = event => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen valido.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = evt => {
      const dataUrl = evt.target?.result || null;
      if (!dataUrl) return setPreview(null);

      const img = new Image();
      img.onload = () => {
        const minW = 800;
        const minH = 450;
        if (img.naturalWidth < minW || img.naturalHeight < minH) {
          setError(`Imagen demasiado pequeña. Tamaño mínimo ${minW}x${minH}px.`);
          setPreview(null);
          return;
        }
        setPreview(dataUrl);
      };
      img.onerror = () => {
        setError("No se pudo leer la imagen seleccionada.");
        setPreview(null);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const tipoNombre = nombre.trim().toLowerCase();

    if (!tipoNombre) {
      setError("Debes indicar un tipo de actividad.");
      return;
    }

    if (!fileInputRef.current?.files?.[0]) {
      setError("Debes seleccionar una imagen.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // procesa la imagen: crop a 16:9 y redimensionar a 1200x675 manteniendo calidad
      const processImage = file =>
        new Promise((resolve, reject) => {
          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            try {
              const srcW = img.naturalWidth;
              const srcH = img.naturalHeight;
              const targetAspect = 16 / 9;

              // comprobar tamaño mínimo
              const minW = 800;
              const minH = 450;
              if (srcW < minW || srcH < minH) {
                URL.revokeObjectURL(url);
                return reject(new Error(`Imagen demasiado pequeña. Mínimo ${minW}x${minH}px.`));
              }

              // calcular crop centrado al aspect ratio 16:9
              let sx = 0;
              let sy = 0;
              let sWidth = srcW;
              let sHeight = srcH;

              const srcAspect = srcW / srcH;
              if (srcAspect > targetAspect) {
                // demasiado ancho -> recortar en ancho
                sWidth = Math.round(srcH * targetAspect);
                sx = Math.round((srcW - sWidth) / 2);
              } else if (srcAspect < targetAspect) {
                // demasiado alto -> recortar en alto
                sHeight = Math.round(srcW / targetAspect);
                sy = Math.round((srcH - sHeight) / 2);
              }

              const targetW = 1200;
              const targetH = 675;
              const canvas = document.createElement("canvas");
              canvas.width = targetW;
              canvas.height = targetH;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);

              canvas.toBlob(
                blob => {
                  URL.revokeObjectURL(url);
                  if (!blob) return reject(new Error("No se pudo procesar la imagen."));
                  // crear File para que uploadImage conserve el nombre
                  const ext = blob.type === "image/png" ? ".png" : ".jpg";
                  const processedFile = new File([blob], `${tipoNombre || 'tipo'}${ext}`, { type: blob.type });
                  resolve(processedFile);
                },
                "image/jpeg",
                0.82
              );
            } catch (err) {
              URL.revokeObjectURL(url);
              reject(err);
            }
          };
          img.onerror = e => {
            URL.revokeObjectURL(url);
            reject(new Error("No se pudo cargar la imagen para procesar."));
          };
          img.src = url;
        });

      const originalFile = fileInputRef.current.files[0];
      const processedFile = await processImage(originalFile);

      // Subir al backend para evitar problemas de CORS del bucket
      const form = new FormData();
      form.append("file", processedFile);
      form.append("nombre", tipoNombre);
      if (descripcion.trim()) form.append("descripcion", descripcion.trim());

      const resp = await api.post("/imagenes/upload", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const imagenUrl = resp.data?.url || resp.data?.tipo?.imagen_url;

      setSuccess(`Tipo "${tipoNombre}" guardado correctamente.`);
      setNombre("");
      setDescripcion("");
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (typeof onSaved === "function") onSaved();
    } catch (err) {
      console.error("Error guardando tipo de actividad:", err);
      setError(err.response?.data?.message || "No se pudo guardar el tipo de actividad.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-5 shadow-sm">
      <header className="mb-4">
        <p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Catalogo</p>
        <h2 className="m-0 mt-1 text-[1.2rem] font-bold text-[var(--text)]">Nuevo tipo de actividad</h2>
        <p className="m-0 mt-1 text-[0.87rem] text-[var(--text-muted)]">
          Define un tipo y asocia su imagen principal desde Firebase.
        </p>
      </header>

      <div className="grid gap-4">
        <div>
          <label className="mb-2 block text-[0.86rem] font-semibold text-[var(--text)]">Tipo de actividad</label>
          <div className="mb-2 flex flex-wrap gap-2">
            {tiposDefault.map(tipo => (
              <button
                key={tipo}
                type="button"
                onClick={() => setNombre(tipo)}
                className={[
                  "rounded-sm border px-3 py-1.5 text-[0.82rem] font-semibold transition-colors",
                  nombre === tipo
                    ? "border-[var(--primary)] bg-[var(--primary-active)] text-[var(--primary-strong)]"
                    : "border-[#d8e6dd] bg-white text-[#355447] hover:bg-[#f5f9f7]"
                ].join(" ")}
              >
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={nombre}
            onChange={event => setNombre(event.target.value)}
            placeholder="Ej: danza"
            className="w-full rounded-sm border border-[#d8e6dd] bg-white px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-[0.86rem] font-semibold text-[var(--text)]">Descripcion</label>
          <textarea
            rows={3}
            value={descripcion}
            onChange={event => setDescripcion(event.target.value)}
            placeholder="Ej: Actividades artisticas de expresion corporal"
            className="w-full resize-y rounded-sm border border-[#d8e6dd] bg-white px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-[0.86rem] font-semibold text-[var(--text)]">Imagen</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center rounded-sm border border-dashed border-[#c9dbcf] bg-white px-4 py-6 text-[0.87rem] font-medium text-[#4a6256] transition-colors hover:bg-[#f5f9f7]"
          >
            Seleccionar imagen (PNG/JPG/GIF, max 5MB)
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

        {error && (
          <div className="rounded-sm border border-[#efcdc7] bg-[linear-gradient(180deg,#fff6f4,#fff0ed)] px-3.5 py-2.5 text-[0.84rem] font-medium text-[#8b2f22]">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-sm border border-[#b8dfc7] bg-[linear-gradient(180deg,#f3fbf6,#e9f6ef)] px-3.5 py-2.5 text-[0.84rem] font-medium text-[#1f6a42]">
            {success}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !nombre || !preview}
            className="inline-flex items-center rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-5 py-2.5 text-[0.9rem] font-semibold text-white transition-all hover:bg-[#0a7f3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05a63d]/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploading ? "Guardando..." : "Guardar tipo"}
          </button>
        </div>
      </div>
    </section>
  );
}

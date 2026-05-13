import api from "./api";

export function resolveActivityImage(activity = {}) {
  return (
    activity.image ||
    activity.imageUrl ||
    activity.img ||
    activity.tipo_actividad?.imagen_url ||
    activity.tipoActividad?.imagen_url ||
    activity.tipo_actividad?.image_url ||
    activity.tipo_actividad?.imagenUrl ||
    null
  );
}

/**
 * Obtener imagen default para un tipo de actividad
 * @param {string} tipo - Tipo de actividad (ej: "danza", "charla")
 * @returns {Promise<string|null>} URL de la imagen o null si no existe
 */
export async function getActivityImage(tipo) {
  try {
    const { data } = await api.get(`/imagenes/${tipo}`);
    return data?.tipo?.imagen_url || null;
  } catch (err) {
    console.warn(`No hay imagen para tipo: ${tipo}`, err.message);
    return null;
  }
}

/**
 * Obtener todos los tipos con su imagen
 * @returns {Promise<Object[]>} Array de {id_tipo, nombre, imagen_url, descripcion}
 */
export async function getAllActivityImages() {
  try {
    const { data } = await api.get('/imagenes');
    return data?.tipos || [];
  } catch (err) {
    console.error('Error obteniendo imágenes:', err);
    return [];
  }
}

/**
 * Mapeo útil tipo -> url
 * @returns {Promise<Object>} { "danza": "url", "charla": "url", ... }
 */
export async function getActivityImagesMap() {
  const images = await getAllActivityImages();
  return images.reduce((acc, img) => ({
    ...acc,
    [img.nombre]: img.imagen_url
  }), {});
}

export default {
  resolveActivityImage,
  getActivityImage,
  getAllActivityImages,
  getActivityImagesMap
};

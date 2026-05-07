import React, { useEffect, useState } from "react";
import { Plus, Search, User, Users, Trash2, PencilLine, X } from "lucide-react";
import api from "../services/api";
import LoadingState from "../components/LoadingState";
import Modal from "../components/Modal";

function UserGroups() {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: "", descripcion: "" });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [editUsersLoading, setEditUsersLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  function normalizeGroup(group) {
    if (!group) return null;

    const participantes = Array.isArray(group.participantes) ? group.participantes : [];
    const cantidadMiembros = Number.isFinite(Number(group.cantidad_miembros))
      ? Number(group.cantidad_miembros)
      : participantes.length + 1;

    return {
      ...group,
      descripcion: group.descripcion || "",
      lider: group.lider || null,
      rol_usuario: group.rol_usuario || "miembro",
      participantes,
      cantidad_miembros: cantidadMiembros
    };
  }

  // Cargar grupos al iniciar
  useEffect(() => {
    loadGrupos();
  }, []);

  async function loadGrupos() {
    try {
      setLoading(true);
      const response = await api.get("/groups");
      setGrupos((response.data.grupos || []).map(normalizeGroup));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar grupos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup(e) {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError("El nombre del grupo es requerido");
      return;
    }

    try {
      const response = await api.post("/groups", {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim()
      });
      setGrupos(previous => [normalizeGroup({ ...response.data, rol_usuario: "lider" }), ...previous]);
      setFormData({ nombre: "", descripcion: "" });
      setShowCreateModal(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear grupo");
    }
  }

  async function handleDeleteGroup(idGrupo) {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este grupo?")) return;

    try {
      await api.delete(`/groups/${idGrupo}`);
      setGrupos(previous => previous.filter(g => g.id_grupo !== idGrupo));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error al eliminar grupo");
    }
  }

  async function handleLeaveGroup(idGrupo) {
    if (!window.confirm("¿Estás seguro de que deseas salir de este grupo?")) return;

    try {
      await api.post(`/groups/${idGrupo}/leave`);
      setGrupos(previous => previous.filter(g => g.id_grupo !== idGrupo));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error al salir del grupo");
    }
  }

  async function openEditModal(grupo) {
    setEditingGroupId(grupo.id_grupo);
    setEditForm({
      nombre: grupo.nombre || "",
      descripcion: grupo.descripcion || ""
    });
    setSelectedUserIds([]);
    setAvailableUsers([]);
    setEditError("");
    setShowEditModal(true);
    setUserSearchQuery("");

    try {
      setEditUsersLoading(true);
      const response = await api.get(`/groups/${grupo.id_grupo}/search-users`);
      setAvailableUsers(response.data.usuarios || []);
    } catch (err) {
      setAvailableUsers([]);
      setEditError(err.response?.data?.message || "Error cargando usuarios disponibles");
    } finally {
      setEditUsersLoading(false);
    }
  }

  function closeEditModal() {
    setShowEditModal(false);
    setEditingGroupId(null);
    setEditForm({ nombre: "", descripcion: "" });
    setAvailableUsers([]);
    setSelectedUserIds([]);
    setEditUsersLoading(false);
    setEditSaving(false);
    setEditError("");
    setUserSearchQuery("");
  }

  async function handleSaveGroup(e) {
    e.preventDefault();

    if (!editForm.nombre.trim()) {
      setEditError("El nombre del grupo es requerido");
      return;
    }

    if (!editingGroupId) {
      setEditError("No se pudo identificar el grupo a editar");
      return;
    }

    try {
      setEditSaving(true);
      const response = await api.patch(`/groups/${editingGroupId}`, {
        nombre: editForm.nombre.trim(),
        descripcion: editForm.descripcion.trim(),
        nuevos_miembros: selectedUserIds.map(Number)
      });

      const normalized = normalizeGroup(response.data);
      setGrupos(previous => previous.map(grupo => (grupo.id_grupo === normalized.id_grupo ? normalized : grupo)));
      setError("");
      closeEditModal();
    } catch (err) {
      setEditError(err.response?.data?.message || "Error al guardar el grupo");
    } finally {
      setEditSaving(false);
    }
  }

  if (loading) return <LoadingState title="Cargando grupos..." />;

  const groupBeingEdited = editingGroupId ? grupos.find(grupo => grupo.id_grupo === editingGroupId) : null;
  const filteredAvailableUsers = availableUsers.filter(usuario => {
    const search = userSearchQuery.trim().toLowerCase();
    if (!search) return true;

    const fullName = `${usuario.nombre || ""} ${usuario.apellido || ""}`.toLowerCase();
    const mail = String(usuario.mail || "").toLowerCase();
    return fullName.includes(search) || mail.includes(search);
  });

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de usuario</p>
          <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Mis Grupos</h1>
          <p className="mt-2 text-[1rem] text-[var(--text-muted)]">Crea y administra tus grupos de usuarios</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-[0.95rem] font-semibold text-white transition-all duration-200 hover:bg-[var(--primary-strong)] hover:shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Nuevo Grupo
        </button>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-2 font-semibold hover:underline">
            Descartar
          </button>
        </div>
      )}

      {grupos.length === 0 ? (
        <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-12 text-center shadow-sm">
          <Users className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
          <h3 className="mt-4 text-lg font-semibold text-[var(--text)]">No tienes grupos aún</h3>
          <p className="mt-2 text-[var(--text-muted)]">Crea tu primer grupo para comenzar a colaborar</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--primary-strong)]"
          >
            <Plus className="h-4 w-4" />
            Crear Grupo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {grupos.map(grupo => {
            const leaderName = grupo.lider
              ? `${grupo.lider.nombre || ""} ${grupo.lider.apellido || ""}`.trim() || grupo.lider.mail || "Líder"
              : "Líder";

            const visibleMembers = grupo.participantes.slice(0, 4);
            const extraMembers = Math.max(0, grupo.participantes.length - visibleMembers.length);

            return (
              <article
                key={grupo.id_grupo}
                className="overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-sm transition-all duration-200 hover:border-[var(--primary)] hover:shadow-md"
              >
                <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-semibold text-[var(--text)]">{grupo.nombre}</h3>
                        {grupo.descripcion ? (
                          <p className="mt-1 max-w-3xl text-[var(--text-muted)]">{grupo.descripcion}</p>
                        ) : (
                          <p className="mt-1 text-[var(--text-muted)] italic">Sin descripción</p>
                        )}
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${grupo.rol_usuario === "lider" ? "bg-[#e7f5ec] text-[#177945]" : "bg-[#eef4ff] text-[#2b5db3]"}`}>
                        {grupo.rol_usuario === "lider" ? "Eres líder" : "Eres miembro"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {grupo.cantidad_miembros} miembro{grupo.cantidad_miembros !== 1 ? "s" : ""}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="font-semibold text-[var(--text)]">Líder:</span>
                        <span>{leaderName}</span>
                      </span>
                    </div>

                    <div className="mt-5 border-t border-[var(--panel-border)] pt-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="m-0 text-sm font-semibold text-[var(--text-muted)]">Miembros</p>
                        <span className="text-xs text-[var(--text-muted)]">{grupo.participantes.length} agregados</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                          <span>{leaderName}</span>
                          <span className="text-[0.7rem]">(Líder)</span>
                        </span>
                        {visibleMembers.map(participante => (
                          <span
                            key={participante.id_usuario}
                            className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs text-[var(--text)] ring-1 ring-[var(--panel-border)]"
                          >
                            {participante.nombre}
                          </span>
                        ))}
                        {extraMembers > 0 && (
                          <span className="inline-flex items-center rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
                            +{extraMembers} más
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 lg:self-start">
                    {grupo.rol_usuario === "lider" ? (
                      <>
                        <button
                          onClick={() => openEditModal(grupo)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--panel-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-soft)]"
                          title="Editar grupo"
                        >
                          <PencilLine className="h-4 w-4" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(grupo.id_grupo)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                          title="Eliminar grupo"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Eliminar</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleLeaveGroup(grupo.id_grupo)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                        title="Salir del grupo"
                      >
                        <X className="h-4 w-4" />
                        <span>Salir</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        title="Crear Nuevo Grupo"
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ nombre: "", descripcion: "" });
        }}
        footer={
          <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setFormData({ nombre: "", descripcion: "" });
              }}
              className="flex-1 rounded-lg border border-[var(--panel-border)] px-4 py-2 font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-soft)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="create-group-form"
              className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--primary-strong)]"
            >
              Crear Grupo
            </button>
          </div>
        }
      >
        <form id="create-group-form" onSubmit={handleCreateGroup}>
          <div className="space-y-4 p-1">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Nombre del grupo *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Equipo de desarrollo"
                className="w-full rounded-lg border border-[var(--panel-border)] bg-white px-3 py-2 text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Descripción (opcional)</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe el propósito del grupo"
                rows="3"
                className="w-full rounded-lg border border-[var(--panel-border)] bg-white px-3 py-2 text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
              />
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showEditModal && !!groupBeingEdited}
        title={groupBeingEdited ? `Editar grupo: ${groupBeingEdited.nombre}` : "Editar grupo"}
        onClose={closeEditModal}
        panelClassName="sm:max-w-[720px]"
        footer={
          <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={closeEditModal}
              className="flex-1 rounded-lg border border-[var(--panel-border)] px-4 py-2 font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-soft)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="edit-group-form"
              disabled={editSaving}
              className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {editSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        }
      >
        <form id="edit-group-form" onSubmit={handleSaveGroup}>
          <div className="space-y-5 p-1">
            {editError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {editError}
              </div>
            )}

            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Nombre del grupo *</label>
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm(previous => ({ ...previous, nombre: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--panel-border)] bg-white px-3 py-2 text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Descripción</label>
                <textarea
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm(previous => ({ ...previous, descripcion: e.target.value }))}
                  rows="3"
                  className="w-full rounded-lg border border-[var(--panel-border)] bg-white px-3 py-2 text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
                />
              </div>
            </div>

            <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text)]">Usuarios para agregar</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">Selecciona uno o varios usuarios y guarda los cambios.</p>
                </div>
                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
                  {selectedUserIds.length} seleccionados
                </span>
              </div>

              {editUsersLoading ? (
                <div className="mt-4 rounded-lg border border-dashed border-[var(--panel-border)] bg-white px-4 py-5 text-center text-sm text-[var(--text-muted)]">
                  Cargando usuarios disponibles...
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-[var(--panel-border)] bg-white px-4 py-5 text-center text-sm text-[var(--text-muted)]">
                  No hay usuarios disponibles para agregar.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Buscar usuarios por nombre o correo"
                      className="w-full rounded-xl border border-[var(--panel-border)] bg-white py-2.5 pl-10 pr-3 text-[var(--text)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                    />
                  </div>

                  {filteredAvailableUsers.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[var(--panel-border)] bg-white px-4 py-5 text-center text-sm text-[var(--text-muted)]">
                      No se encontraron usuarios con ese filtro.
                    </div>
                  ) : (
                    <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
                      {filteredAvailableUsers.map(usuario => {
                        const userId = String(usuario.id_usuario);
                        const isSelected = selectedUserIds.includes(userId);
                        const displayName = `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() || usuario.mail || "Usuario";

                        return (
                          <button
                            key={usuario.id_usuario}
                            type="button"
                            onClick={() => {
                              setSelectedUserIds(previous => (
                                isSelected
                                  ? previous.filter(id => id !== userId)
                                  : [...previous, userId]
                              ));
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                              isSelected
                                ? "border-[var(--primary)] bg-[var(--surface-soft)]"
                                : "border-[var(--panel-border)] bg-white hover:bg-[var(--surface-soft)]"
                            }`}
                          >
                            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${isSelected ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-soft)] text-[var(--text-muted)]"}`}>
                              <User className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-[var(--text)]">{displayName}</p>
                              {usuario.mail && <p className="truncate text-sm text-[var(--text-muted)]">{usuario.mail}</p>}
                            </div>
                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[0.7rem] font-bold ${isSelected ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--panel-border)] bg-white text-transparent"}`}>
                              ✓
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {groupBeingEdited?.participantes?.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold text-[var(--text-muted)]">Miembros actuales</p>
                  <div className="flex flex-wrap gap-2">
                    {groupBeingEdited.participantes.map(participante => (
                      <span
                        key={participante.id_usuario}
                        className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs text-[var(--text)] ring-1 ring-[var(--panel-border)]"
                      >
                        {participante.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default UserGroups;

import React, { useEffect, useState } from "react";
import { MoreHorizontal, Plus, Search, User, Users, Trash2, X } from "lucide-react";
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

  // Mostrar el estado de carga dentro del layout en lugar de retornar temprano

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
      <header>
        <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de usuario</p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Mis Grupos</h1>
        <p className="mt-2 text-[1rem] text-[var(--text-muted)]">Crea y administra tus grupos de usuarios</p>
      </header>

      <section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Nuevo grupo</p>
            <h2 className="mt-1 mb-0 text-[1.1rem] font-semibold text-[var(--text)]">Crea y administra tu equipo</h2>
            <p className="mt-1 mb-0 text-[0.94rem] text-[var(--text-muted)]">Organiza participantes para invitarlos rápidamente a tus actividades.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-sm bg-[var(--primary)] px-4 py-2.5 text-[0.9rem] font-semibold !text-white transition-all duration-200 hover:bg-[var(--primary-strong)] hover:shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Nuevo Grupo
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-2 font-semibold hover:underline">
            Descartar
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-12 text-center shadow-sm">
          <LoadingState title="Cargando grupos..." />
        </div>
      ) : grupos.length === 0 ? (
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
        <div className="rounded-sm border border-[#d9e2e5] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e5eaee] pb-4">
            <div>
              <h2 className="m-0 text-[1.05rem] font-semibold text-[var(--text)]">Tus grupos</h2>
              <p className="m-0 mt-1 text-sm text-[var(--text-muted)]">Revisa, abre y administra tus grupos desde esta vista.</p>
            </div>
            <span className="rounded-full bg-[#f3f5f7] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
              {grupos.length} grupo{grupos.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="mt-4 rounded-sm bg-[var(--surface)] p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {grupos.map(grupo => {
            const leaderName = grupo.lider
              ? `${grupo.lider.nombre || ""} ${grupo.lider.apellido || ""}`.trim() || grupo.lider.mail || "Líder"
              : "Líder";

            const visibleMembers = grupo.participantes.slice(0, 4);
            const extraMembers = Math.max(0, grupo.participantes.length - visibleMembers.length);

                return (
                  <article
                    key={grupo.id_grupo}
                    onClick={() => openEditModal(grupo)}
                    className="group cursor-pointer overflow-hidden rounded-sm border border-[#d9e2e5] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-md"
                  >
                    <div className="flex h-full flex-col gap-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-lg font-semibold text-[black]">{grupo.nombre}</h2>
                          {grupo.descripcion ? (
                            <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">{grupo.descripcion}</p>
                          ) : (
                            <p className="mt-1 text-sm text-[var(--text-muted)] italic">Sin descripción</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(grupo);
                          }}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d9e2e5] bg-white text-[var(--text-muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                          aria-label="Abrir opciones del grupo"
                          title="Abrir grupo"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          {grupo.cantidad_miembros} miembro{grupo.cantidad_miembros !== 1 ? "s" : ""}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="font-semibold text-[var(--text)]">Líder:</span>
                          <span className="truncate">{leaderName}</span>
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#e5eaee] bg-[#f7f8fa] p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="m-0 text-sm font-semibold text-[var(--text-muted)]">Miembros</p>
                          <span className="text-xs text-[var(--text-muted)]">{grupo.participantes.length} agregados</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--primary)] ring-1 ring-[var(--panel-border)]">
                            <User className="h-4 w-4 text-[var(--primary)]" />
                            <span className="truncate">{leaderName}</span>
                            <span className="text-[0.7rem]">(Líder)</span>
                          </span>
                          {visibleMembers.map(participante => (
                            <span
                              key={participante.id_usuario}
                              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-[var(--text)] ring-1 ring-[var(--panel-border)]"
                            >
                              <User className="h-4 w-4 text-[var(--text-muted)]" />
                              <span className="truncate">{participante.nombre}</span>
                            </span>
                          ))}
                          {extraMembers > 0 && (
                            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--text-muted)] ring-1 ring-[var(--panel-border)]">
                              +{extraMembers} más
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#eef1f4] pt-3">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${grupo.rol_usuario === "lider" ? "bg-[#eef7ef] text-[#177945]" : "bg-[#eef4ff] text-[#2b5db3]"}`}>
                          {grupo.rol_usuario === "lider" ? "Eres líder" : "Eres miembro"}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">Toca la tarjeta para editar</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        title="Crear grupo"
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ nombre: "", descripcion: "" });
        }}
        panelClassName="sm:max-w-[640px] sm:rounded-[12px] border-[#d8e6dd]"
        contentClassName="px-5 pb-5 pt-4 sm:px-6 sm:pb-6"
        footerClassName="border-t border-[#dce7df] bg-[#f8fbf9] px-5 py-4 sm:px-6"
        footer={
          <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setFormData({ nombre: "", descripcion: "" });
              }}
              className="flex-1 rounded-sm border border-[#d2ded7] bg-white px-4 py-2.5 text-[0.9rem] font-semibold text-[var(--text)] transition-colors hover:bg-[#f5f9f7]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="create-group-form"
              className="flex-1 rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-[0.9rem] font-semibold text-white transition-colors hover:bg-[var(--primary-strong)]"
            >
              Crear Grupo
            </button>
          </div>
        }
      >
        <form id="create-group-form" onSubmit={handleCreateGroup}>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-[0.84rem] font-semibold text-[var(--text)]">Nombre del grupo *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Equipo de desarrollo"
                className="w-full rounded-sm border border-[#d2ded7] bg-white px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[#05a63d]/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-[0.84rem] font-semibold text-[var(--text)]">Descripción (opcional)</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe el propósito del grupo"
                rows="3"
                className="w-full rounded-sm border border-[#d2ded7] bg-white px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[#05a63d]/20"
              />
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showEditModal && !!groupBeingEdited}
        title={groupBeingEdited ? `Editar grupo: ${groupBeingEdited.nombre}` : "Editar grupo"}
        onClose={closeEditModal}
        panelClassName="sm:max-w-[720px] sm:rounded-[12px] border-[#d8e6dd]"
        contentClassName="px-5 pb-5 pt-4 sm:px-6 sm:pb-6"
        footerClassName="border-t border-[#dce7df] bg-[#f8fbf9] px-5 py-4 sm:px-6"
        footer={
          <div className="flex w-full items-center gap-3">
            {groupBeingEdited?.rol_usuario === "lider" ? (
              <button
                type="button"
                onClick={() => {
                  if (!editingGroupId) return;
                  if (!window.confirm("¿Estás seguro de eliminar este grupo?")) return;
                  handleDeleteGroup(editingGroupId);
                  closeEditModal();
                }}
                className="rounded-sm border border-[#efcdc7] bg-[#fff6f4] px-4 py-2.5 text-[0.9rem] font-semibold text-[#8b2f22] transition-colors hover:bg-[#fff0ed]"
              >
                Eliminar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!editingGroupId) return;
                  if (!window.confirm("¿Estás seguro de salir de este grupo?")) return;
                  handleLeaveGroup(editingGroupId);
                  closeEditModal();
                }}
                className="rounded-sm border border-[#efcdc7] bg-[#fff6f4] px-4 py-2.5 text-[0.9rem] font-semibold text-[#8b2f22] transition-colors hover:bg-[#fff0ed]"
              >
                Salir
              </button>
            )}

            <div className="flex-1" />

            <button
              type="button"
              onClick={closeEditModal}
              className="rounded-sm border border-[#d2ded7] bg-white px-4 py-2.5 text-[0.9rem] font-semibold text-[var(--text)] transition-colors hover:bg-[#f5f9f7]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="edit-group-form"
              disabled={editSaving}
              className="rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-[0.9rem] font-semibold text-white transition-colors hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {editSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        }
      >
        <form id="edit-group-form" onSubmit={handleSaveGroup}>
          <div className="space-y-5">
            {editError && (
              <div className="rounded-sm border border-[#efcdc7] bg-[#fff6f4] px-4 py-3 text-[0.86rem] font-medium text-[#8b2f22]">
                {editError}
              </div>
            )}

            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-[0.84rem] font-semibold text-[var(--text)]">Nombre del grupo *</label>
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm(previous => ({ ...previous, nombre: e.target.value }))}
                  className="w-full rounded-sm border border-[#d2ded7] bg-white px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[#05a63d]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-[0.84rem] font-semibold text-[var(--text)]">Descripción</label>
                <textarea
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm(previous => ({ ...previous, descripcion: e.target.value }))}
                  rows="3"
                  className="w-full rounded-sm border border-[#d2ded7] bg-white px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[#05a63d]/20"
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
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-[var(--text)] ring-1 ring-[var(--panel-border)]"
                      >
                        <User className="h-4 w-4 text-[var(--text-muted)]" />
                        <span className="truncate">{participante.nombre}</span>
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

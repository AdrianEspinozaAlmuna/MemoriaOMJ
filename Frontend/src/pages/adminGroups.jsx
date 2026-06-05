import React, { useEffect, useState } from "react";
import { MoreHorizontal, Plus, Search, User, Users, Trash2, X } from "lucide-react";
import api from "../services/api";
import LoadingState from "../components/LoadingState";
import Modal from "../components/Modal";

function AdminGroups() {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "", id_lider: "" });
  const [selectedCreateUserIds, setSelectedCreateUserIds] = useState([]);
  const [createSearchQuery, setCreateSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: "", descripcion: "", id_lider: "" });
  
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  
  const [eligibleLeaders, setEligibleLeaders] = useState([]);
  const [leadersLoading, setLeadersLoading] = useState(false);

  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [removingMemberId, setRemovingMemberId] = useState(null);

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
      rol_usuario: "admin",
      participantes,
      cantidad_miembros: cantidadMiembros
    };
  }

  useEffect(() => {
    loadGrupos();
    loadEligibleLeaders();
  }, []);

  async function loadGrupos() {
    try {
      setLoading(true);
      const response = await api.get("/groups/admin/all");
      setGrupos((response.data.grupos || []).map(normalizeGroup));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar grupos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadEligibleLeaders() {
    try {
      setLeadersLoading(true);
      const response = await api.get("/groups/admin/eligible-leaders");
      setEligibleLeaders(response.data.usuarios || []);
    } catch (err) {
      console.error("Error al cargar líderes elegibles", err);
    } finally {
      setLeadersLoading(false);
    }
  }

  async function handleCreateGroup(e) {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError("El nombre del grupo es requerido");
      return;
    }
    if (!formData.id_lider) {
      setError("Debe seleccionar un administrador (líder) para el grupo");
      return;
    }

    try {
      const response = await api.post("/groups/admin", {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        id_lider: Number(formData.id_lider),
        nuevos_miembros: selectedCreateUserIds.map(Number)
      });
      setGrupos(previous => [normalizeGroup({ ...response.data, rol_usuario: "admin" }), ...previous]);
      setFormData({ nombre: "", descripcion: "", id_lider: "" });
      setSelectedCreateUserIds([]);
      setCreateSearchQuery("");
      setShowCreateModal(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear grupo");
    }
  }

  function confirmDeleteGroup(idGrupo) {
    setDeleteTargetId(idGrupo);
    setShowDeleteModal(true);
  }

  async function handleDeleteGroup() {
    if (deleteTargetId === null) return;
    try {
      await api.delete(`/groups/admin/${deleteTargetId}`);
      setGrupos(previous => previous.filter(g => g.id_grupo !== deleteTargetId));
      setError("");
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error al eliminar grupo");
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  }

  async function openEditModal(grupo) {
    setEditingGroupId(grupo.id_grupo);
    setEditForm({
      nombre: grupo.nombre || "",
      descripcion: grupo.descripcion || "",
      id_lider: grupo.id_lider ? String(grupo.id_lider) : ""
    });
    setSelectedUserIds([]);
    setEditError("");
    setShowEditModal(true);
    setUserSearchQuery("");
  }

  async function handleRemoveMember(idUsuario) {
    if (!editingGroupId) return;
    setRemovingMemberId(idUsuario);
    try {
      await api.delete(`/groups/admin/${editingGroupId}/members/${idUsuario}`);
      setGrupos(previous => previous.map(grupo => {
        if (grupo.id_grupo !== editingGroupId) return grupo;
        return {
          ...grupo,
          participantes: grupo.participantes.filter(p => p.id_usuario !== idUsuario),
          cantidad_miembros: grupo.cantidad_miembros - 1
        };
      }));
      setEditError("");
    } catch (err) {
      setEditError(err.response?.data?.message || "Error al eliminar miembro");
    } finally {
      setRemovingMemberId(null);
    }
  }

  function closeEditModal() {
    setShowEditModal(false);
    setEditingGroupId(null);
    setEditForm({ nombre: "", descripcion: "", id_lider: "" });
    setSelectedUserIds([]);
    setEditSaving(false);
    setEditError("");
    setUserSearchQuery("");
    setRemovingMemberId(null);
  }

  async function handleSaveGroup(e) {
    e.preventDefault();

    if (!editForm.nombre.trim()) {
      setEditError("El nombre del grupo es requerido");
      return;
    }
    if (!editForm.id_lider) {
      setEditError("Debe seleccionar un administrador (líder) para el grupo");
      return;
    }

    if (!editingGroupId) {
      setEditError("No se pudo identificar el grupo a editar");
      return;
    }

    try {
      setEditSaving(true);
      const response = await api.patch(`/groups/admin/${editingGroupId}`, {
        nombre: editForm.nombre.trim(),
        descripcion: editForm.descripcion.trim(),
        id_lider: Number(editForm.id_lider),
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

  const groupBeingEdited = editingGroupId ? grupos.find(grupo => grupo.id_grupo === editingGroupId) : null;
  const filteredAvailableUsers = eligibleLeaders.filter(usuario => {
    if (groupBeingEdited && groupBeingEdited.participantes) {
      const isMember = groupBeingEdited.participantes.some(p => p.id_usuario === usuario.id_usuario);
      if (isMember) return false;
    }

    const search = userSearchQuery.trim().toLowerCase();
    if (!search) return true;

    const fullName = `${usuario.nombre || ""} ${usuario.apellido || ""}`.toLowerCase();
    const mail = String(usuario.mail || "").toLowerCase();
    return fullName.includes(search) || mail.includes(search);
  });

  const filteredCreateUsers = eligibleLeaders.filter(usuario => {
    const search = createSearchQuery.trim().toLowerCase();
    if (!search) return true;
    const fullName = ((usuario.nombre || "") + " " + (usuario.apellido || "")).toLowerCase();
    const mail = String(usuario.mail || "").toLowerCase();
    return fullName.includes(search) || mail.includes(search);
  });

  return (
    <section className="space-y-8">
      <header>
        <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Administración</p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Gestión de Grupos</h1>
        <p className="mt-2 text-[1rem] text-[var(--text-muted)]">Crea y administra los grupos de usuarios del sistema</p>
      </header>

      <section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Nuevo grupo</p>
            <h2 className="mt-1 mb-0 text-[1.1rem] font-semibold text-[var(--text)]">Crear un nuevo grupo</h2>
            <p className="mt-1 mb-0 text-[0.94rem] text-[var(--text-muted)]">Crea grupos y asigna un administrador para que gestione a sus miembros.</p>
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
          <h3 className="mt-4 text-lg font-semibold text-[var(--text)]">No hay grupos registrados</h3>
          <p className="mt-2 text-[var(--text-muted)]">Crea el primer grupo para comenzar</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-sm bg-[var(--primary)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--primary-strong)]"
          >
            <Plus className="h-4 w-4" />
            Crear Grupo
          </button>
        </div>
      ) : (
        <div className="rounded-sm border border-[#d9e2e5] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e5eaee] pb-4">
            <div>
              <h2 className="m-0 text-[1.05rem] font-semibold text-[var(--text)]">Todos los grupos</h2>
              <p className="m-0 mt-1 text-sm text-[var(--text-muted)]">Administra los grupos registrados en la plataforma.</p>
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
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#eef7ef] text-[#177945]">
                          Gestionado por admin
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
          setFormData({ nombre: "", descripcion: "", id_lider: "" });
          setSelectedCreateUserIds([]);
          setCreateSearchQuery("");
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
          setFormData({ nombre: "", descripcion: "", id_lider: "" });
          setSelectedCreateUserIds([]);
          setCreateSearchQuery("");
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
              <label className="mb-2 block text-[0.84rem] font-semibold text-[var(--text)]">Administrador (Líder) *</label>
              {leadersLoading ? (
                 <p className="text-sm text-gray-500">Cargando usuarios elegibles...</p>
              ) : (
                <select
                  value={formData.id_lider}
                  onChange={(e) => setFormData({ ...formData, id_lider: e.target.value })}
                  className="w-full rounded-sm border border-[#d2ded7] bg-white px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[#05a63d]/20"
                >
                  <option value="">-- Selecciona un administrador --</option>
                  {eligibleLeaders.map(lider => (
                    <option key={lider.id_usuario} value={lider.id_usuario}>
                      {lider.nombre} {lider.apellido} ({lider.mail})
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-1 text-xs text-[var(--text-muted)]">El administrador del sistema no puede ser asignado.</p>
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
            <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text)]">Usuarios para agregar</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">Selecciona uno o varios usuarios como miembros iniciales.</p>
                </div>
                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
                  {selectedCreateUserIds.length} seleccionados
                </span>
              </div>

              {leadersLoading ? (
                <div className="mt-4 rounded-lg border border-dashed border-[var(--panel-border)] bg-white px-4 py-5 text-center text-sm text-[var(--text-muted)]">
                  Cargando usuarios disponibles...
                </div>
              ) : eligibleLeaders.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-[var(--panel-border)] bg-white px-4 py-5 text-center text-sm text-[var(--text-muted)]">
                  No hay usuarios disponibles para agregar.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={createSearchQuery}
                      onChange={(e) => setCreateSearchQuery(e.target.value)}
                      placeholder="Buscar usuarios por nombre o correo"
                      className="w-full rounded-xl border border-[var(--panel-border)] bg-white py-2.5 pl-10 pr-3 text-[var(--text)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                  </div>

                  {filteredCreateUsers.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[var(--panel-border)] bg-white px-4 py-5 text-center text-sm text-[var(--text-muted)]">
                      No se encontraron usuarios con ese filtro.
                    </div>
                  ) : (
                    <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
                      {filteredCreateUsers.map(usuario => {
                        const userId = String(usuario.id_usuario);
                        if (userId === formData.id_lider) return null;

                        const isSelected = selectedCreateUserIds.includes(userId);
                        const displayName = (usuario.nombre || "") + " " + (usuario.apellido || "");
                        const displayFinal = displayName.trim() || usuario.mail || "Usuario";

                        return (
                          <button
                            key={usuario.id_usuario}
                            type="button"
                            onClick={() => {
                              setSelectedCreateUserIds(previous => (
                                isSelected
                                  ? previous.filter(id => id !== userId)
                                  : [...previous, userId]
                              ));
                            }}
                            className={`transition-colors flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left ${
                              isSelected
                                ? "border-[var(--primary)] bg-[var(--surface-soft)]"
                                : "border-[var(--panel-border)] bg-white hover:bg-[var(--surface-soft)]"
                            }`}
                          >
                            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${isSelected ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-soft)] text-[var(--text-muted)]"}`}>
                              <User className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-[var(--text)]">{displayFinal}</p>
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
            <button
              type="button"
              onClick={() => {
                if (!editingGroupId) return;
                closeEditModal();
                confirmDeleteGroup(editingGroupId);
              }}
              className="rounded-sm border border-[#efcdc7] bg-[#fff6f4] px-4 py-2.5 text-[0.9rem] font-semibold text-[#8b2f22] transition-colors hover:bg-[#fff0ed]"
            >
              Eliminar
            </button>
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
                <label className="mb-2 block text-[0.84rem] font-semibold text-[var(--text)]">Administrador (Líder) *</label>
                {leadersLoading ? (
                   <p className="text-sm text-gray-500">Cargando usuarios elegibles...</p>
                ) : (
                  <select
                    value={editForm.id_lider}
                    onChange={(e) => setEditForm({ ...editForm, id_lider: e.target.value })}
                    className="w-full rounded-sm border border-[#d2ded7] bg-white px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[#05a63d]/20"
                  >
                    <option value="">-- Selecciona un administrador --</option>
                    {eligibleLeaders.map(lider => (
                      <option key={lider.id_usuario} value={lider.id_usuario}>
                        {lider.nombre} {lider.apellido} ({lider.mail})
                      </option>
                    ))}
                  </select>
                )}
                <p className="mt-1 text-xs text-[var(--text-muted)]">Puedes cambiar el líder del grupo en cualquier momento.</p>
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

              {leadersLoading ? (
                <div className="mt-4 rounded-lg border border-dashed border-[var(--panel-border)] bg-white px-4 py-5 text-center text-sm text-[var(--text-muted)]">
                  Cargando usuarios disponibles...
                </div>
              ) : eligibleLeaders.length === 0 ? (
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
                        if (userId === editForm.id_lider) return null;

                        const isSelected = selectedUserIds.includes(userId);
                        const displayName = (usuario.nombre || "") + " " + (usuario.apellido || "");
                        const displayFinal = displayName.trim() || usuario.mail || "Usuario";

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
                              <p className="truncate font-semibold text-[var(--text)]">{displayFinal}</p>
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
                    {groupBeingEdited.participantes.map(participante => {
                      if (String(participante.id_usuario) === editForm.id_lider) return null;
                      const isRemoving = removingMemberId === participante.id_usuario;
                      return (
                      <span
                        key={participante.id_usuario}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white pl-3 pr-1.5 py-1 text-xs text-[var(--text)] ring-1 ring-[var(--panel-border)]"
                      >
                        <User className="h-4 w-4 text-[var(--text-muted)]" />
                        <span className="truncate">{participante.nombre}</span>
                        <button
                          type="button"
                          disabled={isRemoving}
                          onClick={() => handleRemoveMember(participante.id_usuario)}
                          className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                          title="Eliminar miembro"
                        >
                          {isRemoving ? (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--text-muted)] border-t-transparent" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </span>
                    )})}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        title="Eliminar grupo"
        onClose={() => { setShowDeleteModal(false); setDeleteTargetId(null); }}
        panelClassName="sm:max-w-[440px]"
        footer={
          <div className="flex w-full items-center gap-3">
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => { setShowDeleteModal(false); setDeleteTargetId(null); }}
              className="rounded-sm border border-[#d2ded7] bg-white px-4 py-2.5 text-[0.9rem] font-semibold text-[var(--text)] transition-colors hover:bg-[#f5f9f7]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteGroup}
              className="rounded-sm border border-[#efcdc7] bg-[#8b2f22] px-4 py-2.5 text-[0.9rem] font-semibold text-white transition-colors hover:bg-[#72251a]"
            >
              Eliminar
            </button>
          </div>
        }
      >
        <p className="text-[0.92rem] text-[var(--text)]">
          ¿Estás seguro de que deseas eliminar este grupo? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </section>
  );
}

export default AdminGroups;

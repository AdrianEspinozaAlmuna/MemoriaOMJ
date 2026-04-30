import React, { useMemo, useState, useEffect } from "react";
import { DoorOpen, EllipsisVertical, PenLine, CircleCheckBig, SquareMinus, Trash2, X } from "lucide-react";
import Modal from "../components/Modal";
import api from "../services/api";

export default function AdminSettings() {
	const [name, setName] = useState("");
	const [capacity, setCapacity] = useState(30);
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("Todos");
	const [rooms, setRooms] = useState([]);

	useEffect(() => {
		let mounted = true;
		async function loadRooms() {
			try {
				const res = await api.get("/salas");
				if (!mounted) return;
				if (Array.isArray(res.data)) {
					setRooms(res.data.map(s => ({ id: s.id_sala || s.id, name: s.nombre || s.name, capacity: s.capacidad || s.capacity || 0, enabled: (s.estado === "habilitada") || s.enabled || false })));
					return;
				}
			} catch (e) {
				// fallback a datos locales si la llamada falla
			}
			// fallback por defecto
			setRooms([
				{ id: 1, name: "Sala Norte", capacity: 30, enabled: true },
				{ id: 2, name: "Sala Multiuso", capacity: 45, enabled: true },
				{ id: 3, name: "Sala Taller 2", capacity: 20, enabled: false }
			]);
		}

		loadRooms();
		return () => { mounted = false; };
	}, []);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [actionModalOpen, setActionModalOpen] = useState(false);
	const [actionAnchor, setActionAnchor] = useState(null);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editingRoomId, setEditingRoomId] = useState(null);
	const [formValues, setFormValues] = useState({
		name: "",
		capacity: 30
	});

	const stats = useMemo(() => {
		const enabled = rooms.filter(room => room.enabled).length;
		return {
			total: rooms.length,
			enabled,
			disabled: rooms.length - enabled
		};
	}, [rooms]);

	const filteredRooms = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();

		return rooms.filter(room => {
			const statusMatch = statusFilter === "Todos" || (statusFilter === "Habilitada" ? room.enabled : !room.enabled);
			const searchMatch = !term || room.name.toLowerCase().includes(term);

			return statusMatch && searchMatch;
		});
	}, [rooms, searchTerm, statusFilter]);

	const editingRoom = useMemo(() => rooms.find(room => room.id === editingRoomId) || null, [editingRoomId, rooms]);

	async function addRoom() {
		if (!name.trim()) {
			setError("Ingresa un nombre de sala.");
			return;
		}

		if (capacity < 1 || capacity > 300) {
			setError("La capacidad debe estar entre 1 y 300.");
			return;
		}

		try {
			const response = await api.post("/salas", {
				nombre: name.trim(),
				capacidad: capacity,
				estado: "habilitada"
			});

			const newRoom = {
				id: response.data.id_sala || response.data.id,
				name: response.data.nombre || name.trim(),
				capacity: response.data.capacidad || capacity,
				enabled: (response.data.estado === "habilitada") || true
			};

			setRooms(previous => [newRoom, ...previous]);
			setName("");
			setCapacity(30);
			setError("");
			setCreateModalOpen(false);
		} catch (err) {
			setError(err?.response?.data?.message || "Error al crear la sala");
		}
	}

	function openCreateModal() {
		setError("");
		setName("");
		setCapacity(30);
		setCreateModalOpen(true);
	}

	function closeCreateModal() {
		setCreateModalOpen(false);
		setError("");
	}

	function openActionModal(room, event) {
		setSelectedRoom(room);
		setActionModalOpen(true);
		try {
			const rect = event.currentTarget.getBoundingClientRect();
			setActionAnchor(rect);
		} catch (e) {
			setActionAnchor(null);
		}
	}

	function closeActionModal() {
		setActionModalOpen(false);
		setSelectedRoom(null);
		setActionAnchor(null);
	}

	function openEditModal(room) {
		setEditingRoomId(room.id);
		setFormValues({
			name: room.name,
			capacity: room.capacity
		});
		setEditModalOpen(true);
	}

	function closeEditModal() {
		setEditModalOpen(false);
		setEditingRoomId(null);
	}

	async function saveRoomChanges() {
		if (!editingRoom) return;

		if (!formValues.name.trim()) {
			setError("Ingresa un nombre de sala.");
			return;
		}

		if (formValues.capacity < 1 || formValues.capacity > 300) {
			setError("La capacidad debe estar entre 1 y 300.");
			return;
		}

		try {
			await api.patch(`/salas/${editingRoom.id}`, {
				nombre: formValues.name.trim(),
				capacidad: formValues.capacity
			});

			setRooms(previous => previous.map(room => room.id === editingRoom.id ? { ...room, name: formValues.name.trim(), capacity: formValues.capacity } : room));
			setError("");
			closeEditModal();
			closeActionModal();
		} catch (err) {
			setError(err?.response?.data?.message || "Error al actualizar la sala");
		}
	}

	function toggleRoom(id) {
		setRooms(previous =>
			previous.map(room =>
				room.id === id
					? {
						...room,
						enabled: !room.enabled
					}
					: room
			)
		);
	}

	function deleteRoom(id) {
		setRooms(previous => previous.filter(room => room.id !== id));
		closeActionModal();
	}

	async function toggleSelectedRoom() {
		if (!selectedRoom) return;
		try {
			const newState = !selectedRoom.enabled ? "habilitada" : "deshabilitada";
			await api.patch(`/salas/${selectedRoom.id}`, {
				estado: newState
			});
			toggleRoom(selectedRoom.id);
			setSelectedRoom(prevRoom => prevRoom ? { ...prevRoom, enabled: !prevRoom.enabled } : null);
			closeActionModal();
		} catch (err) {
			setError(err?.response?.data?.message || "Error al cambiar el estado de la sala");
		}
	}

	async function removeSelectedRoom() {
		if (!selectedRoom) return;
		try {
			await api.delete(`/salas/${selectedRoom.id}`);
			deleteRoom(selectedRoom.id);
		} catch (err) {
			setError(err?.response?.data?.message || "Error al eliminar la sala");
		}
	}

	return (
		<section className="animate-[revealUp_0.7s_ease_both] space-y-8">
			<header className="space-y-2">
				<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
				<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Configuracion de salas</h1>
				<p className="max-w-3xl text-[0.92rem] text-[var(--text-muted)]">Gestion simple para crear, habilitar o eliminar salas disponibles.</p>
			</header>

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				<article className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5 transition-colors">
					<div className="flex items-center justify-between gap-2">
						<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[var(--text)]">Total salas</p>
						<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--primary)]">
							<DoorOpen className="h-4 w-4" strokeWidth={1.9} />
						</span>
					</div>
					<strong className="mt-2 block text-[1.7rem] font-bold leading-none text-[var(--primary)]">{stats.total}</strong>
				</article>
				<article className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5 transition-colors">
					<div className="flex items-center justify-between gap-2">
						<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[var(--text)]">Habilitadas</p>
						<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--primary)]">
							<CircleCheckBig className="h-4 w-4" strokeWidth={1.9} />
						</span>
					</div>
					<strong className="mt-2 block text-[1.7rem] font-bold leading-none text-[var(--primary)]">{stats.enabled}</strong>
				</article>
				<article className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5 transition-colors">
					<div className="flex items-center justify-between gap-2">
						<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[var(--text)]">Deshabilitadas</p>
						<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--primary)]">
							<SquareMinus className="h-4 w-4" strokeWidth={1.9} />
						</span>
					</div>
					<strong className="mt-2 block text-[1.7rem] font-bold leading-none text-[var(--primary)]">{stats.disabled}</strong>
				</article>
			</section>

			<section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
				<div className="mb-4 flex items-baseline justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
					<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Gestion de salas</h2>
					<div className="flex items-center gap-3 max-[760px]:flex-wrap">
						<p className="m-0 text-[0.9rem] text-[var(--text-muted)]">Mostrando {filteredRooms.length} salas</p>
						<button type="button" className="inline-flex items-center gap-2 rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-3.5 py-2 text-[0.9rem] font-semibold text-white hover:bg-[#0a7f3d]" onClick={openCreateModal}>
							<DoorOpen className="h-4 w-4" strokeWidth={1.9} />
							Agregar sala
						</button>
					</div>
				</div>

				<div className="mb-6 grid items-center gap-4 min-[761px]:grid-cols-[1.25fr_auto]">
					<div>
						<input
							className="w-full rounded-sm border border-[#d8e6dd] bg-white px-2.5 py-1.5 text-[0.84rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
							placeholder="Buscar salas"
							value={searchTerm}
							onChange={event => setSearchTerm(event.target.value)}
						/>
					</div>
					<div className="flex flex-wrap items-center justify-start gap-2 min-[761px]:justify-end">
						<label className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-[var(--text-muted)]">
							Estado:
							<select className="rounded-sm border border-[#d8e6dd] bg-white px-2 py-1 text-[0.78rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
								<option value="Todos">Todos</option>
								<option value="Habilitada">Habilitada</option>
								<option value="Deshabilitada">Deshabilitada</option>
							</select>
						</label>
					</div>
				</div>

				<div className="mt-5 overflow-x-auto rounded-[10px]">
					<table className="w-full min-w-[760px] text-[0.89rem] max-[640px]:min-w-[700px]">
						<thead>
							<tr>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-center text-[0.73rem] font-semibold text-[var(--text-muted)]">Sala</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-center text-[0.73rem] font-semibold text-[var(--text-muted)]">Capacidad</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-center text-[0.73rem] font-semibold text-[var(--text-muted)]">Estado</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-center text-[0.73rem] font-semibold text-[var(--text-muted)]">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{filteredRooms.map(room => (
								<tr key={room.id}>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-center">
										<span className="block text-[0.9rem] font-semibold text-[var(--text)]">{room.name}</span>
									</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-center text-[var(--text)]">{room.capacity} personas</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-center">
										<span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.82rem] font-semibold ${room.enabled ? "text-[var(--primary-strong)]" : "text-[#ad4334]"}`}>
											{room.enabled ? "Habilitada" : "Deshabilitada"}
										</span>
									</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-center">
										<div className="flex flex-wrap justify-center gap-2">
											<button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-[#d8e6dd] bg-white text-[#355447] hover:bg-[#f5f7f5]" onClick={(e) => openActionModal(room, e)} aria-label="Abrir acciones">
												<EllipsisVertical className="h-4 w-4" strokeWidth={2} />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

			{actionModalOpen && actionAnchor && (
				<div style={{ position: "fixed", top: actionAnchor.bottom + 8, left: Math.max(8, actionAnchor.left - 200) }} className="z-50 w-[300px] rounded-[10px] border border-[#dce3ea] bg-white p-2 shadow-[0_14px_30px_-18px_rgba(12,30,16,0.45)]">
					<div className="grid gap-2 px-2 py-2">
						<button type="button" className="flex items-center gap-2 rounded-sm border border-[#d8e6dd] bg-white px-3 py-2.5 text-left text-[0.9rem] font-semibold text-[#2f463a] hover:bg-[#f5f7f5]" onClick={() => { if (selectedRoom) openEditModal(selectedRoom); closeActionModal(); }}>
							<PenLine className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
							Editar
						</button>
						<button type="button" className={`flex items-center gap-2 rounded-sm border px-3 py-2.5 text-left text-[0.9rem] font-semibold ${selectedRoom?.enabled ? "border-[#f0cbc2] bg-[#fff1ed] text-[#8a3b2a] hover:bg-[#ffe4d9]" : "border-[#cde2d5] bg-[#eef8f1] text-[#1f5137] hover:bg-[#e7f5ec]"}`} onClick={() => { toggleRoom(selectedRoom.id); closeActionModal(); }}>
							{selectedRoom?.enabled ? <SquareMinus className="h-4 w-4" strokeWidth={2} /> : <CircleCheckBig className="h-4 w-4" strokeWidth={2} />}
							{selectedRoom?.enabled ? "Deshabilitar" : "Habilitar"}
						</button>
						<button type="button" className="flex items-center gap-2 rounded-sm border border-[#ead6d2] bg-white px-3 py-2.5 text-left text-[0.9rem] font-semibold text-[var(--reject-hover)] hover:bg-[#fff6f4]" onClick={() => { removeSelectedRoom(); closeActionModal(); }}>
							<Trash2 className="h-4 w-4" strokeWidth={2} />
							Eliminar
						</button>
					</div>
				</div>
			)}
			</section>

			<Modal
				isOpen={createModalOpen}
				title="Agregar sala"
				onClose={closeCreateModal}
				hideHeader
				panelClassName="sm:max-w-[520px] sm:rounded-[16px] sm:border-[#d7e4dc] sm:shadow-[0_22px_46px_-30px_rgba(16,24,40,0.48)]"
				contentClassName="px-0 pb-0 pt-0"
				footerClassName="border-t border-[#dce7df] bg-[#f8fbf9] px-5 py-4 sm:px-6"
				footer={
					<>
						<button type="button" className="btn btn-ghost btn-inline" onClick={closeCreateModal}>
							Cancelar
						</button>
						<button type="button" className="btn btn-primary btn-inline" onClick={addRoom}>
							Agregar sala
						</button>
					</>
				}
			>
				<div className="border-b border-[#dce7df] bg-[linear-gradient(180deg,#f8fbf9,rgba(248,251,249,0.88))] px-5 py-5 sm:px-6">
					<div>
						<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Gestion interna</p>
						<h3 className="mt-1 text-[1.08rem] font-semibold text-[var(--text)]">Nueva sala</h3>
						<p className="mt-1 mb-0 text-[0.88rem] text-[var(--text-muted)]">Crea una sala con nombre y capacidad inicial.</p>
					</div>
				</div>

				<div className="grid gap-4 px-5 py-5 sm:px-6">
					<label className="grid gap-1.5">
						<span className="text-[0.85rem] font-semibold text-[var(--text)]">Nombre de sala</span>
						<input className="rounded-sm border border-[#d8e6dd] bg-white px-2.5 py-1.5 text-[0.84rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" value={name} onChange={event => { setName(event.target.value); if (error) setError(""); }} placeholder="Ejemplo: Sala Oriente" />
					</label>

					<label className="grid gap-1.5">
						<span className="text-[0.85rem] font-semibold text-[var(--text)]">Capacidad</span>
						<input type="number" min={1} max={300} className="rounded-sm border border-[#d8e6dd] bg-white px-2.5 py-1.5 text-[0.84rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" value={capacity} onChange={event => { setCapacity(Number(event.target.value)); if (error) setError(""); }} />
					</label>

					{error && <p className="m-0 text-[0.82rem] font-semibold text-[#a03d2e]">{error}</p>}
				</div>
			</Modal>

			<Modal
				isOpen={editModalOpen}
				title="Editar sala"
				onClose={closeEditModal}
				hideHeader
				panelClassName="sm:max-w-[520px] sm:rounded-[16px] sm:border-[#d7e4dc] sm:shadow-[0_22px_46px_-30px_rgba(16,24,40,0.48)]"
				contentClassName="px-0 pb-0 pt-0"
				footerClassName="border-t border-[#dce7df] bg-[#f8fbf9] px-5 py-4 sm:px-6"
				footer={
					<>
						<button type="button" className="btn btn-ghost btn-inline" onClick={closeEditModal}>
							Cancelar
						</button>
						<button type="button" className="btn btn-primary btn-inline" onClick={saveRoomChanges}>
							Guardar cambios
						</button>
					</>
				}
			>
				<div className="border-b border-[#dce7df] bg-[linear-gradient(180deg,#f8fbf9,rgba(248,251,249,0.88))] px-5 py-5 sm:px-6">
					<div>
						<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Gestion interna</p>
						<h3 className="mt-1 text-[1.08rem] font-semibold text-[var(--text)]">Editar sala</h3>
						<p className="mt-1 mb-0 text-[0.88rem] text-[var(--text-muted)]">Actualiza nombre y capacidad de la sala.</p>
					</div>
				</div>

				<div className="grid gap-4 px-5 py-5 sm:px-6">
					<label className="grid gap-1.5">
						<span className="text-[0.85rem] font-semibold text-[var(--text)]">Nombre de sala</span>
						<input className="rounded-sm border border-[#d8e6dd] bg-white px-2.5 py-1.5 text-[0.84rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" value={formValues.name} onChange={event => setFormValues(previous => ({ ...previous, name: event.target.value }))} />
					</label>

					<label className="grid gap-1.5">
						<span className="text-[0.85rem] font-semibold text-[var(--text)]">Capacidad</span>
						<input type="number" min={1} max={300} className="rounded-sm border border-[#d8e6dd] bg-white px-2.5 py-1.5 text-[0.84rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" value={formValues.capacity} onChange={event => setFormValues(previous => ({ ...previous, capacity: Number(event.target.value) }))} />
					</label>

					{error && <p className="m-0 text-[0.82rem] font-semibold text-[#a03d2e]">{error}</p>}
				</div>
			</Modal>
		</section>
	);
}


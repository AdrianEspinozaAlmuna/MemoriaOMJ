import React, { useEffect, useMemo, useState } from "react";
import { Pencil, ShieldCheck, UserCheck, UserPlus, UserRoundPlus, Users } from "lucide-react";
import Modal from "../components/Modal";

const initialUsers = [
	{ id: 1, nombre: "Camila", apellido: "Torres", rut: "12345678-9", mail: "camila@email.cl", telefono: "987654321", estado: true, rol: "participante", fechaRegistro: "2025-04-10" },
	{ id: 2, nombre: "Diego", apellido: "Perez", rut: "23456789-0", mail: "diego@email.cl", telefono: "912345678", estado: true, rol: "participante", fechaRegistro: "2025-02-18" },
	{ id: 3, nombre: "Valentina", apellido: "Rojas", rut: "34567890-1", mail: "vale@email.cl", telefono: "923456789", estado: false, rol: "participante", fechaRegistro: "2024-10-22" },
	{ id: 4, nombre: "Matias", apellido: "Silva", rut: "45678901-2", mail: "matias@email.cl", telefono: "934567890", estado: true, rol: "participante", fechaRegistro: "2025-01-12" },
	{ id: 5, nombre: "Sofia", apellido: "Munoz", rut: "56789012-3", mail: "sofia@email.cl", telefono: "945678901", estado: true, rol: "admin", fechaRegistro: "2024-12-03" },
	{ id: 6, nombre: "Lucas", apellido: "Ramirez", rut: "67890123-4", mail: "lucas@email.cl", telefono: "956789012", estado: false, rol: "participante", fechaRegistro: "2025-03-05" }
];

export default function AdminUsers() {
	const ITEMS_PER_PAGE = 10;
	const [users, setUsers] = useState(initialUsers);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("Todos");
	const [roleFilter, setRoleFilter] = useState("Todos");
	const [currentPage, setCurrentPage] = useState(1);
	const [editingUserId, setEditingUserId] = useState(null);
	const [formValues, setFormValues] = useState({
		fullName: "",
		lastName: "",
		rut: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: ""
	});

	const summary = useMemo(() => {
		return {
			total: users.length,
			active: users.filter(user => user.estado).length,
			admins: users.filter(user => user.rol === "admin").length,
			newThisMonth: users.filter(user => {
				const date = new Date(user.fechaRegistro);
				const now = new Date();
				return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
			}).length
		};
	}, [users]);

	const editingUser = useMemo(() => users.find(user => user.id === editingUserId) || null, [editingUserId, users]);

	const filteredUsers = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();

		return users.filter(user => {
			const statusMatch = statusFilter === "Todos" || (statusFilter === "Habilitado" ? user.estado : !user.estado);
			const roleMatch = roleFilter === "Todos" || user.rol === roleFilter.toLowerCase();
			const searchMatch =
				!term ||
				`${user.nombre} ${user.apellido}`.toLowerCase().includes(term) ||
				user.rut.toLowerCase().includes(term) ||
				user.mail.toLowerCase().includes(term) ||
				(user.telefono || "").toLowerCase().includes(term);

			return statusMatch && roleMatch && searchMatch;
		});
	}, [users, searchTerm, statusFilter, roleFilter]);

	const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
	const safeCurrentPage = Math.min(currentPage, totalPages);

	const paginatedUsers = useMemo(() => {
		const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
		return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
	}, [filteredUsers, safeCurrentPage]);

	const paginationRange = useMemo(() => {
		if (filteredUsers.length === 0) return { start: 0, end: 0 };
		const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
		const end = Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredUsers.length);
		return { start, end };
	}, [filteredUsers.length, safeCurrentPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, statusFilter, roleFilter]);

	function handleFieldChange(event) {
		const { name, value } = event.target;
		setFormValues(previous => ({ ...previous, [name]: value }));
	}

	function openModal() {
		setError("");
		setFormValues({
			fullName: "",
			lastName: "",
			rut: "",
			email: "",
			phone: "",
			password: "",
			confirmPassword: ""
		});
		setIsModalOpen(true);
	}

	function openEditModal(user) {
		setError("");
		setEditingUserId(user.id);
		setFormValues({
			fullName: user.nombre,
			lastName: user.apellido,
			rut: user.rut,
			email: user.mail,
			phone: user.telefono || "",
			password: "",
			confirmPassword: ""
		});
		setIsEditModalOpen(true);
	}

	function closeModal() {
		setIsModalOpen(false);
		setError("");
	}

	function closeEditModal() {
		setIsEditModalOpen(false);
		setEditingUserId(null);
		setError("");
	}

	function validateUserForm({ requirePassword }) {
		if (!formValues.fullName.trim()) return "Ingresa el nombre.";
		if (!formValues.lastName.trim()) return "Ingresa el apellido.";
		if (!/^\d{7,8}-[\dkK]$/.test(formValues.rut.trim())) return "El RUT debe tener formato 12345678-9.";
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email.trim())) return "El correo electronico no es valido.";
		if (!/^\d{8,11}$/.test(formValues.phone.trim())) return "El telefono debe tener entre 8 y 11 digitos.";
		if (requirePassword) {
			if (formValues.password.length < 8) return "La contrasena debe tener al menos 8 caracteres.";
			if (formValues.confirmPassword !== formValues.password) return "Las contrasenas no coinciden.";
		}

		return "";
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setError("");

		const validationError = validateUserForm({ requirePassword: true });
		if (validationError) {
			setError(validationError);
			return;
		}

		setLoading(true);
		try {
			setUsers(previous => [
				{
					id: Date.now(),
					nombre: formValues.fullName.trim(),
					apellido: formValues.lastName.trim(),
					rut: formValues.rut.trim(),
					mail: formValues.email.trim().toLowerCase(),
					telefono: formValues.phone.trim(),
					estado: true,
					rol: "admin",
					fechaRegistro: new Date().toISOString().slice(0, 10)
				},
				...previous
			]);
			closeModal();
		} finally {
			setLoading(false);
		}
	}

	async function handleEditSubmit(event) {
		event.preventDefault();
		setError("");

		const validationError = validateUserForm({ requirePassword: false });
		if (validationError) {
			setError(validationError);
			return;
		}

		if (!editingUser) return;

		setLoading(true);
		try {
			setUsers(previous => previous.map(user => {
				if (user.id !== editingUser.id) return user;
				return {
					...user,
					nombre: formValues.fullName.trim(),
					apellido: formValues.lastName.trim(),
					rut: formValues.rut.trim(),
					mail: formValues.email.trim().toLowerCase(),
					telefono: formValues.phone.trim()
				};
			}));
			closeEditModal();
		} finally {
			setLoading(false);
		}
	}

	function toggleUserState(userId) {
		setUsers(previous => previous.map(user => {
			if (user.id !== userId) return user;
			return { ...user, estado: !user.estado };
		}));
	}

	function formatRoleLabel(role) {
		return role === "admin" ? "Admin" : "Participante";
	}

	return (
		<section className="animate-[revealUp_0.7s_ease_both] space-y-8">
			<header className="flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
				<div>
					<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
					<h1 className="mt-2 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Gestion de usuarios</h1>
					<p className="mt-2 text-[0.92rem] text-[var(--text-muted)]">Administra los usuarios registrados en la plataforma.</p>
				</div>
				<button type="button" className="inline-flex items-center gap-2 rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-3.5 py-2 text-[0.9rem] font-semibold text-white hover:bg-[#0a7f3d]" onClick={openModal}>
					<UserRoundPlus aria-hidden="true" focusable="false" className="h-4 w-4" strokeWidth={1.9} />
					Agregar Usuario
				</button>
			</header>

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<article className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5 transition-colors"><div className="flex items-center justify-between gap-2"><p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[var(--text)]">Total Usuarios</p><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--primary)]"><Users className="h-4 w-4" strokeWidth={1.9} /></span></div><strong className="mt-2 block text-[1.7rem] font-bold leading-none text-[var(--primary)]">{summary.total}</strong></article>
				<article className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5 transition-colors"><div className="flex items-center justify-between gap-2"><p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[var(--text)]">Habilitados</p><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--primary)]"><UserCheck className="h-4 w-4" strokeWidth={1.9} /></span></div><strong className="mt-2 block text-[1.7rem] font-bold leading-none text-[var(--primary)]">{summary.active}</strong></article>
				<article className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5 transition-colors"><div className="flex items-center justify-between gap-2"><p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[var(--text)]">Admins</p><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--primary)]"><ShieldCheck className="h-4 w-4" strokeWidth={1.9} /></span></div><strong className="mt-2 block text-[1.7rem] font-bold leading-none text-[var(--primary)]">{summary.admins}</strong></article>
				<article className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5 transition-colors"><div className="flex items-center justify-between gap-2"><p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[var(--text)]">Nuevos (mes)</p><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--primary)]"><UserPlus className="h-4 w-4" strokeWidth={1.9} /></span></div><strong className="mt-2 block text-[1.7rem] font-bold leading-none text-[var(--primary)]">{summary.newThisMonth}</strong></article>
			</section>

			<section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
								<div className="mb-4 flex items-baseline justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
					<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Usuarios</h2>
					<p className="text-[0.92rem] text-[var(--text-muted)]">Mostrando {filteredUsers.length} registros</p>
				</div>
				<div className="mb-6 grid items-center gap-4 min-[761px]:grid-cols-[1.25fr_auto]">
					<div>
						<input className="w-full rounded-sm border border-[#d8e6dd] bg-white px-2.5 py-1.5 text-[0.84rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" placeholder="Buscar usuarios" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} />
					</div>
					<div className="flex flex-wrap items-center justify-start gap-2 min-[761px]:justify-end">
						<label className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-[var(--text-muted)]">
							Estado:
							<select className="rounded-sm border border-[#d8e6dd] bg-white px-2 py-1 text-[0.78rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
								<option value="Todos">Todos</option>
								<option value="Habilitado">Habilitado</option>
								<option value="Deshabilitado">Deshabilitado</option>
							</select>
						</label>
						<label className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-[var(--text-muted)]">
							Rol:
							<select className="rounded-sm border border-[#d8e6dd] bg-white px-2 py-1 text-[0.78rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" value={roleFilter} onChange={event => setRoleFilter(event.target.value)}>
								<option value="Todos">Todos</option>
								<option value="participante">Participante</option>
								<option value="admin">Admin</option>
							</select>
						</label>
					</div>
				</div>
				<div className="overflow-x-auto rounded-[10px]">
					<table className="min-w-[840px] w-full text-[0.89rem] max-[640px]:min-w-[780px]">
						<thead>
							<tr>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Nombre</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Rol</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Estado</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">RUT</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Email</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Telefono</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Registro</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{paginatedUsers.map(user => (
								<tr key={user.id}>
									<td className="border-b border-[#d8e6dd] px-3 py-3">
										<span className="block text-[0.9rem] text-[var(--text)] font-semibold">{`${user.nombre} ${user.apellido}`}</span>
									</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">
										<span className={`inline-flex rounded-md px-2 py-1 `}>
											{formatRoleLabel(user.rol)}
										</span>
									</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3">
										<span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.82rem] font-semibold ${user.estado ? " text-[var(--primary-strong)]" : " text-[#ad4334]"}`}>
											{user.estado ? "Habilitado" : "Deshabilitado"}
										</span>
									</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{user.rut}</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{user.mail}</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{user.telefono || "-"}</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{user.fechaRegistro}</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3">
										<div className="flex flex-wrap gap-2">
											<button type="button" className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-sm  bg-[var(--primary)] text-white transition-colors hover:bg-[var(--primary-strong)]" onClick={() => openEditModal(user)} aria-label="Editar usuario">
												<Pencil className="h-3.5 w-3.5" strokeWidth={2} />
											</button>
											<button type="button" className={`inline-flex w-[108px] justify-center rounded-sm border px-2.5 py-1.5 text-[0.78rem] font-semibold transition-colors ${user.estado ? "border-[#f0cbc2] bg-[#fff1ed] text-[#8a3b2a] hover:bg-[#ffe4d9]" : "border-[#cde2d5] bg-[#eef8f1] text-[#1f5137] hover:bg-[#e7f5ec]"}`} onClick={() => toggleUserState(user.id)}>
												{user.estado ? "Deshabilitar" : "Habilitar"}
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="flex items-center justify-between gap-3 pt-2 text-[0.82rem] text-[#6f8176] max-[760px]:flex-col max-[760px]:items-start">
					<span>Mostrando {paginationRange.start}-{paginationRange.end} de {filteredUsers.length}</span>
					<div className="inline-flex items-center gap-1.5">
						<button type="button" className="rounded-sm border border-[var(--primary-strong)] bg-white px-2.5 py-1 text-[0.8rem] font-semibold text-[#496053] disabled:cursor-not-allowed disabled:border-[#d6e0da] disabled:bg-[#f4f7f5] disabled:text-[#95a59b]" disabled={safeCurrentPage === 1} onClick={() => setCurrentPage(previous => Math.max(1, previous - 1))}>Anterior</button>
						<button type="button" className="rounded-sm px-2.5 py-1 text-[0.8rem] font-semibold text-[#177945]">{safeCurrentPage}</button>
						<button type="button" className="rounded-sm border border-[var(--primary-strong)] bg-white px-2.5 py-1 text-[0.8rem] font-semibold text-[#496053] disabled:cursor-not-allowed disabled:border-[#d6e0da] disabled:bg-[#f4f7f5] disabled:text-[#95a59b]" disabled={safeCurrentPage >= totalPages} onClick={() => setCurrentPage(previous => Math.min(totalPages, previous + 1))}>Siguiente</button>
					</div>
				</div>
			</section>

			<Modal
				isOpen={isModalOpen}
				title="Agregar usuario admin"
				onClose={closeModal}
				hideHeader
				panelClassName="sm:max-w-[820px] sm:rounded-[18px] sm:border-[#d7e4dc] sm:shadow-[0_26px_52px_-32px_rgba(16,24,40,0.45)]"
				contentClassName="px-0 pb-0 pt-0"
				footerClassName="border-t border-[#dce7df] bg-[#f8fbf9] px-6 py-4 sm:px-7"
				footer={
					<>
						<button type="button" className="btn btn-ghost btn-inline" onClick={closeModal}>
							Cancelar
						</button>
						<button type="button" className="btn btn-primary btn-inline" onClick={handleSubmit} disabled={loading}>
							{loading ? "Creando usuario..." : "Crear usuario"}
						</button>
					</>
				}
			>
				<div className="border-b border-[#dce7df] bg-[linear-gradient(180deg,#f8fbf9,rgba(248,251,249,0.88))] px-6 py-5 sm:px-7">
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							<span className="grid h-11 w-11 place-items-center rounded-[12px] bg-[linear-gradient(180deg,var(--primary),var(--primary-strong))] text-white shadow-[0_10px_22px_-18px_rgba(5,166,61,0.55)]">
								<UserPlus className="h-5 w-5" strokeWidth={1.9} />
							</span>
							<div>
								<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Nuevo usuario</p>
								<h3 className="mt-1 text-[1.15rem] font-semibold text-[var(--text)]">Crear cuenta con acceso de administrador</h3>
								<p className="mt-1 max-w-[56ch] text-[0.88rem] text-[var(--text-muted)]">Completa los datos personales y la credencial inicial para dejar listo el acceso interno.</p>
							</div>
						</div>
						<button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d7e0d9] bg-white text-[#496053] transition-colors hover:bg-[#f4f7f5]" onClick={closeModal} aria-label="Cerrar modal">
							×
						</button>
					</div>
				</div>

				<form className="grid gap-4 px-6 py-5 sm:px-7" onSubmit={handleSubmit} noValidate>
					<div className="grid gap-4 rounded-[14px] border border-[#dce7df] bg-white p-4 shadow-[0_8px_18px_-20px_rgba(16,24,40,0.28)] sm:grid-cols-2">
						<div className="grid gap-1.5 sm:col-span-2">
							<label className="text-[0.82rem] font-semibold text-[#2f4438]" htmlFor="admin-email">Correo electronico</label>
							<input id="admin-email" name="email" className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3 py-2.5 text-[0.9rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]" type="email" placeholder="admin@correo.com" value={formValues.email} onChange={handleFieldChange} autoComplete="email" />
						</div>

						<div className="grid gap-1.5">
							<label className="text-[0.82rem] font-semibold text-[#2f4438]" htmlFor="admin-fullName">Nombre</label>
							<input id="admin-fullName" name="fullName" className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3 py-2.5 text-[0.9rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]" type="text" placeholder="Nombre" value={formValues.fullName} onChange={handleFieldChange} />
						</div>
						<div className="grid gap-1.5">
							<label className="text-[0.82rem] font-semibold text-[#2f4438]" htmlFor="admin-lastName">Apellido</label>
							<input id="admin-lastName" name="lastName" className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3 py-2.5 text-[0.9rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]" type="text" placeholder="Apellido" value={formValues.lastName} onChange={handleFieldChange} />
						</div>

						<div className="grid gap-1.5">
							<label className="text-[0.82rem] font-semibold text-[#2f4438]" htmlFor="admin-rut">RUT</label>
							<input id="admin-rut" name="rut" className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3 py-2.5 text-[0.9rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]" type="text" placeholder="12345678-9" value={formValues.rut} onChange={handleFieldChange} />
						</div>
						<div className="grid gap-1.5">
							<label className="text-[0.82rem] font-semibold text-[#2f4438]" htmlFor="admin-phone">Telefono</label>
							<input id="admin-phone" name="phone" className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3 py-2.5 text-[0.9rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]" type="text" placeholder="987654321" value={formValues.phone} onChange={handleFieldChange} />
						</div>

						<div className="grid gap-1.5">
							<label className="text-[0.82rem] font-semibold text-[#2f4438]" htmlFor="admin-password">Contrasena</label>
							<input id="admin-password" name="password" className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3 py-2.5 text-[0.9rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]" type="password" placeholder="Minimo 8 caracteres" value={formValues.password} onChange={handleFieldChange} autoComplete="new-password" />
						</div>
						<div className="grid gap-1.5">
							<label className="text-[0.82rem] font-semibold text-[#2f4438]" htmlFor="admin-confirmPassword">Confirmar contrasena</label>
							<input id="admin-confirmPassword" name="confirmPassword" className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3 py-2.5 text-[0.9rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]" type="password" placeholder="Minimo 8 caracteres" value={formValues.confirmPassword} onChange={handleFieldChange} autoComplete="new-password" />
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-[12px] border border-[#dce7df] bg-[#f8fbf9] px-4 py-3">
							<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Rol asignado</p>
							<p className="mt-1 text-[0.9rem] font-semibold text-[var(--text)]">Administrador</p>
							<p className="mt-1 text-[0.82rem] text-[var(--text-muted)]">El usuario quedará habilitado desde el momento de creación.</p>
						</div>
						<div className="rounded-[12px] border border-[#dce7df] bg-[#f8fbf9] px-4 py-3">
							<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Acceso inicial</p>
							<p className="mt-1 text-[0.9rem] font-semibold text-[var(--text)]">Credenciales temporales</p>
							<p className="mt-1 text-[0.82rem] text-[var(--text-muted)]">Recomienda cambiar la contrasena en el primer ingreso.</p>
						</div>
					</div>

					{error && <p className="m-0 rounded-lg border border-[#f2cbc4] bg-[#fff0ee] px-3 py-2 text-[0.84rem] font-semibold text-[#8f3526]">{error}</p>}
				</form>
			</Modal>

			<Modal
				isOpen={isEditModalOpen}
				title="Editar usuario"
				onClose={closeEditModal}
				hideHeader
				panelClassName="sm:max-w-[760px] sm:rounded-[18px] sm:border-[#d7e4dc] sm:shadow-[0_26px_52px_-32px_rgba(16,24,40,0.45)]"
				contentClassName="px-0 pb-0 pt-0"
				footerClassName="border-t border-[#dce7df] bg-[#f8fbf9] px-6 py-4 sm:px-7"
				footer={
					<>
						<button type="button" className="btn btn-ghost btn-inline" onClick={closeEditModal}>
							Cancelar
						</button>
						<button type="button" className="btn btn-primary btn-inline" onClick={handleEditSubmit} disabled={loading}>
							{loading ? "Guardando..." : "Guardar cambios"}
						</button>
					</>
				}
			>
				<div className="border-b border-[#dce7df] bg-[linear-gradient(180deg,#f8fbf9,rgba(248,251,249,0.88))] px-6 py-5 sm:px-7">
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							<span className="grid h-11 w-11 place-items-center rounded-[12px] bg-[linear-gradient(180deg,var(--primary),var(--primary-strong))] text-white shadow-[0_10px_22px_-18px_rgba(5,166,61,0.55)]">
								<Pencil className="h-5 w-5" strokeWidth={1.9} />
							</span>
							<div>
								<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Editar usuario</p>
								<h3 className="mt-1 text-[1.15rem] font-semibold text-[var(--text)]">Ajusta la informacion personal y de contacto</h3>
								<p className="mt-1 max-w-[56ch] text-[0.88rem] text-[var(--text-muted)]">Mantén la ficha al día sin cambiar el acceso ni el estado desde aquí.</p>
							</div>
						</div>
						<button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d7e0d9] bg-white text-[#496053] transition-colors hover:bg-[#f4f7f5]" onClick={closeEditModal} aria-label="Cerrar modal">
							×
						</button>
					</div>
				</div>

				<form className="grid gap-4 px-6 py-5 sm:px-7" onSubmit={handleEditSubmit} noValidate>
					<div className="grid gap-4 rounded-[14px] border border-[#dce7df] bg-white p-4 shadow-[0_8px_18px_-20px_rgba(16,24,40,0.28)] sm:grid-cols-2">
						<div className="grid gap-1.5 sm:col-span-2">
							<label className="text-[0.82rem] font-semibold text-[#2f4438]" htmlFor="edit-email">Correo electronico</label>
							<input id="edit-email" name="email" className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3 py-2.5 text-[0.9rem] text-[var(--text)] outline-none transition-shadow duration-200 focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]" type="email" value={formValues.email} onChange={handleFieldChange} />
						</div>

						<div className="grid gap-1.5">
							<label className="text-[0.82rem] font-semibold text-[#2f4438]" htmlFor="edit-fullName">Nombre</label>
							<input id="edit-fullName" name="fullName" className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3 py-2.5 text-[0.9rem] text-[var(--text)] outline-none transition-shadow duration-200 focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]" type="text" value={formValues.fullName} onChange={handleFieldChange} />
						</div>
						<div className="grid gap-1.5">
							<label className="text-[0.82rem] font-semibold text-[#2f4438]" htmlFor="edit-lastName">Apellido</label>
							<input id="edit-lastName" name="lastName" className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3 py-2.5 text-[0.9rem] text-[var(--text)] outline-none transition-shadow duration-200 focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]" type="text" value={formValues.lastName} onChange={handleFieldChange} />
						</div>
						<div className="grid gap-1.5">
							<label className="text-[0.82rem] font-semibold text-[#2f4438]" htmlFor="edit-rut">RUT</label>
							<input id="edit-rut" name="rut" className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3 py-2.5 text-[0.9rem] text-[var(--text)] outline-none transition-shadow duration-200 focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]" type="text" value={formValues.rut} onChange={handleFieldChange} />
						</div>
						<div className="grid gap-1.5">
							<label className="text-[0.82rem] font-semibold text-[#2f4438]" htmlFor="edit-phone">Telefono</label>
							<input id="edit-phone" name="phone" className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3 py-2.5 text-[0.9rem] text-[var(--text)] outline-none transition-shadow duration-200 focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]" type="text" value={formValues.phone} onChange={handleFieldChange} />
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-[12px] border border-[#dce7df] bg-[#f8fbf9] px-4 py-3">
							<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Estado actual</p>
							<p className="mt-1 text-[0.9rem] font-semibold text-[var(--text)]">{editingUser?.estado ? "Habilitado" : "Deshabilitado"}</p>
							<p className="mt-1 text-[0.82rem] text-[var(--text-muted)]">Este ajuste sigue gestionandose desde la tabla principal.</p>
						</div>
						<div className="rounded-[12px] border border-[#dce7df] bg-[#f8fbf9] px-4 py-3">
							<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Rol</p>
							<p className="mt-1 text-[0.9rem] font-semibold text-[var(--text)]">{formatRoleLabel(editingUser?.rol)}</p>
							<p className="mt-1 text-[0.82rem] text-[var(--text-muted)]">El rol no se modifica desde este modal.</p>
						</div>
					</div>

					{error && <p className="m-0 rounded-lg border border-[#f2cbc4] bg-[#fff0ee] px-3 py-2 text-[0.84rem] font-semibold text-[#8f3526]">{error}</p>}
				</form>
			</Modal>
		</section>
	);
}

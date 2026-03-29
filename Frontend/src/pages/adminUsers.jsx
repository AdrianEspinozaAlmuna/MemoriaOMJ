import React from "react";
import { UserRoundPlus } from "lucide-react";

const users = [
	{ name: "Camila Torres", email: "camila@email.cl", rol: "Participante", group: "Grupo A", activities: 12, attendance: "92%", status: "Exitoso", type: "Asignado", signedUp: "Hace 1 ano" },
	{ name: "Diego Perez", email: "diego@email.cl", rol: "Participante", group: "Grupo B", activities: 18, attendance: "88%", status: "Pendiente", type: "Sin asignar", signedUp: "Hace 2 meses" },
	{ name: "Valentina Rojas", email: "vale@email.cl", rol: "Participante", group: "Grupo C", activities: 8, attendance: "75%", status: "Atrasado", type: "Asignado", signedUp: "Hace 8 meses" },
	{ name: "Matias Silva", email: "matias@email.cl", rol: "Participante", group: "Grupo A", activities: 25, attendance: "95%", status: "Exitoso", type: "Suscripcion", signedUp: "Hace 4 meses" },
	{ name: "Sofia Munoz", email: "sofia@email.cl", rol: "Encargado", group: "Grupo B", activities: 15, attendance: "90%", status: "Exitoso", type: "Suscripcion", signedUp: "Hace 1 ano" },
	{ name: "Lucas Ramirez", email: "lucas@email.cl", rol: "Participante", group: "Grupo C", activities: 9, attendance: "67%", status: "Pendiente", type: "Suscripcion", signedUp: "Hace 6 meses" }
];

function initialsFromName(name) {
	return name
		.split(" ")
		.slice(0, 2)
		.map(part => part[0])
		.join("")
		.toUpperCase();
}

export default function AdminUsers() {
	return (
		<section className="grid gap-4">
			<header className="flex items-center justify-between gap-3 pb-0.5 pt-1.5 max-[760px]:flex-col max-[760px]:items-start">
				<div>
					<h1 className="m-0 text-[clamp(1.8rem,2.6vw,2.2rem)] font-bold text-[var(--text)]">Gestion de Usuarios</h1>
					<p className="mt-1.5 text-[0.98rem] text-[var(--text-muted)]">Administra los usuarios registrados en la plataforma</p>
				</div>
				<button type="button" className="btn btn-primary inline-flex items-center gap-2 rounded-[10px]">
					<UserRoundPlus aria-hidden="true" focusable="false" className="h-4 w-4" strokeWidth={1.9} />
					Agregar Usuario
				</button>
			</header>

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<article className="grid gap-2 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]"><p className="m-0 text-[0.9rem] text-[#6d8275]">Total Usuarios</p><strong className="text-[2rem] font-bold leading-none text-[#20372b]">7</strong></article>
				<article className="grid gap-2 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]"><p className="m-0 text-[0.9rem] text-[#6d8275]">Activos</p><strong className="text-[2rem] font-bold leading-none text-[#20372b]">6</strong></article>
				<article className="grid gap-2 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]"><p className="m-0 text-[0.9rem] text-[#6d8275]">Encargados</p><strong className="text-[2rem] font-bold leading-none text-[#20372b]">2</strong></article>
				<article className="grid gap-2 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]"><p className="m-0 text-[0.9rem] text-[#6d8275]">Nuevos (este mes)</p><strong className="text-[2rem] font-bold leading-none text-[#20372b]">12</strong></article>
			</section>

			<section className="rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]">
				<div className="grid items-center gap-3 min-[761px]:grid-cols-[1.25fr_auto]">
					<div>
						<input className="w-full rounded-[10px] border border-[#cfded5] bg-white px-3 py-2.5 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]" placeholder="Buscar usuarios" />
					</div>
					<div className="flex flex-wrap items-center justify-start gap-2 min-[761px]:justify-end">
						<label className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-[#6c7f72]">
							Estado:
							<select className="min-w-[110px] rounded-[10px] border border-[#cfded5] bg-white px-2.5 py-2 text-[0.84rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]">
								<option>Todos</option>
								<option>Exitoso</option>
								<option>Pendiente</option>
								<option>Atrasado</option>
							</select>
						</label>
						<label className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-[#6c7f72]">
							Rol:
							<select className="min-w-[110px] rounded-[10px] border border-[#cfded5] bg-white px-2.5 py-2 text-[0.84rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]">
								<option>Todos</option>
								<option>Participante</option>
								<option>Encargado</option>
							</select>
						</label>
					</div>
				</div>
			</section>

			<section className="rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 pb-3 shadow-[var(--panel-shadow)]">
				<div className="mb-2 flex items-baseline justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
					<h2 className="m-0 text-[1.08rem] font-bold text-[#23392d]">Usuarios</h2>
					<p className="text-[0.92rem] text-[#6f8277]">Mostrando {users.length} registros</p>
				</div>
				<div className="overflow-auto">
					<table className="min-w-[920px] w-full border-separate border-spacing-0 text-[0.89rem]">
						<thead>
							<tr>
								<th className="border-y border-[#d9dee5] bg-[#f8fbf9] px-2.5 py-2 text-left text-[0.73rem] font-bold uppercase tracking-[0.04em] text-[#778494]">Nombre</th>
								<th className="border-y border-[#d9dee5] bg-[#f8fbf9] px-2.5 py-2 text-left text-[0.73rem] font-bold uppercase tracking-[0.04em] text-[#778494]">Estado</th>
								<th className="border-y border-[#d9dee5] bg-[#f8fbf9] px-2.5 py-2 text-left text-[0.73rem] font-bold uppercase tracking-[0.04em] text-[#778494]">Tipo</th>
								<th className="border-y border-[#d9dee5] bg-[#f8fbf9] px-2.5 py-2 text-left text-[0.73rem] font-bold uppercase tracking-[0.04em] text-[#778494]">Email</th>
								<th className="border-y border-[#d9dee5] bg-[#f8fbf9] px-2.5 py-2 text-left text-[0.73rem] font-bold uppercase tracking-[0.04em] text-[#778494]">Registro</th>
								<th className="border-y border-[#d9dee5] bg-[#f8fbf9] px-2.5 py-2 text-left text-[0.73rem] font-bold uppercase tracking-[0.04em] text-[#778494]">
									<span className="font-bold">Acciones</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{users.map(user => (
								<tr key={user.email}>
									<td className="border-b border-[#ecf0f4] px-2.5 py-3 text-[#455261]">
										<div className="flex items-center gap-2.5">
											<span className="grid h-8 w-8 place-items-center rounded-full bg-[#e8f5ec] text-[0.74rem] font-bold text-[#187b45]">{initialsFromName(user.name)}</span>
											<div>
												<strong className="block text-[0.9rem] text-[#1f3328]">{user.name}</strong>
												<span className="text-[0.79rem] text-[#6c7f73]">{user.rol}</span>
											</div>
										</div>
									</td>
									<td className="border-b border-[#ecf0f4] px-2.5 py-3 text-[#455261]">
										<span
											className={`relative inline-flex items-center gap-1.5 text-[0.82rem] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:content-[''] ${
												user.status === "Exitoso" ? "ok" : user.status === "Pendiente" ? "warn" : "danger"
											} ${user.status === "Exitoso" ? "text-[#1f7c48] before:bg-[#23a45a]" : user.status === "Pendiente" ? "text-[#9b6a1c] before:bg-[#d8a040]" : "text-[#9e3b2f] before:bg-[#db5b4b]"}`}
										>
											{user.status}
										</span>
									</td>
									<td className="border-b border-[#ecf0f4] px-2.5 py-3 text-[#455261]">{user.type}</td>
									<td className="border-b border-[#ecf0f4] px-2.5 py-3 text-[#455261]">{user.email}</td>
									<td className="border-b border-[#ecf0f4] px-2.5 py-3 text-[#455261]">{user.signedUp}</td>
									<td className="border-b border-[#ecf0f4] px-2.5 py-3 text-[#455261]">
										<button type="button" className="h-7 w-7 cursor-pointer rounded-lg border border-[#d9e2db] bg-white text-base leading-none text-[#5c6f62] hover:border-[#c7d9cf] hover:bg-[#f3f9f5]" aria-label="Mas acciones">
											⋮
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="flex items-center justify-between gap-3 pt-2 text-[0.82rem] text-[#6f8176] max-[760px]:flex-col max-[760px]:items-start">
					<span>Mostrando 1-{users.length} de {users.length}</span>
					<div className="inline-flex items-center gap-1.5">
						<button type="button" className="cursor-pointer rounded-lg border border-[#d3ddd6] bg-white px-2.5 py-1 text-[0.8rem] font-semibold text-[#496053]">Anterior</button>
						<button type="button" className="cursor-pointer rounded-lg border border-[#cae2d3] bg-[#e8f5ec] px-2.5 py-1 text-[0.8rem] font-semibold text-[#177945]">1</button>
						<button type="button" className="cursor-pointer rounded-lg border border-[#d3ddd6] bg-white px-2.5 py-1 text-[0.8rem] font-semibold text-[#496053]">Siguiente</button>
					</div>
				</div>
			</section>
		</section>
	);
}

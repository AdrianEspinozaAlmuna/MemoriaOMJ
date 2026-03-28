import React, { useMemo, useState } from "react";
import Modal from "../components/Modal";
import "../styles/adminPages.css";

const approvals = [
	{ title: "Workshop de Emprendimiento", by: "Camila Torres", type: "Formacion", date: "2026-04-05", status: "Pendiente" },
	{ title: "Liga de Basquet 3x3", by: "Diego Perez", type: "Deporte", date: "2026-04-08", status: "Pendiente" },
	{ title: "Laboratorio de Podcast", by: "Sofia Munoz", type: "Cultural", date: "2026-04-10", status: "Revisado" }
];

export default function AdminApprovals() {
	const [items, setItems] = useState(approvals);
	const [rejectingTitle, setRejectingTitle] = useState("");
	const [rejectReason, setRejectReason] = useState("");
	const [rejectError, setRejectError] = useState("");

	const activeItem = useMemo(() => {
		return items.find(item => item.title === rejectingTitle) || null;
	}, [items, rejectingTitle]);

	function handleApprove(title) {
		setItems(previous =>
			previous.map(item => {
				if (item.title !== title) return item;
				return { ...item, status: "Aprobado" };
			})
		);
	}

	function openRejectModal(title) {
		setRejectingTitle(title);
		setRejectReason("");
		setRejectError("");
	}

	function closeRejectModal() {
		setRejectingTitle("");
		setRejectReason("");
		setRejectError("");
	}

	function confirmReject() {
		if (!rejectReason.trim()) {
			setRejectError("Debes indicar un motivo de rechazo.");
			return;
		}

		setItems(previous =>
			previous.map(item => {
				if (item.title !== rejectingTitle) return item;
				return { ...item, status: "Rechazado", reason: rejectReason.trim() };
			})
		);

		closeRejectModal();
	}

	return (
		<section className="admin-page">
			<header className="admin-page-header">
				<h1>Aprobaciones</h1>
				<p>Revisa y aprueba propuestas de actividades</p>
			</header>

			<section className="admin-panel">
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Actividad</th>
								<th>Propuesta por</th>
								<th>Tipo</th>
								<th>Fecha</th>
								<th>Estado</th>
								<th>Accion</th>
							</tr>
						</thead>
						<tbody>
							{items.map(item => (
								<tr key={item.title}>
									<td>{item.title}</td>
									<td>{item.by}</td>
									<td>{item.type}</td>
									<td>{item.date}</td>
									<td>
										<span
											className={`admin-status ${
												item.status === "Pendiente" ? "warn" : item.status === "Rechazado" ? "danger" : "ok"
											}`}
										>
											{item.status}
										</span>
									</td>
									<td>
										{item.status !== "Revisado" ? (
											<div className="admin-table-actions">
												<button type="button" className="admin-btn-inline" onClick={() => handleApprove(item.title)}>
													Aprobar
												</button>
												<button type="button" className="admin-btn-inline is-danger" onClick={() => openRejectModal(item.title)}>
													Rechazar
												</button>
											</div>
										) : (
											<span className="admin-chip">Sin acciones</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<Modal
				isOpen={Boolean(activeItem)}
				title="Motivo de rechazo"
				onClose={closeRejectModal}
				footer={
					<>
						<button type="button" className="btn btn-ghost btn-inline" onClick={closeRejectModal}>
							Cancelar
						</button>
						<button type="button" className="btn btn-primary btn-inline" onClick={confirmReject}>
							Guardar rechazo
						</button>
					</>
				}
			>
				<div className="admin-modal-field">
					<label htmlFor="reject-reason">
						Explica por que se rechaza {activeItem ? `"${activeItem.title}"` : "la propuesta"}
					</label>
					<textarea
						id="reject-reason"
						className="admin-textarea"
						value={rejectReason}
						onChange={event => {
							setRejectReason(event.target.value);
							if (rejectError) setRejectError("");
						}}
						placeholder="Ejemplo: Falta definir presupuesto, cupos y responsable de la actividad."
					/>
					{rejectError && <p className="admin-field-error">{rejectError}</p>}
				</div>
			</Modal>
		</section>
	);
}

import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

function decodeToken(token) {
  if (!token) return null;
  
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (e) {
    return null;
  }
}

export default function Navbar() {
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const actionsRef = useRef(null);

	const notifications = [
		{ id: "usr-notif-1", title: "Actividad proxima", detail: "Taller de liderazgo manana a las 17:00", time: "Hace 20 min" },
		{ id: "usr-notif-2", title: "Inscripcion confirmada", detail: "Feria de emprendimiento fue confirmada", time: "Ayer" },
		{ id: "usr-notif-3", title: "Recordatorio", detail: "Completa tu asistencia de la semana", time: "Ayer" }
	];

  const token = localStorage.getItem("token");
  const user = decodeToken(token);
  const isAuthenticated = !!user;
  const rol = user?.rol || null;
	const displayName = user?.nombre || "Usuario";

	useEffect(() => {
		function handleDocumentClick(event) {
			if (actionsRef.current && !actionsRef.current.contains(event.target)) {
				setMenuOpen(false);
				setNotificationsOpen(false);
			}
		}

		function handleEscape(event) {
			if (event.key === "Escape") {
				setMenuOpen(false);
				setNotificationsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleDocumentClick);
		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("mousedown", handleDocumentClick);
			document.removeEventListener("keydown", handleEscape);
		};
	}, []);

	function handleLogout() {
		localStorage.removeItem("token");
		setMenuOpen(false);
		setNotificationsOpen(false);
		navigate("/login");
	}

	return (
		<header className="navbar-wrap">
			<nav className="navbar container">
				<Link to="/" className="brand">
					<img className="brand-mark" src="/iconOMJ.jpg" alt="Logo OMJ" />
					<span className="brand-text">Plataforma Juvenil Curico</span>
				</Link>

				<div className="navbar-links" aria-label="Navegacion de usuario">
					{isAuthenticated && rol === "participante" && (
						<NavLink
							to="/user/dashboard"
							className={({ isActive }) => `navbar-link-item${isActive ? " active" : ""}`}
						>
							Inicio
						</NavLink>
					)}

					{isAuthenticated && rol === "admin" && (
						<NavLink
							to="/admin/dashboard"
							className={({ isActive }) => `navbar-link-item${isActive ? " active" : ""}`}
						>
							Panel admin
						</NavLink>
					)}

					{isAuthenticated && rol === "participante" && (
						<>
							<NavLink
								to="/user/calendario"
								className={({ isActive }) => `navbar-link-item${isActive ? " active" : ""}`}
							>
								Calendario
							</NavLink>
							<NavLink
								to="/user/mis-actividades"
								className={({ isActive }) => `navbar-link-item${isActive ? " active" : ""}`}
							>
								Mis actividades
							</NavLink>
							<NavLink
								to="/user/asistencia"
								className={({ isActive }) => `navbar-link-item${isActive ? " active" : ""}`}
							>
								Mi asistencia
							</NavLink>
						</>
					)}
				</div>

				<div className="navbar-actions" ref={actionsRef}>
					{isAuthenticated && rol === "participante" && (
						<NavLink to="/user/dashboard" className="btn btn-propose">
							+ Proponer Actividad
						</NavLink>
					)}

					{isAuthenticated && (
						<div className="navbar-notifications">
							<button
								type="button"
								className="navbar-alert-btn"
								aria-label="Notificaciones"
								onClick={() => {
									setNotificationsOpen(previous => !previous);
									setMenuOpen(false);
								}}
								aria-expanded={notificationsOpen}
							>
								<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
									<path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7m3.5 10a2.5 2.5 0 0 0 5 0" />
								</svg>
								<span>3</span>
							</button>

							{notificationsOpen && (
								<div className="navbar-notifications-panel" role="dialog" aria-label="Notificaciones">
									<p className="navbar-popover-title">Notificaciones</p>
									<div className="navbar-notifications-list">
										{notifications.map(item => (
											<article key={item.id} className="navbar-notification-item">
												<strong>{item.title}</strong>
												<small>{item.detail}</small>
												<span>{item.time}</span>
											</article>
										))}
									</div>
								</div>
							)}
						</div>
					)}

					{isAuthenticated && (
						<div className="user-menu">
							<button
								type="button"
								className="user-menu-trigger"
								onClick={() => {
									setMenuOpen(previous => !previous);
									setNotificationsOpen(false);
								}}
								aria-expanded={menuOpen}
								aria-haspopup="menu"
							>
								<span className="user-icon" aria-hidden="true">
									<svg viewBox="0 0 24 24" role="presentation">
										<path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.31 0-6 2.02-6 4.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1c0-2.48-2.69-4.5-6-4.5Z" />
									</svg>
								</span>
								<span className="user-name">{displayName}</span>
							</button>

							{menuOpen && (
								<div className="user-menu-panel" role="menu">
									<button type="button" className="user-menu-item" role="menuitem" onClick={handleLogout}>
										Cerrar sesion
									</button>
								</div>
							)}
						</div>
					)}

					{!isAuthenticated && (
						<>
							<NavLink to="/login" className="btn btn-ghost">
								Iniciar sesion
							</NavLink>
							<NavLink to="/register" className="btn btn-primary">
								Registrarse
							</NavLink>
						</>
					)}
				</div>
			</nav>
		</header>
	);
}

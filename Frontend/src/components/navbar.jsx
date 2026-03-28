import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
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
	const location = useLocation();
	const [menuOpen, setMenuOpen] = useState(false);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const navRef = useRef(null);

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
	const userInitial = displayName.charAt(0).toUpperCase();

	useEffect(() => {
		function handleDocumentClick(event) {
			if (navRef.current && !navRef.current.contains(event.target)) {
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

	useEffect(() => {
		setMenuOpen(false);
		setNotificationsOpen(false);
		setMobileMenuOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		function handleResize() {
			if (window.innerWidth > 860) {
				setMobileMenuOpen(false);
			}
		}

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	function handleLogout() {
		localStorage.removeItem("token");
		setMenuOpen(false);
		setNotificationsOpen(false);
		setMobileMenuOpen(false);
		navigate("/login");
	}

	function handleNavItemClick() {
		setMobileMenuOpen(false);
	}

	return (
		<header className="navbar-wrap">
			<nav className="navbar container" ref={navRef}>
				<div className="navbar-top-left">
					<button
						type="button"
						className="navbar-mobile-toggle"
						onClick={() => setMobileMenuOpen(previous => !previous)}
						aria-expanded={mobileMenuOpen}
						aria-label="Abrir menu"
					>
						<span />
						<span />
						<span />
					</button>

					<Link to="/" className="brand">
						<img className="brand-mark" src="/iconOMJ.jpg" alt="Logo OMJ" />
						<span className="brand-text">Plataforma Juvenil Curico</span>
					</Link>
				</div>

				<div className={`navbar-collapsible${mobileMenuOpen ? " open" : ""}`}>
					{isAuthenticated && rol === "participante" && <p className="navbar-mobile-title">Panel de usuario</p>}

				<div className="navbar-links" aria-label="Navegacion de usuario">
					{isAuthenticated && rol === "participante" && (
						<NavLink
							to="/user/dashboard"
							onClick={handleNavItemClick}
							className={({ isActive }) => `navbar-link-item${isActive ? " active" : ""}`}
						>
							Inicio
						</NavLink>
					)}

					{isAuthenticated && rol === "admin" && (
						<NavLink
							to="/admin/dashboard"
							onClick={handleNavItemClick}
							className={({ isActive }) => `navbar-link-item${isActive ? " active" : ""}`}
						>
							Panel admin
						</NavLink>
					)}

					{isAuthenticated && rol === "participante" && (
						<>
							<NavLink
								to="/user/calendario"
								onClick={handleNavItemClick}
								className={({ isActive }) => `navbar-link-item${isActive ? " active" : ""}`}
							>
								Calendario
							</NavLink>
							<NavLink
								to="/user/mis-actividades"
								onClick={handleNavItemClick}
								className={({ isActive }) => `navbar-link-item${isActive ? " active" : ""}`}
							>
								Mis actividades
							</NavLink>
							<NavLink
								to="/user/asistencia"
								onClick={handleNavItemClick}
								className={({ isActive }) => `navbar-link-item${isActive ? " active" : ""}`}
							>
								Mi asistencia
							</NavLink>
						</>
					)}
				</div>
					{isAuthenticated && rol === "participante" && (
						<div className="navbar-mobile-propose-wrap">
							<NavLink to="/user/dashboard" className="btn btn-propose" onClick={handleNavItemClick}>
								+ Proponer Actividad
							</NavLink>
						</div>
					)}

					{!isAuthenticated && (
						<div className="navbar-mobile-auth-wrap">
							<NavLink to="/login" className="btn btn-ghost" onClick={handleNavItemClick}>
								Iniciar sesion
							</NavLink>
							<NavLink to="/register" className="btn btn-primary" onClick={handleNavItemClick}>
								Registrarse
							</NavLink>
						</div>
					)}
				</div>

				<div className="navbar-actions">
					{isAuthenticated && rol === "participante" && (
						<NavLink to="/user/dashboard" className="btn btn-propose navbar-desktop-only" onClick={handleNavItemClick}>
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
								<span className="user-avatar" aria-hidden="true">{userInitial}</span>
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
							<NavLink to="/login" className="btn btn-ghost navbar-desktop-only" onClick={handleNavItemClick}>
								Iniciar sesion
							</NavLink>
							<NavLink to="/register" className="btn btn-primary navbar-desktop-only" onClick={handleNavItemClick}>
								Registrarse
							</NavLink>
						</>
					)}
				</div>
			</nav>
		</header>
	);
}

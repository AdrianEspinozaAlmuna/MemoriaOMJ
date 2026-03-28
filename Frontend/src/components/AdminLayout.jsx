import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import "../styles/adminLayout.css";

function decodeToken(token) {
	if (!token) return null;
	const parts = token.split(".");
	if (parts.length !== 3) return null;

	try {
		return JSON.parse(atob(parts[1]));
	} catch (error) {
		return null;
	}
}

function getInitials(name = "") {
	const clean = name.trim();
	if (!clean) return "AU";
	return clean
		.split(" ")
		.slice(0, 2)
		.map(part => part[0]?.toUpperCase() || "")
		.join("");
}

const mainLinks = [
	{ to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
	{ to: "/admin/usuarios", label: "Usuarios", icon: "users" },
	{ to: "/admin/aprobaciones", label: "Aprobaciones", icon: "check" },
	{ to: "/admin/calendario", label: "Calendario", icon: "calendar" },
	{ to: "/admin/actividades", label: "Actividades", icon: "activity" },
	{ to: "/admin/reportes", label: "Reportes", icon: "report" },
	{ to: "/admin/notificaciones", label: "Notificaciones", icon: "bell" }
];

const systemLinks = [{ to: "/admin/configuracion", label: "Configuracion", icon: "settings" }];

const notifications = [
	{ id: "adm-notif-1", title: "Nueva actividad pendiente", detail: "Workshop de Emprendimiento requiere revision", time: "Hace 10 min" },
	{ id: "adm-notif-2", title: "Registro nuevo", detail: "Camila Torres se registro en la plataforma", time: "Hace 1 hora" },
	{ id: "adm-notif-3", title: "Alerta de asistencia", detail: "Dos actividades tienen baja asistencia", time: "Hoy" }
];

function SidebarIcon({ name }) {
	if (name === "dashboard") {
		return <path d="M4 13h7V4H4v9Zm9 7h7v-6h-7v6Zm0-9h7V4h-7v7Zm-9 9h7v-4H4v4Z" />;
	}
	if (name === "users") {
		return <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 2a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.76 0-5 1.57-5 3.5A1.5 1.5 0 0 0 4.5 20h7m1.5 0H20a1.5 1.5 0 0 0 1.5-1.5C21.5 16.57 19.26 15 16.5 15H13" />;
	}
	if (name === "check") {
		return <path d="m8.5 12.5 2.3 2.3 4.7-4.7M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />;
	}
	if (name === "calendar") {
		return <path d="M7 3v3M17 3v3M4 9h16M6 6h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />;
	}
	if (name === "activity") {
		return <path d="M3 12h4l2-5 4 10 2-5h6" />;
	}
	if (name === "report") {
		return <path d="M5 20h14M7 16V8m5 8V4m5 12v-6" />;
	}
	if (name === "bell") {
		return <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7m3.5 10a2.5 2.5 0 0 0 5 0" />;
	}
	return <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 4A8 8 0 1 1 4 12a8 8 0 0 1 16 0Z" />;
}

export default function AdminLayout() {
	const token = localStorage.getItem("token");
	const user = decodeToken(token);
	const location = useLocation();
	const navigate = useNavigate();
	const menuRef = useRef(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [mobileNavOpen, setMobileNavOpen] = useState(false);

	const displayName = user?.nombre ? `${user.nombre} ${user.apellido || ""}`.trim() : "Admin Usuario";
	const initials = useMemo(() => getInitials(displayName), [displayName]);

	useEffect(() => {
		function handleDocumentClick(event) {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
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
		setMobileNavOpen(false);
		setMenuOpen(false);
		setNotificationsOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		function handleResize() {
			if (window.innerWidth > 980) {
				setMobileNavOpen(false);
			}
		}

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	function handleLogout() {
		localStorage.removeItem("token");
		setMenuOpen(false);
		setNotificationsOpen(false);
		setMobileNavOpen(false);
		navigate("/login");
	}

	function closeMobileNav() {
		setMobileNavOpen(false);
	}

	return (
		<div className="admin-shell reveal-up">
			<aside className={`admin-sidebar${mobileNavOpen ? " open" : ""}`}>
				<p className="admin-sidebar-title">Administracion</p>

				<nav className="admin-nav" aria-label="Menu de administracion">
					{mainLinks.map(link => (
						<NavLink
							key={link.to}
							to={link.to}
							onClick={closeMobileNav}
							className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
						>
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<SidebarIcon name={link.icon} />
							</svg>
							<span>{link.label}</span>
							{link.label === "Aprobaciones" && <span className="admin-badge">5</span>}
						</NavLink>
					))}
				</nav>

				<div className="admin-sidebar-group">
					<p>Sistema</p>
					{systemLinks.map(link => (
						<NavLink
							key={link.to}
							to={link.to}
							onClick={closeMobileNav}
							className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
						>
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<SidebarIcon name={link.icon} />
							</svg>
							<span>{link.label}</span>
						</NavLink>
					))}
				</div>
			</aside>

			<section className="admin-main">
				<header className="admin-topbar">
					<div className="admin-topbar-left">
						<button
							type="button"
							className="admin-nav-toggle"
							onClick={() => setMobileNavOpen(previous => !previous)}
							aria-expanded={mobileNavOpen}
							aria-label="Abrir menu de administracion"
						>
							<span />
							<span />
							<span />
						</button>

						<div className="admin-brand-inline">
							<img src="/iconOMJ.jpg" alt="OMJ" />
							<strong>OMJ Curico</strong>
						</div>
					</div>

					<div className="admin-topbar-actions" ref={menuRef}>
						<button
							type="button"
							className="admin-alert-btn"
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
							<div className="admin-notifications-panel" role="dialog" aria-label="Notificaciones">
								<p className="admin-popover-title">Notificaciones</p>
								<div className="admin-notifications-list">
									{notifications.map(item => (
										<article key={item.id} className="admin-notification-item">
											<strong>{item.title}</strong>
											<small>{item.detail}</small>
											<span>{item.time}</span>
										</article>
									))}
								</div>
							</div>
						)}

						<button
							type="button"
							className="admin-user-chip"
							onClick={() => {
								setMenuOpen(previous => !previous);
								setNotificationsOpen(false);
							}}
							aria-expanded={menuOpen}
							aria-haspopup="menu"
						>
							<span className="admin-user-avatar">{initials}</span>
							<span>{displayName}</span>
						</button>

						{menuOpen && (
							<div className="admin-user-menu" role="menu">
								<button type="button" role="menuitem" onClick={handleLogout}>
									Cerrar sesion
								</button>
							</div>
						)}
					</div>
				</header>

				<div className="admin-content">
					<Outlet />
				</div>
			</section>
		</div>
	);
}

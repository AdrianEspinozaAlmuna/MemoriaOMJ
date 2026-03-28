import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

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

	const navLinkClass = ({ isActive }) =>
		[
			"flex items-center gap-2 rounded-lg px-2 py-2 text-[0.95rem] font-medium text-[#2b4337] transition-colors duration-200 hover:bg-[#edf6f0]",
			isActive ? "bg-[#e8f5ec] text-[#0c7a36] font-semibold" : ""
		].join(" ");

	return (
		<div className="grid min-h-screen grid-cols-[220px_minmax(0,1fr)] bg-[var(--bg-neutral)] animate-[revealUp_0.7s_ease_both] max-[980px]:grid-cols-1 max-[980px]:relative">
			<aside className={`${mobileNavOpen ? "block" : "hidden min-[981px]:block"} border-r border-[#d7e4dc] bg-white px-3 pb-4 pt-3 min-[981px]:sticky min-[981px]:top-0 min-[981px]:h-screen min-[981px]:overflow-y-auto max-[980px]:fixed max-[980px]:left-3 max-[980px]:right-3 max-[980px]:top-[4.55rem] max-[980px]:z-[35] max-[980px]:max-h-[calc(100vh-5.4rem)] max-[980px]:overflow-y-auto max-[980px]:rounded-xl max-[980px]:border max-[980px]:border-[#d7e4dc] max-[980px]:shadow-[0_18px_35px_-22px_rgba(11,38,24,0.45)] max-[640px]:left-2 max-[640px]:right-2 max-[640px]:top-[4.1rem]`}>
				<p className="mb-2 text-[0.82rem] font-semibold text-[#6f8278]">Administracion</p>

				<nav className="grid gap-1" aria-label="Menu de administracion">
					{mainLinks.map(link => (
						<NavLink
							key={link.to}
							to={link.to}
							onClick={closeMobileNav}
							className={navLinkClass}
						>
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-4 w-4 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]">
								<SidebarIcon name={link.icon} />
							</svg>
							<span>{link.label}</span>
							{link.label === "Aprobaciones" && <span className="ml-auto rounded-full bg-[#6f7d72] px-1.5 py-[1px] text-[0.74rem] font-bold text-white">5</span>}
						</NavLink>
					))}
				</nav>

				<div className="mt-4 grid gap-1">
					<p className="mb-1 text-[0.78rem] font-semibold text-[#6f8278]">Sistema</p>
					{systemLinks.map(link => (
						<NavLink
							key={link.to}
							to={link.to}
							onClick={closeMobileNav}
							className={navLinkClass}
						>
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-4 w-4 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]">
								<SidebarIcon name={link.icon} />
							</svg>
							<span>{link.label}</span>
						</NavLink>
					))}
				</div>
			</aside>

			<section className="grid min-w-0 grid-rows-[auto_minmax(0,1fr)]">
				<header className="flex h-[3.85rem] items-center justify-between border-b border-[#d7e4dc] bg-white px-4 max-[980px]:sticky max-[980px]:top-0 max-[980px]:z-40 max-[980px]:px-3">
					<div className="flex items-center gap-2.5">
						<button
							type="button"
							className="hidden h-[2.15rem] w-[2.15rem] flex-col items-center justify-center gap-[0.22rem] rounded-lg border border-[#d2dfd8] bg-white p-0 transition-colors duration-200 hover:border-[#b7d0c2] hover:bg-[#f6fbf8] max-[980px]:inline-flex"
							onClick={() => setMobileNavOpen(previous => !previous)}
							aria-expanded={mobileNavOpen}
							aria-label="Abrir menu de administracion"
						>
							<span className="block h-[2px] w-4 rounded-full bg-[#325444]" />
							<span className="block h-[2px] w-4 rounded-full bg-[#325444]" />
							<span className="block h-[2px] w-4 rounded-full bg-[#325444]" />
						</button>

						<div className="inline-flex items-center gap-2 text-[1.02rem] text-[#1f3a2c]">
							<img src="/iconOMJ.jpg" alt="OMJ" className="h-8 w-8 rounded-lg border border-[#cde2d4]" />
							<strong className="max-[640px]:hidden">OMJ Curico</strong>
						</div>
					</div>

					<div className="relative flex items-center gap-2" ref={menuRef}>
						<button
							type="button"
							className="relative h-[2.15rem] w-[2.15rem] cursor-pointer rounded-lg border border-[#d2dfd8] bg-white transition-colors duration-200 hover:border-[#b7d0c2] hover:bg-[#f6fbf8]"
							aria-label="Notificaciones"
							onClick={() => {
								setNotificationsOpen(previous => !previous);
								setMenuOpen(false);
							}}
							aria-expanded={notificationsOpen}
						>
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-4 w-4 fill-none stroke-[#3e5b4c] stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]">
								<path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7m3.5 10a2.5 2.5 0 0 0 5 0" />
							</svg>
							<span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--primary)] px-1 text-[0.7rem] font-bold text-white">3</span>
						</button>

						{notificationsOpen && (
							<div className="absolute right-[3.25rem] top-[calc(100%+0.4rem)] z-[21] w-[min(360px,82vw)] rounded-xl border border-[#d7e4dc] bg-white p-2 shadow-[0_14px_26px_-20px_rgba(11,38,24,0.35)] max-[640px]:right-0 max-[640px]:w-[min(320px,calc(100vw-1.2rem))]" role="dialog" aria-label="Notificaciones">
								<p className="mb-2 text-[0.86rem] font-bold text-[#2b4338]">Notificaciones</p>
								<div className="grid gap-2">
									{notifications.map(item => (
										<article key={item.id} className="grid gap-0.5 rounded-[10px] border border-[#e2e8ed] bg-[#fbfcfd] px-2 py-2">
											<strong className="text-[0.86rem] text-[#2e3b47]">{item.title}</strong>
											<small className="text-[0.79rem] text-[#657381]">{item.detail}</small>
											<span className="text-[0.74rem] font-semibold text-[#5f7a6a]">{item.time}</span>
										</article>
									))}
								</div>
							</div>
						)}

						<button
							type="button"
							className="inline-flex items-center gap-2 rounded-lg border border-[#d2dfd8] bg-white px-2 py-1.5 text-[0.89rem] font-medium text-[#2e4c3d] transition-colors duration-200 hover:border-[#b6d0c1] hover:bg-[#f6fbf8]"
							onClick={() => {
								setMenuOpen(previous => !previous);
								setNotificationsOpen(false);
							}}
							aria-expanded={menuOpen}
							aria-haspopup="menu"
						>
							<span className="grid h-7 w-7 place-items-center rounded-full bg-[linear-gradient(180deg,#138b47,#0f7f40)] text-[0.73rem] font-bold text-[#f8fafc]">{initials}</span>
							<span className="max-[640px]:hidden">{displayName}</span>
						</button>

						{menuOpen && (
							<div className="absolute right-0 top-[calc(100%+0.4rem)] z-20 min-w-44 rounded-[10px] border border-[#d7e4dc] bg-white p-2 shadow-[0_14px_26px_-20px_rgba(11,38,24,0.35)]" role="menu">
								<button type="button" role="menuitem" onClick={handleLogout} className="w-full rounded-lg bg-[#eff8f2] px-2.5 py-2 text-left text-[0.85rem] font-semibold text-[#214234]">
									Cerrar sesion
								</button>
							</div>
						)}
					</div>
				</header>

				<div className="p-5 max-[640px]:p-3.5">
					<Outlet />
				</div>
			</section>
		</div>
	);
}

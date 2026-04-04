import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

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

	const navLinkClass = ({ isActive }) =>
		[
			"rounded-xl px-3.5 py-2 text-[0.92rem] font-semibold text-[#355447] [transition:background-color_150ms_ease,color_120ms_ease] hover:bg-[#def3e7] hover:text-[var(--primary-strong)] active:bg-[var(--primary-active)]",
			isActive ? "bg-[var(--primary-active)] !text-[var(--primary-strong)]" : ""
		].join(" ");

	return (
		<header className="sticky top-0 z-30 bg-[color:var(--nav-bg,white)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--nav-bg,white)]/80 shadow-[0_8px_20px_-20px_rgba(6,40,24,0.55)]">
			<nav className="mx-auto grid min-h-16 w-[min(98vw,1680px)] grid-cols-[auto_1fr_auto] items-center gap-x-8 px-4 sm:px-6 lg:gap-x-10 max-[1120px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[860px]:min-h-[4.2rem] max-[860px]:w-full max-[860px]:grid-cols-[minmax(0,1fr)_auto] max-[860px]:gap-y-2 max-[860px]:py-2" ref={navRef}>
				<div className="inline-flex items-center gap-2.5 justify-self-start min-[861px]:min-w-0">
					<button
						type="button"
						className="hidden h-[2.15rem] w-[2.15rem] flex-col items-center justify-center gap-[0.22rem] rounded-lg bg-[#eef7f1] p-0 transition-colors duration-200 hover:bg-[#e2f4e9] max-[860px]:inline-flex"
						onClick={() => setMobileMenuOpen(previous => !previous)}
						aria-expanded={mobileMenuOpen}
						aria-label="Abrir menu"
					>
						<span className="block h-[2px] w-4 rounded-full bg-[#325444]" />
						<span className="block h-[2px] w-4 rounded-full bg-[#325444]" />
						<span className="block h-[2px] w-4 rounded-full bg-[#325444]" />
					</button>

					<Link to="/" className="inline-flex items-center gap-2.5 justify-self-start min-[861px]:min-w-0">
						<img className="block h-8 w-8 min-w-8 rounded-md object-cover shadow-[0_6px_14px_-10px_rgba(8,38,23,0.5)]" src="/iconOMJ.jpg" alt="Logo OMJ" />
						<span className="text-[0.98rem] font-bold leading-[1.2] tracking-[0.005em] max-[1120px]:max-w-[11.2rem] max-[1120px]:overflow-hidden max-[1120px]:text-ellipsis max-[1120px]:whitespace-nowrap max-[1120px]:text-[0.92rem] max-[860px]:hidden">Plataforma Juvenil Curico</span>
					</Link>
				</div>

				<div className={`min-[861px]:contents ${mobileMenuOpen ? "max-[860px]:col-span-2 max-[860px]:grid max-[860px]:gap-2.5 max-[860px]:rounded-xl max-[860px]:bg-white/95 max-[860px]:p-2.5 max-[860px]:shadow-[0_12px_24px_-18px_rgba(8,38,23,0.45)]" : "max-[860px]:hidden"}`}>
					{isAuthenticated && rol === "participante" && <p className="hidden text-[0.82rem] font-semibold text-[#6f8278] max-[860px]:block">Panel de usuario</p>}

				<div className="flex w-full flex-nowrap items-center justify-center gap-1.5 justify-self-center max-[1120px]:w-auto max-[1120px]:max-w-full max-[1120px]:min-w-0 max-[1120px]:justify-start max-[1120px]:overflow-x-auto max-[1120px]:pb-1 max-[860px]:w-full max-[860px]:flex-col max-[860px]:items-stretch max-[860px]:gap-1 max-[860px]:overflow-visible max-[860px]:pb-0" aria-label="Navegacion de usuario">
					{isAuthenticated && rol === "participante" && (
						<NavLink
							to="/user/dashboard"
							onClick={handleNavItemClick}
							className={navLinkClass}
						>
							Inicio
						</NavLink>
					)}

					{isAuthenticated && rol === "admin" && (
						<NavLink
							to="/admin/dashboard"
							onClick={handleNavItemClick}
							className={navLinkClass}
						>
							Panel admin
						</NavLink>
					)}

					{isAuthenticated && rol === "participante" && (
						<>
							<NavLink
								to="/user/calendario"
								onClick={handleNavItemClick}
								className={navLinkClass}
							>
								Calendario
							</NavLink>
							<NavLink
								to="/user/mis-actividades"
								onClick={handleNavItemClick}
								className={navLinkClass}
							>
								Mis actividades
							</NavLink>
							<NavLink
								to="/user/asistencia"
								onClick={handleNavItemClick}
								className={navLinkClass}
							>
								Mis asistencias
							</NavLink>
						</>
					)}
				</div>
					{isAuthenticated && rol === "participante" && (
						<div className="hidden gap-2 max-[860px]:grid">
							<NavLink
								to="/user/crear-actividad"
								className="btn w-full border-[var(--primary)] bg-[var(--primary)] !text-white hover:border-[var(--primary-strong)] hover:bg-[var(--primary-strong)] hover:!text-white"
								onClick={handleNavItemClick}
							>
								+ Proponer Actividad
							</NavLink>
						</div>
					)}

					{!isAuthenticated && (
						<div className="hidden gap-2 max-[860px]:grid">
							<NavLink to="/login" className="btn btn-ghost w-full" onClick={handleNavItemClick}>
								Iniciar sesion
							</NavLink>
							<NavLink to="/register" className="btn btn-primary w-full" onClick={handleNavItemClick}>
								Registrarse
							</NavLink>
						</div>
					)}
				</div>

				<div className="flex items-center justify-self-end gap-5 max-[1120px]:gap-3 max-[860px]:col-start-2 max-[860px]:row-start-1 max-[860px]:gap-2">
					{isAuthenticated && rol === "participante" && (
						<NavLink
							to="/user/crear-actividad"
							className="btn hidden whitespace-nowrap rounded-lg border-[var(--primary)] bg-[var(--primary)] px-3 py-2 font-semibold !text-white hover:border-[var(--primary-strong)] hover:bg-[var(--primary-strong)] hover:!text-white min-[861px]:inline-flex min-[861px]:mr-1 lg:mr-3"
							onClick={handleNavItemClick}
						>
							+ Proponer Actividad
						</NavLink>
					)}

					<div className="flex items-center gap-2 max-[1120px]:gap-1.5">

					{isAuthenticated && (
						<div className="relative">
							<button
								type="button"
								className="relative inline-flex h-[2.15rem] w-[2.15rem] items-center justify-center cursor-pointer rounded-md bg-[var(--gray)] transition-colors duration-200 hover:bg-[#e2f4e9]"
								aria-label="Notificaciones"
								onClick={() => {
									setNotificationsOpen(previous => !previous);
									setMenuOpen(false);
								}}
								aria-expanded={notificationsOpen}
							>
								<Bell aria-hidden="true" focusable="false" className="h-4 w-4 text-[#3e5b4c]" strokeWidth={1.8} />
								<span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--primary)] px-1 text-[0.7rem] font-bold text-white">3</span>
							</button>

							{notificationsOpen && (
								<div className="absolute right-0 top-[calc(100%+0.4rem)] z-[21] w-[min(360px,82vw)] rounded-xl border border-[#d7e4dc] bg-white p-2 shadow-[0_14px_26px_-20px_rgba(11,38,24,0.35)] max-[860px]:top-[calc(100%+0.5rem)] max-[860px]:w-[min(320px,calc(100vw-1.4rem))] max-[640px]:w-[min(300px,calc(100vw-1rem))]" role="dialog" aria-label="Notificaciones">
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
						</div>
					)}

					{isAuthenticated && (
						<div className="relative">
							<button
								type="button"
								className="inline-flex hover:cursor-pointer items-center gap-2 rounded-xl bg-[var(--gray)] px-2 py-1.5 text-[0.89rem] font-semibold leading-none text-[#2e4c3d] transition-colors duration-200 hover:bg-[#e2f4e9] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(5,166,61,0.15)] max-[860px]:h-[2.15rem] max-[860px]:min-w-[2.15rem] max-[860px]:justify-center max-[860px]:p-[0.18rem]"
								onClick={() => {
									setMenuOpen(previous => !previous);
									setNotificationsOpen(false);
								}}
								aria-expanded={menuOpen}
								aria-haspopup="menu"
							>
								<span className="grid h-7 w-7 place-items-center rounded-full bg-[linear-gradient(180deg,#138b47,#0f7f40)] text-[0.73rem] font-bold text-[#f8fafc]" aria-hidden="true">{userInitial}</span>
								<span className="max-w-[9.2rem] overflow-hidden text-ellipsis whitespace-nowrap max-[860px]:hidden">{displayName}</span>
							</button>

							{menuOpen && (
								<div className="absolute right-0 top-[calc(100%+0.42rem)] z-[35] min-w-[10.5rem] rounded-[10px] border border-[#dce3ea] bg-white p-1.5 shadow-[0_12px_26px_-20px_rgba(18,32,25,0.42)] max-[860px]:top-[calc(100%+0.5rem)] max-[860px]:w-[min(320px,calc(100vw-1.4rem))] max-[640px]:w-[min(300px,calc(100vw-1rem))]" role="menu">
									<button type="button" className="w-full cursor-pointer rounded-md bg-transparent px-2.5 py-2 text-left text-[0.87rem] font-semibold text-[#2b3f34] transition-colors duration-150 hover:bg-[#f1f6f3] hover:text-[#173326] focus-visible:bg-[#ecf6ef] focus-visible:outline-none" role="menuitem" onClick={handleLogout}>
										Cerrar sesion
									</button>
								</div>
							)}
						</div>
					)}

					{!isAuthenticated && (
						<>
							<NavLink to="/login" className="btn btn-ghost hidden min-[861px]:inline-flex" onClick={handleNavItemClick}>
								Iniciar sesion
							</NavLink>
							<NavLink to="/register" className="btn btn-primary hidden min-[861px]:inline-flex" onClick={handleNavItemClick}>
								Registrarse
							</NavLink>
						</>
					)}
					</div>
				</div>
			</nav>
		</header>
	);
}

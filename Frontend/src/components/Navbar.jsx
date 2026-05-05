import React, { useEffect, useRef, useState } from "react";
import { Bell, BellRing, ChevronRight, LoaderCircle, LogOut, UserRound } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api, { API_BASE_URL } from "../services/api";
import { getMyNotifications, normalizeNotification } from "../services/notificationsService";

const SOCKET_BASE_URL = (import.meta.env.VITE_SOCKET_URL || API_BASE_URL).replace(/\/api\/?$/, "");
const NOTIFICATION_BADGE_TTL_MS = 15 * 60 * 1000;

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
	const [profileUser, setProfileUser] = useState(null);
	const [notificationItems, setNotificationItems] = useState([]);
	const [recentNotificationIds, setRecentNotificationIds] = useState([]);
	const [notificationsLoading, setNotificationsLoading] = useState(false);
	const [notificationsError, setNotificationsError] = useState("");
	const navRef = useRef(null);
	const isMountedRef = useRef(true);
	const notificationTimersRef = useRef(new Map());

  const token = localStorage.getItem("token");
  const user = decodeToken(token);
  const isAuthenticated = !!user;
  const mergedUser = profileUser ? { ...user, ...profileUser } : user;
  const rol = mergedUser?.rol || null;
	const displayName = mergedUser?.nombre || "Usuario";
	const fullName = mergedUser?.nombre ? `${mergedUser.nombre} ${mergedUser.apellido || ""}`.trim() : displayName;
	const notificationPreview = notificationItems.slice(0, 3);
	const notificationBadgeCount = recentNotificationIds.length;

	async function loadNotifications() {
		try {
			setNotificationsLoading(true);
			const items = await getMyNotifications();
			if (!isMountedRef.current) return;
			setNotificationItems(items);
			setNotificationsError("");
		} catch (_error) {
			if (!isMountedRef.current) return;
			setNotificationsError("No se pudieron cargar tus notificaciones.");
		} finally {
			if (isMountedRef.current) {
				setNotificationsLoading(false);
			}
		}
	}

	function clearRecentNotificationTimers() {
		for (const timerId of notificationTimersRef.current.values()) {
			window.clearTimeout(timerId);
		}
		notificationTimersRef.current.clear();
		setRecentNotificationIds([]);
	}

	function registerRecentNotification(notificationId) {
		if (!notificationId) return;

		setRecentNotificationIds(previousIds => {
			if (previousIds.includes(notificationId)) {
				return previousIds;
			}

			const timerId = window.setTimeout(() => {
				notificationTimersRef.current.delete(notificationId);
				setRecentNotificationIds(currentIds => currentIds.filter(currentId => currentId !== notificationId));
			}, NOTIFICATION_BADGE_TTL_MS);

			notificationTimersRef.current.set(notificationId, timerId);
			return [...previousIds, notificationId];
		});
	}

	useEffect(() => {
		isMountedRef.current = true;

		if (!isAuthenticated) {
			setProfileUser(null);
			setNotificationItems([]);
			clearRecentNotificationTimers();
			setNotificationsError("");
			return;
		}

		if (user?.apellido) return;

		let mounted = true;
		async function loadProfile() {
			try {
				const res = await api.get("/users/me");
				if (!mounted) return;
				if (res?.data) {
					setProfileUser({
						nombre: res.data.nombre,
						apellido: res.data.apellido,
						mail: res.data.mail,
						rol: res.data.rol
					});
				}
			} catch (_error) {
				// No bloquea render si falla el fetch de perfil.
			}
		}

		loadProfile();

		return () => {
			isMountedRef.current = false;
			mounted = false;
		};
	}, [isAuthenticated, user?.apellido]);

	useEffect(() => {
		if (!isAuthenticated) {
			return;
		}

		let mounted = true;

		loadNotifications();

		return () => {
			mounted = false;
		};
	}, [isAuthenticated]);

	useEffect(() => {
		if (!isAuthenticated) {
			return undefined;
		}

		const socket = io(SOCKET_BASE_URL, {
			auth: {
				token: token ? `Bearer ${token}` : undefined
			},
			transports: ["websocket"]
		});

		function handleNotificationEvent(payload) {
			const notification = normalizeNotification(payload);
			if (!notification.id) {
				return;
			}

			setNotificationItems(previousItems => [notification, ...previousItems.filter(item => item.id !== notification.id)].slice(0, 20));
			registerRecentNotification(notification.id);
		}

		socket.on("notification:new", handleNotificationEvent);

		return () => {
			socket.off("notification:new", handleNotificationEvent);
			socket.disconnect();
			clearRecentNotificationTimers();
		};
	}, [isAuthenticated, token]);

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
		clearRecentNotificationTimers();
		navigate("/login");
	}

	function handleNavItemClick() {
		setMobileMenuOpen(false);
	}

	function getNotificationTypeLabel(item) {
		return item?.themeLabel || item?.source || "Notificación";
	}

	function getNotificationDisplayTitle(item) {
		if (item?.type === "sistema") {
			return "Notificación de sistema";
		}
		// Para actividades
		const title = item?.title || "";
		if (title.toLowerCase().includes("rechaz")) {
			return "Rechazo propuesta actividad";
		}
		if (title.toLowerCase().includes("aprobad")) {
			return "Aprobación de propuesta actividad";
		}
		return title;
	}

	function getNotificationDisplayDetail(item) {
		if (item?.type === "sistema") {
			return item?.title || "";
		}
		// Para actividades, extraer el nombre de la actividad del título
		const title = item?.title || "";
		const colonIndex = title.indexOf(":");
		if (colonIndex !== -1) {
			return title.substring(colonIndex + 1).trim();
		}
		return item?.detail || "";
	}

	function getNotificationToneClass(item) {
		return "bg-white";
	}

	function getNotificationSourceClass(item) {
		return item?.type === "actividad"
			? "bg-[#e8f7ec] text-[var(--primary)]"
			: "bg-[#ffe8e8] text-[#d43c3c]";
	}

	async function openNotificationItem(item) {
		setNotificationsOpen(false);
		navigate("/user/notificaciones");
	}

	const navLinkClass = ({ isActive }) =>
		[
			"rounded-xl px-3.5 py-2 text-[0.92rem] font-semibold text-[#355447] [transition:background-color_150ms_ease,color_120ms_ease] hover:bg-[#def3e7] hover:text-[var(--primary-strong)] active:bg-[var(--primary-active)]",
			isActive ? "bg-[var(--primary-active)] !text-[var(--primary-strong)]" : ""
		].join(" ");

	return (
		<header className="sticky top-0 z-50 bg-[color:var(--nav-bg,white)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--nav-bg,white)]/80 shadow-[0_8px_20px_-20px_rgba(6,40,24,0.55)]">
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

				<div className="relative z-50 flex items-center justify-self-end gap-5 max-[1120px]:gap-3 max-[860px]:col-start-2 max-[860px]:row-start-1 max-[860px]:gap-2">
                    

					<div className="flex items-center gap-4 max-[1120px]:gap-1.5">

					{isAuthenticated && (
						<div className="relative">
							<button
								type="button"
								className="relative inline-flex h-[2.5rem] w-[2.5rem] items-center justify-center cursor-pointer rounded-sm bg-[color:var(--nav-bg,white)] transition-colors duration-200 hover:bg-[var(--primary-hover)]"
								aria-label="Notificaciones"
								onClick={() => {
									setNotificationsOpen(previous => !previous);
									setMenuOpen(false);
								}}
								aria-expanded={notificationsOpen}
							>
								<Bell aria-hidden="true" focusable="false" className="h-4 w-4 text-[#3e5b4c]" strokeWidth={1.8} />
								{notificationBadgeCount > 0 && (
									<span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#e03a3a] px-1 text-[0.66rem] font-bold leading-none text-white shadow-[0_8px_16px_-10px_rgba(224,58,58,0.8)]">
										{notificationBadgeCount > 9 ? "9+" : notificationBadgeCount}
									</span>
								)}
							</button>

								{notificationsOpen && (
								<div className="absolute right-0 top-[calc(100%+0.4rem)] z-[21] w-[min(400px,82vw)] overflow-hidden rounded-[14px] border border-[#d7e4dc] bg-[color:var(--nav-bg,white)] shadow-[0_18px_32px_-24px_rgba(11,38,24,0.38)] max-[860px]:top-[calc(100%+0.5rem)] max-[860px]:w-[min(320px,calc(100vw-1.4rem))] max-[640px]:w-[min(300px,calc(100vw-1rem))]" role="dialog" aria-label="Notificaciones">
									<div className="border-b border-[#e1ebe4] bg-[var(--gray-soft)] px-4 py-3">
										<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Centro de alertas</p>
										<p className="mt-1 m-0 text-[0.92rem] font-semibold text-[#244235]">Últimas 3 notificaciones</p>
									</div>
									<div className="grid gap-0 bg-white">
										{notificationsError ? (
											<div className="px-4 py-4 text-[0.86rem] font-semibold text-[#a03d2e]">{notificationsError}</div>
										) : notificationsLoading ? (
											<div className="px-4 py-4 text-[0.86rem] text-[#60716a]">Cargando notificaciones...</div>
										) : notificationPreview.length === 0 ? (
											<div className="px-4 py-5 text-center text-[0.86rem] text-[#60716a]">No tienes notificaciones pendientes.</div>
										) : (
											notificationPreview.map(item => (
												<button
													key={item.id}
													type="button"
													className={`grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 border-b border-[#e7eee9] px-4 py-3 text-left last:border-b-0 hover:bg-[#f6faf7] ${getNotificationToneClass(item)}`}
													onClick={() => openNotificationItem(item)}
												>
													<div className="relative mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-white text-[var(--primary)] shadow-[0_6px_14px_-12px_rgba(16,24,40,0.35)]">
														<BellRing aria-hidden="true" focusable="false" className="h-4 w-4" strokeWidth={1.9} />
														{recentNotificationIds.includes(item.id) && (
															<span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#15b76d]" title="Notificación reciente" />
														)}
													</div>
													<div className="min-w-0 space-y-1">
														<div className="flex flex-wrap items-center gap-2">
															<strong className="block text-[0.92rem] font-semibold leading-tight text-[#1f3328]">{getNotificationDisplayTitle(item)}</strong>
															<span className={`inline-flex rounded-sm px-2 py-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] ${getNotificationSourceClass(item)}`}>{item.source}</span>
														</div>
														<div className="block truncate  text-[0.9rem] leading-tight text-[var(--text)]">Actividad: "{getNotificationDisplayDetail(item)}"</div>
													</div>
													<span className="inline-flex shrink-0 rounded-sm bg-[var(--gray)] px-2 py-1 text-[0.72rem] font-semibold text-[#5f7a6a]">{item.date}</span>
												</button>
											))
									)}
								</div>
								<div className="border-t border-[#e7eee9] bg-[#fbfcfb] px-4 py-3 text-center">
									<button type="button" className="inline-flex items-center gap-2 text-[0.84rem] font-semibold text-[var(--primary)] hover:text-[var(--primary-strong)]" onClick={() => {
										setNotificationsOpen(false);
										navigate("/user/notificaciones");
									}}>
										Ver todas las notificaciones
										<ChevronRight className="h-4 w-4" strokeWidth={1.8} />
									</button>
								</div>
								</div>
							)}
						</div>
					)}

					{isAuthenticated && (
						<div className="flex items-center gap-2 max-[1120px]:gap-1.5">
							<div className="hidden min-[861px]:flex items-center gap-2 rounded-sm bg-[color:var(--bg)] px-2.5 py-2 text-[0.89rem] font-semibold leading-none text-[#2e4c3d]">
								<UserRound aria-hidden="true" focusable="false" className="h-5 w-5 text-[#2e4c3d]" strokeWidth={1.5} />
								<span className="max-w-[12rem] min-w-0 overflow-hidden">
									<span className="block truncate">{fullName}</span>
									{mergedUser?.mail && <span className="block truncate text-[0.72rem] font-normal text-[#60716a]">{mergedUser.mail}</span>}
								</span>
							</div>
							<button
								type="button"
								className="inline-flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-sm border border-[#f2c8c8] bg-white text-[#d43c3c] transition-colors duration-200 hover:bg-[#fff1f1] hover:text-[#b92f2f] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(212,60,60,0.14)]"
								onClick={handleLogout}
								aria-label="Cerrar sesion"
								title="Cerrar sesion"
							>
								<LogOut aria-hidden="true" focusable="false" className="h-4 w-4" strokeWidth={1.9} />
							</button>
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

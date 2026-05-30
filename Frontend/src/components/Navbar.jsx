import React, { useEffect, useRef, useState } from "react";
import { Bell, BellRing, CalendarDays, ChevronRight, UserCheck, Home, LayoutDashboard, ListChecks, LoaderCircle, LogOut, Menu, RefreshCw, UserRound, Users, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api, { API_BASE_URL } from "../services/api";
import { getMyNotifications, getNotificationListDisplay, normalizeNotification } from "../services/notificationsService";
import { requestNotificationPermissionAndGetToken } from "../services/firebase";

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
	const [mobileMenuTop, setMobileMenuTop] = useState(0);
	const [profileUser, setProfileUser] = useState(null);
	const [notificationItems, setNotificationItems] = useState([]);
	const [recentNotificationIds, setRecentNotificationIds] = useState([]);
	const [notificationsLoading, setNotificationsLoading] = useState(false);
	const [notificationsError, setNotificationsError] = useState("");
	const navRef = useRef(null);
	const isMountedRef = useRef(true);
	const notificationTimersRef = useRef(new Map());
	const pushRegistrationAttemptedRef = useRef(false);

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
			setNotificationsError("");
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
			pushRegistrationAttemptedRef.current = false;
			return;
		}

		let mounted = true;

		loadNotifications();

		return () => {
			mounted = false;
		};
	}, [isAuthenticated]);

	useEffect(() => {
		if (!isAuthenticated || pushRegistrationAttemptedRef.current) {
			return;
		}

		const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
		if (!vapidKey) {
			console.warn("VITE_FIREBASE_VAPID_KEY no definido. Push FCM deshabilitado.");
			return;
		}

		pushRegistrationAttemptedRef.current = true;
		requestNotificationPermissionAndGetToken(vapidKey).catch(error => {
			console.warn("No se pudo registrar token FCM:", error?.message || error);
			pushRegistrationAttemptedRef.current = false;
		});
	}, [isAuthenticated]);

	useEffect(() => {
		if (!isAuthenticated || !notificationsOpen) {
			return undefined;
		}

		loadNotifications().catch(() => {
			// Se mantiene el último estado visible si un reintento puntual falla.
		});

		return undefined;
	}, [isAuthenticated, notificationsOpen]);

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
			if (window.innerWidth > 980) {
				setMobileMenuOpen(false);
			}
		}

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		if (typeof document === "undefined") return undefined;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = mobileMenuOpen ? "hidden" : previousOverflow;

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [mobileMenuOpen]);

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

	function openMobileMenu(event) {
		if (typeof window !== "undefined") {
			setMobileMenuTop(0);
		}

		setMobileMenuOpen(previous => !previous);
	}

	function getNotificationTypeLabel(item) {
		return item?.themeLabel || item?.source || "Notificación";
	}

	function toggleSidebar() {
		try {
			document.body.classList.toggle("sidebar-collapsed");
		} catch (e) {
			// noop
		}
	}

	function getAdminPageTitle() {
		const path = (location.pathname || "").replace(/\/$/, "");
		if (path.includes("/admin/notificaciones")) return "Notificaciones";
		if (path.includes("/admin/dashboard")) return "Panel administrador";
		if (path.includes("/admin/actividades")) return "Actividades";
		if (path.includes("/admin/usuarios")) return "Usuarios";
		const parts = path.split("/").filter(Boolean);
		return parts.length ? parts[parts.length - 1].replace(/[-_]/g, " ") : "Admin";
	}

	function getNotificationDisplayTitle(item) {
		return getNotificationListDisplay(item).title;
	}

	function getNotificationDisplayDetail(item) {
		return getNotificationListDisplay(item).detail;
	}

	function getNotificationToneClass(item) {
		return "bg-white";
	}

	function getNotificationSourceClass(item) {
		const title = String(item?.title || "").toLowerCase();
		const isReview = title.includes("aprobad") || title.includes("rechaz");
		const isActivity = item?.type === "actividad" || item?.themeKey === "activity" || item?.themeKey === "activity-change";

		if (isReview) {
			return "bg-[#e8f7ec] text-[var(--primary)]";
		}

		if (isActivity) {
			return "bg-[#e8f7ec] text-[var(--primary)]";
		}

		return "bg-[#ffe8e8] text-[#d43c3c]";
	}

	async function openNotificationItem(item) {
		setNotificationsOpen(false);
		navigate("/user/notificaciones");
	}

	const isAdmin = String(rol || "").toLowerCase().includes("admin");
	const showAdminToolbar = isAdmin && location.pathname !== "/";

	const navLinkClass = ({ isActive }) =>
		[
			"flex items-center gap-2 rounded-sm py-2 text-[0.92rem] font-semibold text-[#355447] [transition:background-color_150ms_ease,color_120ms_ease] hover:bg-[#edf2ef] hover:text-[#162a1e] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(5,166,61,0.15)]",
			"px-3",
			isActive ? "bg-[var(--primary-active)] !text-[var(--primary-strong)]" : ""
		].join(" ");

	function NavIcon({ name, className = "h-5 w-4.5 shrink-0" }) {
		if (name === "home") return <Home aria-hidden="true" focusable="false" className={className} strokeWidth={1.9} />;
		if (name === "calendar") return <CalendarDays aria-hidden="true" focusable="false" className={className} strokeWidth={1.9} />;
		if (name === "activities") return <ListChecks aria-hidden="true" focusable="false" className={className} strokeWidth={1.9} />;
		if (name === "attendance") return <UserCheck aria-hidden="true" focusable="false" className={className} strokeWidth={1.9} />;
		if (name === "groups") return <Users aria-hidden="true" focusable="false" className={className} strokeWidth={1.9} />;
		if (name === "admin") return <LayoutDashboard aria-hidden="true" focusable="false" className={className} strokeWidth={1.9} />;
		return null;
	}

	function renderMobileMenu() {
		if (!mobileMenuOpen) return null;

		return (
			<>
				{mobileMenuOpen && (
					<button
						type="button"
						className="fixed inset-0 z-30 hidden bg-[#10261a]/20 max-[980px]:block"
						style={{ top: mobileMenuTop, height: "100dvh" }}
						onClick={() => setMobileMenuOpen(false)}
						aria-label="Cerrar menu de usuario"
					/>
				)}
				<aside
					className={`${mobileMenuOpen ? "max-[980px]:translate-x-0" : "max-[980px]:-translate-x-[110%]"} border-r border-[#e0e5e2] bg-[white] px-3 pb-4 pt-3 min-[981px]:sticky min-[981px]:top-0 min-[981px]:h-screen min-[981px]:overflow-y-auto min-[981px]:flex min-[981px]:flex-col max-[980px]:fixed max-[980px]:left-0 max-[980px]:top-0 max-[980px]:z-[35] max-[980px]:w-[236px] max-[980px]:overflow-y-auto max-[980px]:overscroll-contain max-[980px]:pb-[calc(1rem+env(safe-area-inset-bottom))] max-[980px]:shadow-[0_16px_28px_-18px_rgba(10,27,16,0.5)] max-[980px]:transition-transform max-[980px]:duration-200`}
					style={mobileMenuOpen ? { top: mobileMenuTop, height: "100dvh", maxHeight: "100dvh" } : undefined}
				>
					<div className="mb-3 flex items-center gap-2 px-2">
						<img src="/iconOMJ.jpg" alt="OMJ" className="h-7 w-7 rounded-md border border-[#d8dfda]" />
						<div className="min-w-0">
							<p className="m-0 truncate text-[0.84rem] font-semibold text-[#455b50]">Oficina Municipal Juvenil Curicó</p>
							<p className="m-0 text-[0.75rem] text-[#7a8881]">Acceso participante</p>
						</div>
					</div>

					<nav className="grid gap-1" aria-label="Menu de usuario">
						{isAuthenticated && rol === "participante" && (
							<NavLink to="/user/dashboard" onClick={handleNavItemClick} className={navLinkClass}>
								<span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
									<NavIcon name="home" className="h-[18px] w-[18px] shrink-0" />
								</span>
								<span>Inicio</span>
							</NavLink>
						)}

						{isAuthenticated && rol === "participante" && (
							<>
								<NavLink to="/user/calendario" onClick={handleNavItemClick} className={navLinkClass}>
									<span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
										<NavIcon name="calendar" className="h-[18px] w-[18px] shrink-0" />
									</span>
									<span>Calendario</span>
								</NavLink>
								<NavLink to="/user/mis-actividades" onClick={handleNavItemClick} className={navLinkClass}>
									<span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
										<NavIcon name="activities" className="h-[18px] w-[18px] shrink-0" />
									</span>
									<span>Mis actividades</span>
								</NavLink>
								<NavLink to="/user/asistencia" onClick={handleNavItemClick} className={navLinkClass}>
									<span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
										<NavIcon name="attendance" className="h-[18px] w-[18px] shrink-0" />
									</span>
									<span>Mis asistencias</span>
								</NavLink>
								<NavLink to="/user/grupos" onClick={handleNavItemClick} className={navLinkClass}>
									<span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
										<NavIcon name="groups" className="h-[18px] w-[18px] shrink-0" />
									</span>
									<span>Mis Grupos</span>
								</NavLink>
							</>
						)}

						{!isAuthenticated && (
							<div className="mt-4 grid gap-2">
								<NavLink to="/login" className="btn btn-ghost w-full" onClick={handleNavItemClick}>
									Iniciar sesion
								</NavLink>
								<NavLink to="/register" className="btn btn-primary w-full" onClick={handleNavItemClick}>
									Registrarse
								</NavLink>
							</div>
						)}
					</nav>

					{isAuthenticated && (
						<div className="mt-5 border-t border-[#e2e6e3] pt-3">
							<p className="mb-2 px-2 text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-[#829087]">Cuenta</p>

							<div className="grid gap-2">
								<div className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-center text-[0.9rem] font-semibold text-[#2f463a]">
									<span className="grid h-8 w-8 place-items-center rounded-full bg-[#eef8f2] text-[var(--primary-strong)]">
										<UserRound aria-hidden="true" focusable="false" className="h-4 w-4" strokeWidth={2} />
									</span>
									<span className="grid min-w-0 text-center">
										<span className="truncate">{fullName}</span>
										{mergedUser?.mail && <span className="truncate text-[0.74rem] font-normal text-[#7a8881]">{mergedUser.mail}</span>}
									</span>
								</div>

								<button
									type="button"
									onClick={handleLogout}
									className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-[var(--reject-hover)] bg-white py-2 text-center text-[0.84rem] font-semibold text-[var(--reject-hover)] hover:bg-[#ffefed] px-2.5"
								>
									<LogOut aria-hidden="true" focusable="false" className="h-4 w-4" strokeWidth={2} />
									<span>Cerrar sesion</span>
								</button>
							</div>
						</div>
					)}
				</aside>
			</>
		);
	}

	return (
		<header className="sticky top-0 z-50 bg-white backdrop-blur shadow-[0_8px_20px_-20px_rgba(6,40,24,0.55)]">
			<nav className="mx-auto grid min-h-16 w-[min(98vw,1680px)] grid-cols-[auto_1fr_auto] items-center gap-x-8 px-4 sm:px-6 lg:gap-x-10 max-[1120px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[980px]:min-h-[4.2rem] max-[980px]:w-full max-[980px]:grid-cols-[minmax(0,1fr)_auto] max-[980px]:gap-y-2 max-[980px]:py-2" ref={navRef}>
				<div className="inline-flex items-center gap-2.5 justify-self-start min-[861px]:min-w-0">
					<button
						type="button"
						className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[var(--text)] hover:bg-[#eef7ef] min-[981px]:hidden"
						onClick={openMobileMenu}
						aria-expanded={mobileMenuOpen}
						aria-label={mobileMenuOpen ? "Cerrar menu de usuario" : "Abrir menu de usuario"}
					>
						{mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={1.9} /> : <Menu className="h-5 w-5" strokeWidth={1.9} />}
					</button>

					<Link to="/" className="inline-flex items-center gap-2.5 justify-self-start min-[861px]:min-w-0">
						<img className="block h-8 w-8 min-w-8 rounded-sm object-cover shadow-[0_6px_14px_-10px_rgba(8,38,23,0.5)]" src="/iconOMJ.jpg" alt="Logo OMJ" />
						<span className="font-semibold text-[15px] tracking-tight"> Oficina Municipal Juvenil Curicó</span>
					</Link>
				</div>

				{renderMobileMenu()}

				<div className="flex w-full flex-nowrap items-center justify-center gap-1.5 justify-self-center max-[1120px]:w-auto max-[1120px]:max-w-full max-[1120px]:min-w-0 max-[1120px]:justify-start max-[1120px]:overflow-x-auto max-[1120px]:pb-1 max-[980px]:hidden" aria-label="Navegacion de usuario">
					{isAuthenticated && rol === "participante" && (
						<NavLink
							to="/user/dashboard"
							onClick={handleNavItemClick}
							className={navLinkClass}
						>
							<NavIcon name="home" />
							Inicio
						</NavLink>
					)}

					{isAuthenticated && isAdmin && (
						<NavLink
							to="/admin/dashboard"
							onClick={handleNavItemClick}
							className={navLinkClass}
						>
							<NavIcon name="admin" />
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
								<NavIcon name="calendar" />
								Calendario
							</NavLink>
							<NavLink
								to="/user/mis-actividades"
								onClick={handleNavItemClick}
								className={navLinkClass}
							>
								<NavIcon name="activities" />
								Mis actividades
							</NavLink>
							<NavLink
								to="/user/asistencia"
								onClick={handleNavItemClick}
								className={navLinkClass}
							>
								<NavIcon name="attendance" />
								Mis asistencias
							</NavLink>
							<NavLink
								to="/user/grupos"
								onClick={handleNavItemClick}
								className={navLinkClass}
							>
								<NavIcon name="groups" />
								Mis Grupos
							</NavLink>
						</>
					)}
				</div>

				<div className="relative z-50 flex items-center justify-self-end gap-5 max-[1120px]:gap-3 max-[980px]:col-start-2 max-[980px]:row-start-1 max-[980px]:gap-2">
                    

					<div className="flex items-center gap-4 max-[1120px]:gap-1.5">

					{isAuthenticated && (
						<div className="relative">
							<button
								type="button"
								className="relative inline-flex h-[2.5rem] w-[2.5rem] items-center justify-center cursor-pointer rounded-sm transition-colors duration-200 hover:bg-[var(--primary-hover)]"
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
									<div className="absolute right-0 top-[calc(100%+0.4rem)] z-[21] flex max-h-[min(480px,calc(100dvh-1rem))] w-[min(400px,82vw)] flex-col overflow-hidden rounded-[14px] border border-[#d7e4dc] bg-[color:var(--nav-bg,white)] shadow-[0_18px_32px_-24px_rgba(11,38,24,0.38)] max-[980px]:top-[calc(100%+0.5rem)] max-[980px]:w-[min(320px,calc(100vw-1.4rem))] max-[980px]:max-h-[min(70dvh,420px)] max-[640px]:w-[min(300px,calc(100vw-1rem))]" role="dialog" aria-label="Notificaciones">
									<div className="border-b border-[#e1ebe4] bg-[var(--gray-soft)] px-4 py-3">
										<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Centro de alertas</p>
										<p className="mt-1 m-0 text-[0.92rem] font-semibold text-[#244235]">Últimas 3 notificaciones</p>
									</div>
										<div className="grid min-h-0 flex-1 gap-0 overflow-y-auto bg-white">
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
													<div className="min-w-0 space-y-1 overflow-hidden">
														<div className="flex flex-wrap items-center gap-2">
															<strong className="block max-w-full truncate text-[0.92rem] font-semibold leading-tight text-[#1f3328]">{getNotificationDisplayTitle(item)}</strong>
															<span className={`inline-flex rounded-sm px-2 py-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] ${getNotificationSourceClass(item)}`}>{item.source}</span>
														</div>
														<div className="block overflow-hidden text-[0.9rem] leading-tight text-[var(--text)]" style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 3 }}>
															{getNotificationDisplayDetail(item)}
														</div>
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
							<div className="hidden min-[861px]:flex items-center gap-2 rounded-sm bg-white px-2.5 py-2 text-[0.88rem] font-semibold leading-none text-[#6d7b75]">
								<UserRound aria-hidden="true" focusable="false" className="h-5 w-5 text-[#2e4c3d]" strokeWidth={1.5} />
								<span className="max-w-[12rem] min-w-0 overflow-hidden">
									<span className="block truncate">{fullName}</span>
									{mergedUser?.mail && <span className="block truncate text-[0.72rem] font-normal text-[#7f8b85]">{mergedUser.mail}</span>}
								</span>
							</div>
							<button
								type="button"
								className="inline-flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-sm  text-[#d43c3c] transition-colors duration-200 hover:bg-[#fff1f1] hover:text-[#b92f2f] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(212,60,60,0.14)]"
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
			{showAdminToolbar && (
				<div className="border-t border-b border-[#e7eee9] bg-white/95 py-2">
					<div className="mx-auto w-[min(98vw,1680px)] flex items-center justify-between px-4 sm:px-6">
						<div className="flex items-center gap-3">
							<button type="button" onClick={toggleSidebar} className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#f3faf5] hover:bg-[#eef7ef]">
								<Menu className="h-4 w-4" />
							</button>
							<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">{getAdminPageTitle()}</h2>
						</div>
						<div className="flex items-center gap-2">
							<button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-sm px-3 py-1.5 bg-white border border-[#d8e6dd]">
								<RefreshCw className="h-4 w-4" />
								Actualizar
							</button>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}

import React, { useMemo, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { BadgeCheck, CalendarDays, Clock3, Lock, MapPin, MessageCircle, MoreHorizontal, Send, User, Star } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import Modal from "../components/Modal";
import { formatDateForChile } from "../utils/chileDate";
import { cancelActivityEnrollment, cancelManagedActivity, enrollInActivity, getActivityDetail, markMyAttendance, markParticipantAttendance, rateActivity, removeParticipantFromActivity, sendActivityMessage } from "../services/userViewsService";
import { API_BASE_URL } from "../services/api";

const SOCKET_BASE_URL = (import.meta.env.VITE_SOCKET_URL || API_BASE_URL).replace(/\/api\/?$/, "");

function decodeToken(token) {
	if (!token) return null;
	const parts = token.split(".");
	if (parts.length !== 3) return null;

	try {
		return JSON.parse(atob(parts[1]));
	} catch (_error) {
		return null;
	}
}

function getTokenUserId(user) {
	const raw = user?.id_usuario ?? user?.userId ?? user?.sub;
	const parsed = Number(raw);
	return Number.isInteger(parsed) ? parsed : null;
}

const fallbackParticipants = [
	{ id: "usr-01", name: "Camila Torres", age: 18, status: "Confirmado" },
	{ id: "usr-02", name: "Diego Perez", age: 20, status: "Confirmado" },
	{ id: "usr-03", name: "Valentina Rojas", age: 19, status: "Lista de espera" },
	{ id: "usr-04", name: "Martin Fuentes", age: 22, status: "Confirmado" },
	{ id: "usr-05", name: "Antonia Mella", age: 17, status: "Confirmado" }
];

const fallbackActivity = {
	title: "Laboratorio de Podcast Juvenil",
	date: "2026-04-18",
	hora_inicio: "17:00",
	hora_termino: "19:00",
	place: "Sala Multimedia OMJ",
	manager: "Sofia Munoz",
	id_encargado: 104,
	capacity: 30,
	enrolled: 26,
	description:
		"Sesion practica para crear un podcast desde cero: idea, guion, grabacion y edicion basica. Incluye dinamica grupal y cierre con presentacion de episodios piloto.",
	requirements: ["Notebook o celular para notas", "Puntualidad", "Participacion activa"],
	chat_bidireccional: true,
	aprobado: true,
	status: "programada",
	participants: fallbackParticipants,
	messages: [
		{ id: "msg-01", author: "Sofia", role: "encargado", text: "Recuerden llegar 10 minutos antes para organizar equipos.", time: "16:20" },
		{ id: "msg-02", author: "Pedro", role: "participante", text: "Perfecto, yo llevo audifonos para la prueba.", time: "16:28" },
		{ id: "msg-03", author: "Camila", role: "participante", text: "Yo tambien llevo notebook para editar.", time: "16:31" },
		{ id: "msg-04", author: "Diego", role: "participante", text: "Tenemos que llevar notebook o basta con celular?", time: "16:34" }
	]
};

const ratingsData = {
	average: 4.6,
	total: 38,
	distribution: [
		{ stars: 5, count: 25 },
		{ stars: 4, count: 9 },
		{ stars: 3, count: 3 },
		{ stars: 2, count: 1 },
		{ stars: 1, count: 0 }
	]
};

function getStatusBadge(status) {
	if (status === "finalizada") return { label: "Finalizada", className: "bg-[#e7f5ec] text-[#177945]" };
	if (status === "en_curso") return { label: "En curso", className: "bg-[#e9f3ff] text-[#1d4f91]" };
	if (status === "cancelada") return { label: "Cancelada", className: "bg-[#fff1ed] text-[#8a3b2a]" };
	if (status === "pendiente") return { label: "Pendiente", className: "bg-[#fff3de] text-[#a86612]" };
	return { label: "Programada", className: "bg-[#ecf7f0] text-[#1f6e45]" };
}

function formatDate(value) {
	return formatDateForChile(value, {
		weekday: "long",
		day: "2-digit",
		month: "long",
		year: "numeric"
	});
}

function normalizeActivity(rawActivity = {}) {
	const hasParticipants = Object.prototype.hasOwnProperty.call(rawActivity, "participants");
	const hasMessages = Object.prototype.hasOwnProperty.call(rawActivity, "messages");
	const hasRatings = Object.prototype.hasOwnProperty.call(rawActivity, "ratings");

	return {
		id: rawActivity.id ?? rawActivity.id_actividad ?? null,
		title: rawActivity.title || rawActivity.titulo || fallbackActivity.title,
		date: rawActivity.date || rawActivity.fecha || fallbackActivity.date,
		hora_inicio: rawActivity.hora_inicio || rawActivity.time || fallbackActivity.hora_inicio,
		hora_termino: rawActivity.hora_termino || fallbackActivity.hora_termino,
		place: rawActivity.place || rawActivity.lugar || fallbackActivity.place,
		manager: rawActivity.manager || fallbackActivity.manager,
		id_encargado: rawActivity.id_encargado || fallbackActivity.id_encargado,
		capacity: Number(rawActivity.capacity ?? rawActivity.max_participantes ?? fallbackActivity.capacity),
		enrolled: Number(rawActivity.enrolled ?? rawActivity.inscritos ?? fallbackActivity.enrolled),
		description: rawActivity.description || rawActivity.descripcion || fallbackActivity.description,
		requirements: Array.isArray(rawActivity.requirements) ? rawActivity.requirements : fallbackActivity.requirements,
		chat_bidireccional: rawActivity.chat_bidireccional ?? fallbackActivity.chat_bidireccional,
		aprobado: rawActivity.aprobado ?? rawActivity.approved ?? fallbackActivity.aprobado,
		status: rawActivity.estado || rawActivity.status || fallbackActivity.status,
		ratings: hasRatings ? rawActivity.ratings : ratingsData,
		participants: hasParticipants && Array.isArray(rawActivity.participants)
			? rawActivity.participants
			: fallbackActivity.participants,
		messages: hasMessages && Array.isArray(rawActivity.messages)
			? rawActivity.messages
			: fallbackActivity.messages
	};
}

export default function ActivityDetail() {
	const { activityId } = useParams();
	const location = useLocation();
	const user = decodeToken(localStorage.getItem("token"));
	const role = user?.rol || "participante";
	const currentUserId = getTokenUserId(user);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [activity, setActivity] = useState(null);
	const [isEnrolled, setIsEnrolled] = useState(false);
	const [enrolledCount, setEnrolledCount] = useState(0);
	const [activeParticipantMenu, setActiveParticipantMenu] = useState(null);
	const [participants, setParticipants] = useState([]);
	const [chatMessages, setChatMessages] = useState([]);
	const [enrollmentBusy, setEnrollmentBusy] = useState(false);
	const [enrollmentMessage, setEnrollmentMessage] = useState("");
	const [enrollmentError, setEnrollmentError] = useState("");
	const [activityActionMessage, setActivityActionMessage] = useState("");
	const [activityActionError, setActivityActionError] = useState("");
	const [cancelModalOpen, setCancelModalOpen] = useState(false);
	const [cancelBusy, setCancelBusy] = useState(false);
	const [attendanceBusy, setAttendanceBusy] = useState(false);
	const [manualAttendanceBusyByUser, setManualAttendanceBusyByUser] = useState({});
	const [ratingValue, setRatingValue] = useState(5);
	const [ratingBusy, setRatingBusy] = useState(false);
	const [ratingMessage, setRatingMessage] = useState("");
	const [ratingError, setRatingError] = useState("");
	const [showRatingEditor, setShowRatingEditor] = useState(false);
	const [chatInput, setChatInput] = useState("");
	const [chatBusy, setChatBusy] = useState(false);
	const [chatError, setChatError] = useState("");
	const socketRef = useRef(null);

	useEffect(() => {
		if (typeof window !== "undefined") {
			window.scrollTo({ top: 0, left: 0, behavior: "auto" });
		}
	}, [activityId]);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token || !activityId) return;

		const socket = io(SOCKET_BASE_URL, {
			transports: ["websocket", "polling"],
			auth: { token }
		});

		socketRef.current = socket;

		socket.on("connect", () => {
			socket.emit("activity:join", { activityId: Number(activityId) });
		});

		socket.on("activity:message:new", incomingMessage => {
			setChatMessages(previous => {
				const exists = previous.some(item => Number(item.id) === Number(incomingMessage?.id));
				if (exists) return previous;

				const next = [...previous, incomingMessage];
				next.sort((a, b) => Number(a.id) - Number(b.id));
				return next;
			});
		});

		return () => {
			socket.disconnect();
			socketRef.current = null;
		};
	}, [activityId]);

	useEffect(() => {
		let mounted = true;

		async function loadDetail() {
			setLoading(true);
			setError("");
			setEnrollmentError("");
			setActivityActionError("");

			const response = await getActivityDetail(activityId);
			if (!mounted) return;

			if (!response.ok) {
				setError(response.message || "No se pudo cargar el detalle de la actividad.");
				setActivity(null);
				setParticipants([]);
				setChatMessages([]);
				setEnrolledCount(0);
				setIsEnrolled(false);
				setLoading(false);
				return;
			}

			const normalized = normalizeActivity(response.activity || {});
			setActivity(normalized);
			setParticipants(normalized.participants);
			setChatMessages(normalized.messages);
			setEnrolledCount(normalized.enrolled);
			setIsEnrolled(Boolean(response.activity?.rol_en_actividad === "participante"));
			setLoading(false);
		}

		loadDetail();

		return () => {
			mounted = false;
		};
	}, [activityId]);

	async function refreshActivityDetail(options = {}) {
		const { silentError = false } = options;
		const response = await getActivityDetail(activityId);

		if (!response.ok) {
			if (!silentError) {
				setEnrollmentError(response.message || "No se pudo refrescar la actividad.");
			}
			return false;
		}

		const normalized = normalizeActivity(response.activity || {});
		setActivity(normalized);
		setParticipants(normalized.participants);
		setChatMessages(normalized.messages);
		setEnrolledCount(normalized.enrolled);
		setIsEnrolled(Boolean(response.activity?.rol_en_actividad === "participante"));
		return true;
	}

	const statusBadge = useMemo(() => getStatusBadge(activity?.status), [activity?.status]);
	const ratings = activity?.ratings || ratingsData;
	const ratingsTotal = Array.isArray(ratings.distribution)
		? ratings.distribution.reduce((acc, item) => acc + Number(item.count || 0), 0)
		: 0;
	const isFinished = activity?.status === "finalizada";
	const isInProgress = activity?.status === "en_curso";
	const isCanceled = activity?.status === "cancelada";
	const isActivityManager = currentUserId !== null && Number(activity?.id_encargado) === currentUserId;
	const canManageActivity = role === "admin" || isActivityManager;
	const currentParticipant = useMemo(() => participants.find(item => Number(item.id) === Number(currentUserId)) || null, [participants, currentUserId]);
	const currentUserRating = Number(currentParticipant?.valoracion);
	const hasExistingRating = Number.isInteger(currentUserRating) && currentUserRating >= 1 && currentUserRating <= 5;
	const canCancelActivity = canManageActivity && !isFinished && !isCanceled;
	const canSendChat = Boolean(activity?.chat_bidireccional) || canManageActivity;
	const isChatReadOnlyForUser = !canSendChat;
	const canRateInActivity = isFinished && role === "participante" && !canManageActivity;
	const freeSpots = useMemo(() => Math.max((activity?.capacity ?? 0) - enrolledCount, 0), [enrolledCount, activity?.capacity]);
	const canCancelEnrollment = isEnrolled && !isInProgress;
	const hasAttendanceRegistered = Boolean(currentParticipant?.asistio);
	const backTo = location.pathname.startsWith("/admin") ? "/admin/actividades" : "/user/mis-actividades";

	useEffect(() => {
		if (!canRateInActivity) {
			setShowRatingEditor(false);
			return;
		}

		if (hasExistingRating) {
			setRatingValue(currentUserRating);
			setShowRatingEditor(false);
			return;
		}

		setShowRatingEditor(true);
	}, [canRateInActivity, hasExistingRating, currentUserRating]);

	function isOwnMessage(message) {
		const messageUserId = Number(message?.userId);
		if (Number.isInteger(messageUserId) && Number.isInteger(currentUserId)) {
			return messageUserId === currentUserId;
		}

		return false;
	}

	function getSenderLabel(message) {
		if (message.role === "admin") return `${message.author} · Admin`;
		if (message.role === "encargado") return `${message.author} · Encargado`;
		return message.author;
	}

	function isManagerMessage(message) {
		return message.role === "admin" || message.role === "encargado";
	}

	function getMessageMomentLabel(message) {
		if (message.time) return message.time;
		if (!message.date) return "";
		return formatDateForChile(message.date, {
			day: "2-digit",
			month: "2-digit",
			year: "numeric"
		});
	}

	async function handleEnrollmentToggle() {
		if (loading || enrollmentBusy) return;
		if (isEnrolled && !canCancelEnrollment) return;
		setEnrollmentMessage("");
		setEnrollmentError("");

		setEnrollmentBusy(true);
		const response = isEnrolled
			? await cancelActivityEnrollment(activityId)
			: await enrollInActivity(activityId);
		setEnrollmentBusy(false);

		if (!response.ok) {
			setEnrollmentError(response.message || "No se pudo actualizar la inscripción.");
			return;
		}

		const refreshed = await refreshActivityDetail({ silentError: true });

		if (!refreshed) {
			if (isEnrolled) {
				setIsEnrolled(false);
				setEnrolledCount(current => Math.max(current - 1, 0));
				setEnrollmentMessage("Inscripción cancelada correctamente.");
				return;
			}

			setIsEnrolled(true);
			setEnrolledCount(current => Math.min(current + 1, activity.capacity));
			setEnrollmentMessage("Inscrito correctamente en la actividad.");
			return;
		}

		setEnrollmentMessage(isEnrolled ? "Inscripción cancelada correctamente." : "Inscrito correctamente en la actividad.");
	}

	async function handleMarkAttendance() {
		if (!isEnrolled || !isInProgress || hasAttendanceRegistered || attendanceBusy) return;

		setAttendanceBusy(true);
		setEnrollmentError("");
		setEnrollmentMessage("");

		const response = await markMyAttendance(activityId);
		setAttendanceBusy(false);

		if (!response.ok) {
			setEnrollmentError(response.message || "No se pudo registrar la asistencia.");
			return;
		}

		await refreshActivityDetail({ silentError: true });
		setEnrollmentMessage(response.message || "Asistencia registrada correctamente.");
	}

	async function handleManualAttendance(participantId) {
		if (!isInProgress || !participantId) return;

		setManualAttendanceBusyByUser(previous => ({ ...previous, [participantId]: true }));
		setActivityActionError("");
		setActivityActionMessage("");

		const response = await markParticipantAttendance(activityId, participantId);
		setManualAttendanceBusyByUser(previous => ({ ...previous, [participantId]: false }));

		if (!response.ok) {
			setActivityActionError(response.message || "No se pudo marcar asistencia manual.");
			return;
		}

		setActiveParticipantMenu(null);
		await refreshActivityDetail({ silentError: true });
		setActivityActionMessage(response.message || "Asistencia registrada correctamente.");
	}

	async function handleRemoveParticipant(participantId) {
		if (!participantId) return;

		const confirmed = window.confirm("¿Expulsar a este participante de la actividad?");
		if (!confirmed) return;

		setActivityActionError("");
		setActivityActionMessage("");

		const response = await removeParticipantFromActivity(activityId, participantId);
		if (!response.ok) {
			setActivityActionError(response.message || "No se pudo expulsar al participante.");
			return;
		}

		setActiveParticipantMenu(null);
		await refreshActivityDetail({ silentError: true });
		setActivityActionMessage(response.message || "Participante expulsado correctamente.");
	}

	async function handleSubmitRating() {
		if (!canRateInActivity || ratingBusy) return;

		setRatingBusy(true);
		setRatingError("");
		setRatingMessage("");

		const response = await rateActivity(activityId, ratingValue);
		setRatingBusy(false);

		if (!response.ok) {
			setRatingError(response.message || "No se pudo registrar la valoración.");
			return;
		}

		setRatingMessage(response.message || "Valoración registrada correctamente.");
		await refreshActivityDetail({ silentError: true });
	}

	function openRatingEditor() {
		if (!canRateInActivity) return;
		setRatingError("");
		setRatingMessage("");
		if (hasExistingRating) {
			setRatingValue(currentUserRating);
		}
		setShowRatingEditor(true);
	}

	function closeRatingEditor() {
		if (ratingBusy) return;
		setShowRatingEditor(false);
		setRatingError("");
	}

	function openCancelModal() {
		setActivityActionError("");
		setActivityActionMessage("");
		setActiveParticipantMenu(null);
		setCancelModalOpen(true);
	}

	function closeCancelModal() {
		if (cancelBusy) return;
		setCancelModalOpen(false);
	}

	async function handleConfirmCancelActivity() {
		if (!activity?.id || cancelBusy) return;

		setCancelBusy(true);
		setActivityActionError("");
		setActivityActionMessage("");

		const response = await cancelManagedActivity(activity.id);
		if (!response.ok) {
			setCancelBusy(false);
			setActivityActionError(response.message || "No se pudo cancelar la actividad.");
			return;
		}

		await refreshActivityDetail({ silentError: true });
		setCancelBusy(false);
		setCancelModalOpen(false);
		setActivityActionMessage("Actividad cancelada correctamente.");
	}

	async function handleSendChatMessage() {
		if (!canSendChat || chatBusy) return;

		const messageText = chatInput.trim();
		if (!messageText) return;

		setChatBusy(true);
		setChatError("");

		const response = await sendActivityMessage(activityId, messageText);
		setChatBusy(false);

		if (!response.ok) {
			setChatError(response.message || "No se pudo enviar el mensaje.");
			return;
		}

		setChatInput("");
		await refreshActivityDetail({ silentError: true });
	}

	function handleChatKeyDown(event) {
		if (event.key !== "Enter" || event.shiftKey) return;
		event.preventDefault();
		handleSendChatMessage();
	}

	if (loading) {
		return (
			<section className="relative animate-[revealUp_0.7s_ease_both]">
				<div className="max-w-7xl mx-auto px-4 py-6">
					<article className="rounded-2xl border border-[#d8e6dd] bg-[linear-gradient(180deg,#ffffff,#f7fcf9)] p-7 shadow-sm">
						<div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
							<div className="relative inline-flex h-16 w-16 items-center justify-center" aria-hidden="true">
								<span className="absolute h-16 w-16 rounded-full border-4 border-[#d7e9df]" />
								<span className="absolute h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-[var(--primary)] border-r-[var(--primary)]" />
								<span className="h-6 w-6 rounded-full bg-[var(--primary)]/15" />
							</div>

							<div className="space-y-1">
								<p className="m-0 text-[1rem] font-semibold text-[var(--text)]">Cargando actividad</p>
								<p className="m-0 text-[0.9rem] text-[var(--text-muted)]">Estamos preparando todos los datos del detalle.</p>
							</div>

							<div className="relative w-full max-w-[340px] overflow-hidden rounded-full bg-[#e8f1eb]">
								<div className="loading-slide-bar h-1.5 w-[38%] rounded-full bg-[var(--primary)]" />
							</div>
						</div>
					</article>
				</div>
			</section>
		);
	}

	if (!activity) {
		return (
			<section className="relative animate-[revealUp_0.7s_ease_both]">
				<div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
					<article className="rounded-xl border border-[#f0d5cf] bg-[#fff4f2] p-4 shadow-sm">
						<p className="m-0 text-[0.92rem] font-medium text-[#9f3b2d]">{error || "No se encontró la actividad solicitada."}</p>
					</article>
					<div className="pt-2">
						<Link to={backTo} className="inline-flex items-center gap-2 text-[0.9rem] font-semibold text-[var(--primary)] hover:underline">
							← Volver
						</Link>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="relative animate-[revealUp_0.7s_ease_both]">
			<div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
				{activityActionMessage && (
					<article className="rounded-xl border border-[#d2e9da] bg-[#f2fbf5] p-4 shadow-sm">
						<p className="m-0 text-[0.92rem] font-medium text-[#1d6a41]">{activityActionMessage}</p>
					</article>
				)}

				{activityActionError && (
					<article className="rounded-xl border border-[#f0d5cf] bg-[#fff4f2] p-4 shadow-sm">
						<p className="m-0 text-[0.92rem] font-medium text-[#9f3b2d]">{activityActionError}</p>
					</article>
				)}

				{error && (
					<article className="rounded-xl border border-[#f0d5cf] bg-[#fff4f2] p-4 shadow-sm">
						<p className="m-0 text-[0.92rem] font-medium text-[#9f3b2d]">{error}</p>
					</article>
				)}

				<div className="text-left space-y-3">
					<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Detalle de actividad</p>
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">{activity.title}</h1>
							<p className="mt-2 text-[0.93rem] text-[var(--text-muted)]">Actividad #{activityId || "sin-id"} · Capacidad máxima {activity.capacity} participantes</p>
						</div>
						<span className={`inline-flex rounded-lg px-3 py-1.5 text-[0.78rem] font-semibold flex-shrink-0 ${statusBadge.className}`}>{statusBadge.label}</span>
					</div>
				</div>

				<section className="flex flex-col gap-6 lg:grid lg:items-start lg:grid-cols-[1.35fr_0.65fr]">
					<div className="grid auto-rows-max content-start gap-6 max-lg:contents">
						<article className="order-1 rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm lg:order-none">
							<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Descripción</h2>
							<p className="mt-3 text-[0.94rem] leading-relaxed text-[var(--text-muted)]">{activity.description}</p>

							<div className="mt-6 border-t border-[#e0e9e2] pt-5">
								<h3 className="m-0 text-[0.95rem] font-semibold text-[var(--text)]">Detalles de la actividad</h3>
								<div className="mt-4 grid gap-3 sm:grid-cols-2">
									<div className="rounded-lg border border-[#e2ebe4] bg-white px-3.5 py-3">
										<p className="m-0 text-[0.8rem] text-[var(--text-muted)]">Fecha</p>
										<p className="mt-1 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-[var(--text)]">
											<CalendarDays className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
											{formatDate(activity.date)}
										</p>
									</div>
									<div className="rounded-lg border border-[#e2ebe4] bg-white px-3.5 py-3">
										<p className="m-0 text-[0.8rem] text-[var(--text-muted)]">Hora inicio - término</p>
										<p className="mt-1 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-[var(--text)]">
											<Clock3 className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
											{activity.hora_inicio} - {activity.hora_termino}
										</p>
									</div>
									<div className="rounded-lg border border-[#e2ebe4] bg-white px-3.5 py-3">
										<p className="m-0 text-[0.8rem] text-[var(--text-muted)]">Sala / lugar</p>
										<p className="mt-1 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-[var(--text)]">
											<MapPin className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
											{activity.place}
										</p>
									</div>
									<div className="rounded-lg border border-[#e2ebe4] bg-white px-3.5 py-3">
										<p className="m-0 text-[0.8rem] text-[var(--text-muted)]">Encargado</p>
										<p className="mt-1 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-[var(--text)]">
											<User className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
											{activity.manager} (ID {activity.id_encargado})
										</p>
									</div>
									<div className="rounded-lg border border-[#e2ebe4] bg-white px-3.5 py-3">
										<p className="m-0 text-[0.8rem] text-[var(--text-muted)]">Estado</p>
										<p className="mt-1 text-[0.9rem] font-semibold text-[var(--text)]">{statusBadge.label}</p>
									</div>
									<div className="rounded-lg border border-[#e2ebe4] bg-white px-3.5 py-3">
										<p className="m-0 text-[0.8rem] text-[var(--text-muted)]">Aprobación</p>
										<p className="mt-1 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-[var(--text)]">
											<BadgeCheck className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
											{activity.aprobado ? "Aprobada" : "Pendiente de aprobación"}
										</p>
									</div>
								</div>
							</div>
						</article>

						<article className="order-4 rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm lg:order-none">
							<div className="flex items-center justify-between gap-3 mb-4">
								<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Participantes Inscritos</h2>
								<span className="rounded-full bg-[#ebf6ef] px-3 py-1 text-[0.75rem] font-semibold text-[#266346]">{participants.length}</span>
							</div>

							<div className="overflow-visible rounded-lg border border-[#e0e9e2] bg-white">
								<div className="divide-y divide-[#e5ede8]">
									{participants.map(person => (
										<div key={person.id} className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-3.5 py-3 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
											<span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#d7e4dd] bg-transparent text-[0.7rem] font-bold text-[#2f5c45]">
												{person.name
													.split(" ")
													.slice(0, 2)
													.map(n => n[0])
													.join("")}
											</span>
											<div className="min-w-0 pr-1">
												<p className="m-0 break-words text-[0.91rem] font-semibold leading-snug text-[var(--text)] sm:truncate">{person.name}</p>
												<p className="m-0 mt-0.5 text-[0.8rem] text-[var(--text-muted)]">
													{person.age} años
													<span className={`sm:hidden ${person.status === "Confirmado" ? "text-[#177945]" : "text-[#b87015]"}`}>
														{" "}· {person.status}
													</span>
												</p>
											</div>
											<span className={`hidden flex-shrink-0 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold whitespace-nowrap sm:inline-flex ${person.status === "Confirmado" ? "bg-[#e7f5ec] text-[#177945]" : "bg-[#fff3de] text-[#b87015]"}`}>
												{person.status}
											</span>
											{canManageActivity && !isFinished && (
												<>
													<button
														type="button"
														onClick={() => setActiveParticipantMenu(previous => (previous === person.id ? null : person.id))}
														className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-[#5b7265] transition-colors hover:border-[#dce7e0] hover:bg-[#f6faf8]"
														aria-label={`Opciones de ${person.name}`}
													>
														<MoreHorizontal className="h-4 w-4" strokeWidth={2} />
													</button>

													{activeParticipantMenu === person.id && (
														<div className="absolute right-3 top-[calc(100%_-_8px)] z-40 w-[190px] rounded-md border border-[#dce7e0] bg-white p-1.5 shadow-[0_14px_24px_-20px_rgba(10,43,26,0.55)]">
															{isInProgress && (
																<button
																	type="button"
																	onClick={() => handleManualAttendance(person.id)}
																	disabled={Boolean(manualAttendanceBusyByUser[person.id]) || Boolean(person.asistio)}
																	className="w-full rounded-md px-2.5 py-2 text-left text-[0.82rem] font-medium text-[#274634] hover:bg-[#f4faf7] disabled:cursor-not-allowed disabled:opacity-70"
																>
																	{person.asistio ? "Asistencia registrada" : manualAttendanceBusyByUser[person.id] ? "Registrando..." : "Marcar asistencia manual"}
																</button>
															)}
															<button type="button" onClick={() => handleRemoveParticipant(person.id)} className="w-full rounded-md px-2.5 py-2 text-left text-[0.82rem] font-medium text-[#8a3b2a] hover:bg-[#fff4ef]">Expulsar de la actividad</button>
														</div>
													)}
												</>
											)}
										</div>
									))}
								</div>
							</div>
						</article>
					</div>

					<aside className="grid content-start gap-6 max-lg:contents lg:sticky lg:top-6 lg:self-start">
						{isFinished ? (
							<article className="order-2 rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm lg:order-none">
								<div className="mb-4 flex items-center justify-between gap-3">
									<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Valoraciones</h2>
									<span className="rounded-sm bg-[#eef8f2] px-2.5 py-1 text-[0.74rem] font-semibold text-[#1f6e45]">{ratings.total} reseñas</span>
								</div>

								<div className="mt-4 space-y-2">
									{(Array.isArray(ratings.distribution) ? ratings.distribution : []).map(item => {
										const percentage = ratingsTotal === 0 ? 0 : Math.round((item.count / ratingsTotal) * 100);

										return (
											<div key={`rating-${item.stars}`} className="grid grid-cols-[40px_1fr_34px] items-center gap-2 text-[0.78rem]">
												<span className="font-semibold text-[var(--accent-strong)]">{item.stars}★</span>
												<div className="h-2 rounded-full bg-[#e7efea]">
													<div className="h-2 rounded-full bg-[#f59e0b]" style={{ width: `${percentage}%` }} />
												</div>
												<span className="text-right text-[var(--text-muted)]">{item.count}</span>
											</div>
										);
									})}
								</div>

								{canRateInActivity && hasExistingRating && !showRatingEditor && (
									<div className="mt-4 space-y-3 rounded-sm border border-[var(--primary-soft)] bg-[var(--gray-soft)] px-4 py-4 text-center">
										<p className="m-0 text-[0.88rem] text-[var(--text-muted)] mb-2">Ya registraste tu valoración: <strong>{currentUserRating}</strong> estrella{currentUserRating === 1 ? "" : "s"}.</p>
										<button
											type="button"
											onClick={openRatingEditor}
											className="rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-[0.88rem] font-semibold text-white transition-all hover:bg-[var(--primary-strong)]"
										>
											Cambiar valoración
										</button>
									</div>
								)}

								{canRateInActivity && (!hasExistingRating || showRatingEditor) && (
									<div className="mt-4 space-y-4 rounded-sm border border-[#d8e6dd] bg-[var(--gray-soft)] px-4 py-4">
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="m-0 text-[0.84rem] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Tu valoración</p>
												<p className="m-0 mt-1 text-[0.93rem] font-semibold text-[var(--text)]">{hasExistingRating ? "Actualiza tu valoración" : "Selecciona cuántas estrellas quieres dar"}</p>
											</div>
											<span className="inline-flex shrink-0 rounded-full bg-[#eef8f2] px-3 py-1 text-[0.78rem] font-semibold text-[#1f6e45]">
												{ratingValue} estrella{ratingValue === 1 ? "" : "s"}
											</span>
										</div>

										<div className="inline-flex items-center gap-1 rounded-sm border border-[#d8e6dd] bg-white p-1 shadow-sm">
											{[1, 2, 3, 4, 5].map(value => {
												const active = value <= ratingValue;

												return (
													<button
														key={`rate-star-${value}`}
														type="button"
														onClick={() => setRatingValue(value)}
														aria-label={`${value} estrella${value === 1 ? "" : "s"}`}
														aria-pressed={ratingValue === value}
														className={`inline-flex h-11 w-11 items-center justify-center rounded-sm transition-all ${active ? "bg-[#eef8f2] text-[#f59e0b] shadow-[0_8px_18px_-16px_rgba(245,158,11,0.9)]" : "text-[#c6d3cc] hover:bg-[#f4f8f6] hover:text-[#f0b429]"}`}
													>
														<Star className={`h-5 w-5 ${active ? "fill-[#f59e0b]" : ""}`} strokeWidth={1.8} />
													</button>
												);
											})}
										</div>

										<div className="flex items-center gap-2">
											<p className="m-0 text-[0.8rem] font-semibold text-[var(--text-muted)]">Seleccionadas:</p>
											<div className="inline-flex items-center gap-0.5 rounded-sm border border-[#d8e6dd] bg-[#f8fcfa] px-2.5 py-1" aria-label={`Valoración ${ratingValue} de 5`}>
												{[1, 2, 3, 4, 5].map(value => (
													<Star
														key={`selected-star-${value}`}
														className={`h-4 w-4 ${value <= ratingValue ? "fill-[#f59e0b] text-[#f59e0b]" : "text-[#d4ddd7]"}`}
														strokeWidth={1.8}
													/>
												))}
											</div>
											<span className="text-[0.8rem] font-semibold text-[#1f6e45]">{ratingValue} estrella{ratingValue === 1 ? "" : "s"}</span>
										</div>

										<div className="flex flex-wrap items-center gap-3">
											<button type="button" onClick={handleSubmitRating} disabled={ratingBusy} className="rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-[0.88rem] font-semibold text-white transition-all hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-70">
												{ratingBusy ? "Guardando..." : hasExistingRating ? "Actualizar valoración" : "Guardar valoración"}
											</button>
											{hasExistingRating && (
												<button type="button" onClick={closeRatingEditor} disabled={ratingBusy} className="rounded-sm border border-[#d8e6dd] bg-white px-4 py-2.5 text-[0.88rem] font-semibold text-[#486154] transition-all hover:bg-[#f5faf7] disabled:cursor-not-allowed disabled:opacity-70">
													Cancelar
												</button>
											)}
											<p className="m-0 text-[0.8rem] text-[var(--text-muted)]">Pulsa una estrella para elegir la nota exacta.</p>
										</div>
										{ratingMessage && <p className="m-0 text-[0.82rem] font-medium text-[#1d6a41]">{ratingMessage}</p>}
										{ratingError && <p className="m-0 text-[0.82rem] font-medium text-[#9f3b2d]">{ratingError}</p>}
									</div>
								)}
							</article>
						) : (
							<article className="order-2 rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm lg:order-none">
								<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Acciones</p>

								<div className="mt-4 rounded-lg border border-[#d6e5dc] bg-[#f5fbf8] p-4">
									<p className="text-[0.85rem] text-[var(--text-muted)] m-0">Cupos inscritos</p>
									<p className="text-[2.2rem] font-bold text-[var(--primary)] m-0 mt-2">{enrolledCount}/{activity.capacity}</p>
									<p className="text-[0.8rem] text-[var(--text-muted)] m-0 mt-2">{freeSpots === 0 ? "Sin cupos disponibles" : `${freeSpots} cupos libres`}</p>
								</div>

								<div className="mt-4 space-y-2.5">
									{canManageActivity ? (
										<>
											<button type="button" className="w-full rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-[0.88rem] font-semibold text-white transition-all hover:bg-[var(--primary-strong)]">Editar actividad</button>
											<button type="button" className="w-full rounded-sm border border-[var(--primary-soft)] bg-[white] px-4 py-2.5 text-[0.88rem] font-semibold text-[var(--primary)] transition-all hover:bg-[#ecf7f0]">Gestionar inscritos</button>
											<button type="button" className="w-full rounded-sm border border-[var(--reject)] bg-[#fff3ef] px-4 py-2.5 text-[0.88rem] font-semibold text-[var(--reject)] transition-all hover:bg-[#ffe9e2]">Enviar notificación</button>
											{canCancelActivity && (
												<button
													type="button"
													onClick={openCancelModal}
													className="w-full rounded-sm border border-[var(--reject)] bg-[var(--reject)] px-4 py-2.5 text-[0.88rem] font-semibold text-[white] transition-all hover:bg-[var(--reject-hover)] disabled:border-[#dce6df] disabled:bg-[#f4f8f6] disabled:text-[#7d9084]"
												>
													Cancelar actividad
												</button>
											)}
										</>
									) : (
										<>
											<button type="button" onClick={handleEnrollmentToggle} disabled={enrollmentBusy || (!isEnrolled && freeSpots === 0) || (isEnrolled && !canCancelEnrollment)} className={`w-full rounded-sm border px-4 py-2.5 text-[0.88rem] font-semibold transition-all ${isEnrolled ? "border-[var(--reject)] bg-[var(--reject)] text-white hover:bg-[var(--reject-hover)] disabled:border-[#dce6df] disabled:bg-[#f4f8f6] disabled:text-[#7d9084]" : "border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary-strong)] disabled:border-[#dce6df] disabled:bg-[#f4f8f6] disabled:text-[#7d9084]"}`}>
											{isEnrolled ? (isInProgress ? "Inscripción bloqueada en curso" : "Cancelar inscripción") : freeSpots === 0 ? "Sin cupos" : "Inscribirme"}
										</button>
										{enrollmentError && (
											<p className="m-0 text-[0.82rem] font-semibold text-[#9f3b2d]">{enrollmentError}</p>
										)}
										{isEnrolled && (
											<div className="px-1">
												<p className="m-0 text-[0.84rem] font-semibold text-[var(--primary)]">{enrollmentMessage || "Inscrito correctamente en la actividad."}</p>
												<p className="m-0 mt-0.5 text-[0.78rem] text-[var(--text-muted)]">Tu cupo quedó reservado y podrás registrar asistencia cuando la actividad esté en curso.</p>
											</div>
										)}
										{isEnrolled && isInProgress && (
											<button
												type="button"
												onClick={handleMarkAttendance}
												disabled={attendanceBusy || hasAttendanceRegistered}
												className="w-full rounded-sm border-2 border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-[0.88rem] font-semibold text-[white] transition-all hover:bg-[var(--primary-strong)] hover:border-[var(--primary-strong)] disabled:cursor-not-allowed disabled:border-[#dce6df] disabled:bg-[#f4f8f6] disabled:text-[#7d9084]"
											>
												{hasAttendanceRegistered ? "Asistencia ya registrada" : attendanceBusy ? "Registrando asistencia..." : "Marcar asistencia"}
											</button>
										)}
									</>
								)}
								</div>
							</article>
						)}

						<article className="order-3 overflow-hidden rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm lg:order-none">
							<div className="mb-3 flex items-center justify-between gap-2">
								<div>
									<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Chat de actividad</h2>
									<p className="m-0 mt-1 text-[0.8rem] text-[var(--text-muted)]">Canal rápido entre encargado y participantes.</p>
								</div>
								<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--primary)] shadow-sm"><MessageCircle className="h-4 w-4" strokeWidth={1.9} /></span>
							</div>

							<div className="mb-3 h-1 w-full rounded-full bg-[var(--primary)]" />

							<div className="mb-3 inline-flex items-center gap-2 rounded-sm border border-[#cfe5d8] bg-white px-3 py-1 text-[0.73rem] font-semibold text-[#35604b]">
								{activity.chat_bidireccional ? "Chat bidireccional habilitado" : "Solo encargado/admin puede enviar"}
								{!activity.chat_bidireccional && <Lock className="h-3.5 w-3.5" />}
							</div>
							{isChatReadOnlyForUser && (
								<p className="m-0 mb-3 rounded-md border border-[#f0d9b9] bg-[#fff8ef] px-3 py-2 text-[0.78rem] font-medium text-[#8a5a18]">
									Este chat es de solo lectura para ti: solo encargados y admin pueden enviar mensajes.
								</p>
							)}

							<div className="rounded-lg border border-[#d4e6db] bg-[var(--gray-soft)]">
								<div className="max-h-[260px] space-y-2 overflow-y-auto px-3 py-3">
									{chatMessages.length === 0 && (
										<p className="m-0 px-3 py-2 text-[0.82rem] text-[var(--text-muted)] text-center">
											Aún no hay mensajes en esta actividad
										</p>
									)}
									{chatMessages.map(message => {
										const own = isOwnMessage(message);
										const managerMessage = isManagerMessage(message);
										const messageMoment = getMessageMomentLabel(message);
										const senderLabel = own ? message.author : getSenderLabel(message);
										return (
											<div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
												<div className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-[0.82rem] ${own ? "bg-[var(--primary)] text-white" : managerMessage ? "border border-[var(--primary)] bg-[#f4fbf6] text-[] ring-1 ring-[rgba(5,166,61,0.08)]" : "border border-[var(--gray-strong)] bg-white text-[#2f4d3f]"}`}>
													<div className="mb-1 flex items-center justify-between gap-2">
														<p className={`m-0 text-[0.72rem] font-semibold ${own ? "text-[#daf8e6]" : "text-[#537564]"}`}>{senderLabel}</p>
														<span className={`text-[0.69rem] ${own ? "text-[#c5f1d7]" : "text-[#7b9286]"}`}>{messageMoment}</span>
													</div>
													<p className="m-0 leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>
												</div>
											</div>
										);
									})}
								</div>

								{canSendChat && (
									<div className="border-t border-[#e2ebe4] px-3 py-3">
										<div className="grid grid-cols-[1fr_auto] items-center gap-2">
											<input
												type="text"
												value={chatInput}
												onChange={event => setChatInput(event.target.value)}
												onKeyDown={handleChatKeyDown}
												disabled={chatBusy}
												className="w-full rounded-md border border-[#d8e6dd] bg-white px-3 py-2 text-[0.84rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20 disabled:cursor-not-allowed disabled:bg-[#f4f8f6]"
												placeholder="Escribe un mensaje..."
											/>
											<button type="button" onClick={handleSendChatMessage} disabled={chatBusy || !chatInput.trim()} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--primary)] bg-[var(--primary)] text-white transition-colors hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:border-[#cfdcd5] disabled:bg-[#dde9e2]">
												<Send className="h-4 w-4" strokeWidth={2} />
											</button>
										</div>
										{chatError && <p className="m-0 mt-2 text-[0.8rem] font-medium text-[#9f3b2d]">{chatError}</p>}
									</div>
								)}
							</div>
						</article>
					</aside>
				</section>
			</div>

			<Modal
				isOpen={cancelModalOpen}
				title="Cancelar actividad"
				onClose={closeCancelModal}
				panelClassName="sm:max-w-[480px]"
				footer={(
					<>
						<button
							type="button"
							onClick={closeCancelModal}
							disabled={cancelBusy}
							className="rounded-sm border border-[#d8e6dd] bg-white px-3.5 py-2 text-[0.84rem] font-semibold text-[#486154] transition-colors hover:bg-[#f5faf7] disabled:cursor-not-allowed disabled:opacity-70"
						>
							Volver
						</button>
						<button
							type="button"
							onClick={handleConfirmCancelActivity}
							disabled={cancelBusy}
							className="rounded-sm border border-[#f1c8be] bg-[#8a3b2a] px-3.5 py-2 text-[0.84rem] font-semibold text-white transition-colors hover:bg-[#743021] disabled:cursor-not-allowed disabled:opacity-70"
						>
							{cancelBusy ? "Cancelando..." : "Confirmar cancelación"}
						</button>
					</>
				)}
			>
				<div className="space-y-2">
					<p className="m-0 text-[0.9rem] leading-relaxed text-[var(--text-muted)]">
						Esta acción cambiará el estado de la actividad a <strong>Cancelada</strong> y dejará de estar disponible para inscripción.
					</p>
					<p className="m-0 text-[0.84rem] text-[#8a3b2a]">Puedes realizar esta acción porque eres admin o encargado de la actividad.</p>
				</div>
			</Modal>
		</section>
	);
}

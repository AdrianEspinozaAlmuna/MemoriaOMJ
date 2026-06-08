import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function decodeToken(token) {
	if (!token) return null;

	const parts = token.split(".");
	if (parts.length !== 3) return null;

	try {
		const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
		const decoded = atob(base64);
		try {
			return JSON.parse(decoded);
		} catch (_inner) {
			const utf8 = decodeURIComponent(Array.from(decoded, c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""));
			return JSON.parse(utf8);
		}
	} catch (error) {
		return null;
	}
}

function getAuthenticatedUser() {
	const token = localStorage.getItem("token");
	const user = decodeToken(token);

	if (!user) {
		localStorage.removeItem("token");
		return null;
	}

	if (typeof user.exp === "number" && Date.now() >= user.exp * 1000) {
		localStorage.removeItem("token");
		return null;
	}

	return user;
}

export function ParticipantProtectedRoute() {
	const location = useLocation();
	const user = getAuthenticatedUser();

	if (!user) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	const role = String(user.rol || "").trim().toLowerCase();
	if (role === "admin") {
		return <Navigate to="/" replace state={{ from: location }} />;
	}

	if (role !== "participante") {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
}

export function AdminProtectedRoute() {
	const location = useLocation();
	const user = getAuthenticatedUser();

	if (!user) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	const role = String(user.rol || "").trim().toLowerCase();
	if (role !== "admin" && role !== "encargado") {
		if (role === "participante") {
			return <Navigate to="/user/dashboard" replace />;
		}

		return <Navigate to="/" replace />;
	}

	return <Outlet />;
}

export function PublicOnlyRoute() {
	const user = getAuthenticatedUser();

	if (user?.rol === "participante") {
		return <Navigate to="/user/dashboard" replace />;
	}

	if (user?.rol === "admin") {
		return <Navigate to="/admin/dashboard" replace />;
	}

	if (user?.rol === "encargado") {
		return <Navigate to="/admin/dashboard" replace />;
	}

	if (user) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
}

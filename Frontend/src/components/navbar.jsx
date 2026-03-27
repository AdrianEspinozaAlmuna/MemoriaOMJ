import React from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
	return (
		<header className="navbar-wrap">
			<nav className="navbar container">
				<Link to="/" className="brand">
					<img className="brand-mark" src="/iconOMJ.jpg" alt="Logo OMJ" />
					<span className="brand-text">Plataforma Juvenil Curico</span>
				</Link>

				<div className="navbar-links" aria-label="Navegacion de usuario">
					<NavLink
						to="/user/dashboard"
						className={({ isActive }) => `navbar-link-item${isActive ? " active" : ""}`}
					>
						Inicio
					</NavLink>
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
				</div>

				<div className="navbar-actions">
					<NavLink to="/user/dashboard" className="btn btn-propose">
						+ Proponer Actividad
					</NavLink>
					<NavLink to="/login" className="btn btn-ghost">
						Iniciar sesion
					</NavLink>
					<NavLink to="/register" className="btn btn-primary">
						Registrarse
					</NavLink>
				</div>
			</nav>
		</header>
	);
}

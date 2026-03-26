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

				<div className="navbar-actions">
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

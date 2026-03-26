import React from "react";
import { Link } from "react-router-dom";
import "../styles/login.css";

export default function Login() {
	return (
		<section className="auth-page container">
			<article className="auth-card reveal-up">
				<p className="eyebrow">Acceso</p>
				<h1>Iniciar sesion</h1>
				<p className="auth-copy">
					Accede para gestionar tus actividades y revisar novedades de OMJ.
				</p>

				<form className="auth-form" onSubmit={event => event.preventDefault()}>
					<label htmlFor="email">Correo electronico</label>
					<input id="email" name="email" type="email" placeholder="tu@correo.com" required />

					<label htmlFor="password">Contrasena</label>
					<input id="password" name="password" type="password" placeholder="Ingresa tu contrasena" required />

					<button type="submit" className="btn btn-primary btn-full">
						Entrar
					</button>
				</form>

				<p className="auth-footnote">
					No tienes cuenta? <Link to="/register">Registrate</Link>
				</p>
			</article>
		</section>
	);
}

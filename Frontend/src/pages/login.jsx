import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { login } from "../services/userService";
import "../styles/login.css";

export default function Login() {
	const navigate = useNavigate();
	const [formValues, setFormValues] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	function handleChange(event) {
		const { name, value } = event.target;
		setFormValues(previous => ({ ...previous, [name]: value }));
	}

	function validateForm() {
		if (!formValues.email.trim()) return "Ingresa tu correo electronico.";
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
			return "El correo electronico no es valido.";
		}

		if (!formValues.password) return "Ingresa tu contrasena.";
		if (formValues.password.length < 8) return "La contrasena debe tener al menos 8 caracteres.";

		return "";
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setError("");

		const validationError = validateForm();
		if (validationError) {
			setError(validationError);
			return;
		}

		try {
			setLoading(true);
			await login(formValues.email.trim().toLowerCase(), formValues.password);
			navigate("/user/dashboard");
		} catch (requestError) {
			setError(requestError?.response?.data?.message || "No se pudo iniciar sesion.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<section className="auth-page auth-page-login container">
			<article className="auth-card reveal-up">
				<div className="auth-header">
					<div className="auth-mark" aria-hidden="true">
						<img src="/iconOMJ.jpg" alt="OMJ" className="auth-brand-icon" />
						
					</div>
					<p className="auth-brand-label">Oficina Municipal de la Juventud</p>
					<h3 className="auth-title">Iniciar sesion</h3>
					<p className="auth-copy">
						Ingresa con tu cuenta para ver tus actividades y novedades.
					</p>
				</div>

				<form className="auth-form" onSubmit={handleSubmit} noValidate>
					<label htmlFor="email">Correo</label>
					<input
						id="email"
						name="email"
						type="email"
						placeholder="tu@correo.com"
						required
						value={formValues.email}
						onChange={handleChange}
						autoComplete="email"
					/>

					<div className="auth-form-row">
						<label htmlFor="password">Contraseña</label>
					</div>
					<input
						id="password"
						name="password"
						type="password"
						placeholder="Ingresa tu contraseña"
						required
						minLength={8}
						value={formValues.password}
						onChange={handleChange}
						autoComplete="current-password"
					/>

					{error && <p className="auth-message auth-message-error">{error}</p>}

					<button type="submit" className="btn btn-primary btn-full" disabled={loading}>
						{loading ? "Entrando..." : "Entrar"}
					</button>
				</form>

				<p className="auth-footnote">
					No tienes cuenta? <Link to="/register">Registrate</Link>
				</p>
			</article>
		</section>
	);
}

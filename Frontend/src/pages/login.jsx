import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { login } from "../services/userService";

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
		if (formValues.password.length < 10) return "La contrasena debe tener al menos 10 caracteres.";

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
			const response = await login(formValues.email.trim().toLowerCase(), formValues.password);
			const role = response?.user?.rol;

			if (role === "admin") {
				navigate("/admin/dashboard");
				return;
			}

			navigate("/user/dashboard");
		} catch (requestError) {
			setError(requestError?.response?.data?.message || "No se pudo iniciar sesion.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<section className="container grid min-h-[70vh] place-items-center py-4 pb-6 max-[640px]:min-h-0 max-[640px]:place-items-start max-[640px]:py-2">
			<article className="relative z-[1] w-full max-w-[440px] rounded-[14px] border border-[#e5e7eb] bg-white px-6 pb-6 pt-7 animate-[revealUp_0.7s_ease_both] max-[640px]:rounded-xl max-[640px]:px-4 max-[640px]:pb-5 max-[640px]:pt-6 max-[640px]:shadow-[0_14px_22px_-20px_rgba(15,35,23,0.33)]">
				<div className="mb-1 grid justify-items-center gap-0.5 text-center">
					<div className="grid h-[3.2rem] w-[3.2rem] place-items-center rounded-[10px]" aria-hidden="true">
						<img src="/iconOMJ.jpg" alt="OMJ" className="h-12 w-12 rounded-sm object-cover" />
						
					</div>
					<p className="m-0 text-base font-medium leading-[1.35] text-[var(--primary)]">Oficina Municipal de la Juventud</p>
					<h3 className="mb-1 mt-5 margin text-[clamp(1.45rem,2.5vw,1.82rem)] text-[#162e23] font-bold">Iniciar sesión</h3>
					<p className="m-0 max-w-[33ch] text-[0.9rem] leading-[1.5] text-[var(--text-muted)] max-[640px]:text-[0.87rem]">
						Ingresa con tu cuenta para ver tus actividades y novedades.
					</p>
				</div>

				<form className="mt-0 grid gap-3" onSubmit={handleSubmit} noValidate>
					<label htmlFor="email" className="text-[0.82rem] font-semibold text-[#2f4438]">Correo</label>
					<input
						className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3.5 py-3 text-[0.93rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]"
						id="email"
						name="email"
						type="email"
						placeholder="tu@correo.com"
						required
						value={formValues.email}
						onChange={handleChange}
						autoComplete="email"
					/>

					<div className="mt-1 flex items-center justify-between gap-3">
						<label htmlFor="password" className="text-[0.82rem] font-semibold text-[#2f4438]">Contraseña</label>
					</div>
					<input
						className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3.5 py-3 text-[0.93rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]"
						id="password"
						name="password"
						type="password"
						placeholder="Ingresa tu contrasena"
						required
						minLength={10}
						value={formValues.password}
						onChange={handleChange}
						autoComplete="current-password"
					/>

					{error && <p className="m-0 rounded-lg border border-[#f2cbc4] bg-[#fff0ee] px-3 py-2 text-[0.84rem] font-semibold text-[#8f3526]">{error}</p>}

					<button type="submit" className="btn btn-primary btn-full mt-2 rounded-[10px] py-3 text-[0.92rem] tracking-[0.01em]" disabled={loading}>
						{loading ? "Entrando..." : "Entrar"}
					</button>
				</form>

				<p className="mt-4 text-center text-[0.84rem] text-[var(--text-muted)]">
					No tienes cuenta? <Link to="/register" className="font-semibold text-[var(--primary)] transition-colors duration-200 hover:text-[var(--primary-strong)]">Registrate</Link>
				</p>
			</article>
		</section>
	);
}

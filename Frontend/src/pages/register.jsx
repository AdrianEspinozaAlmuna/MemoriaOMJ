import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createUser } from "../services/userService";
import "../styles/register.css";

export default function Register() {
  const [formValues, setFormValues] = useState({
    fullName: "",
    lastName: "",
    rut: "",
    registerEmail: "",
    phone: "",
    registerPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues(previous => ({ ...previous, [name]: value }));
  }

  function validateRegisterForm() {
    if (!formValues.fullName.trim()) return "Ingresa tu nombre.";
    if (!formValues.lastName.trim()) return "Ingresa tu apellido.";

    const rutPattern = /^\d{7,8}-[\dkK]$/;
    if (!rutPattern.test(formValues.rut.trim())) {
      return "El RUT debe tener formato 12345678-9.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.registerEmail.trim())) {
      return "El correo electronico no es valido.";
    }

    if (!/^\d{8,11}$/.test(formValues.phone.trim())) {
      return "El telefono debe tener entre 8 y 11 digitos.";
    }

    if (formValues.registerPassword.length < 8) {
      return "La contrasena debe tener al menos 8 caracteres.";
    }

    if (formValues.confirmPassword !== formValues.registerPassword) {
      return "Las contrasenas no coinciden.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateRegisterForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      await createUser({
        rut: formValues.rut.trim(),
        nombre: formValues.fullName.trim(),
        apellido: formValues.lastName.trim(),
        mail: formValues.registerEmail.trim().toLowerCase(),
        telefono: formValues.phone.trim(),
        rol: "participante"
      });

      setSuccess("Cuenta creada correctamente. Ahora puedes iniciar sesion.");
      setFormValues({
        fullName: "",
        lastName: "",
        rut: "",
        registerEmail: "",
        phone: "",
        registerPassword: "",
        confirmPassword: ""
      });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page auth-page-register container">
      <article className="auth-card reveal-up">
        <div className="auth-header">
          <div className="auth-mark" aria-hidden="true">
            <img src="/iconOMJ.jpg" alt="OMJ" className="auth-brand-icon" />
          </div>
          <p className="auth-brand-label">Oficina Municipal de la Juventud</p>
          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-copy">
            Registrate para postular a talleres y recibir novedades de actividades.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="fullName">Nombre</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Tu nombre"
            required
            value={formValues.fullName}
            onChange={handleChange}
          />

          <label htmlFor="lastName">Apellido</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Tu apellido"
            required
            value={formValues.lastName}
            onChange={handleChange}
          />

          <label htmlFor="rut">RUT</label>
          <input
            id="rut"
            name="rut"
            type="text"
            placeholder="12345678-9"
            required
            value={formValues.rut}
            onChange={handleChange}
            pattern="\d{7,8}-[\dkK]"
          />

          <label htmlFor="registerEmail">Correo electronico</label>
          <input
            id="registerEmail"
            name="registerEmail"
            type="email"
            placeholder="tu@correo.com"
            required
            value={formValues.registerEmail}
            onChange={handleChange}
            autoComplete="email"
          />

          <label htmlFor="phone">Telefono</label>
          <input
            id="phone"
            name="phone"
            type="text"
            placeholder="987654321"
            required
            value={formValues.phone}
            onChange={handleChange}
            pattern="\d{8,11}"
          />

          <label htmlFor="registerPassword">Contrasena</label>
          <input
            id="registerPassword"
            name="registerPassword"
            type="password"
            placeholder="Minimo 8 caracteres"
            required
            minLength={8}
            value={formValues.registerPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />

          <label htmlFor="confirmPassword">Confirmar contrasena</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Minimo 8 caracteres"
            required
            minLength={8}
            value={formValues.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />

          {error && <p className="auth-message auth-message-error">{error}</p>}
          {success && <p className="auth-message auth-message-success">{success}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="auth-footnote">
          Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
        </p>
      </article>
    </section>
  );
}

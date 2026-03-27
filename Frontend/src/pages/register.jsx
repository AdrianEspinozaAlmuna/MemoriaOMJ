import React from "react";
import { Link } from "react-router-dom";
import "../styles/register.css";

export default function Register() {
  return (
    <section className="auth-page container">
      <article className="auth-card reveal-up">
        <p className="eyebrow">Registro</p>
        <h1>Crear cuenta</h1>
        <p className="auth-copy">
          Registrate para postular a talleres y recibir informacion de nuevas actividades.
        </p>

        <form className="auth-form" onSubmit={event => event.preventDefault()}>
          <label htmlFor="fullName">Nombre</label>
          <input id="fullName" name="fullName" type="text" placeholder="Tu nombre" required />

          <label htmlFor="lastName">Apellido</label>
          <input id="lastName" name="lastName" type="text" placeholder="Tu apellido" required />

          <label htmlFor="rut">RUT</label>
          <input
            id="rut"
            name="rut"
            type="text"
            placeholder="12.345.678-9"
            required
          />

          <label htmlFor="registerEmail">Correo electronico</label>
          <input
            id="registerEmail"
            name="registerEmail"
            type="email"
            placeholder="tu@correo.com"
            required
          />

                  <label htmlFor="phone">Teléfono</label>
          <input
            id="phone"
            name="phone"
            type="text"
            placeholder="987654321"
            required
          />

          <label htmlFor="registerPassword">Contraseña</label>
          <input
            id="registerPassword"
            name="registerPassword"
            type="password"
            placeholder="Minimo 8 caracteres"
            required
          />

          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Minimo 8 caracteres"
            required
          />

          <button type="submit" className="btn btn-primary btn-full">
            Crear cuenta
          </button>
        </form>

        <p className="auth-footnote">
          Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
        </p>
      </article>
    </section>
  );
}

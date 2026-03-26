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
          <label htmlFor="fullName">Nombre completo</label>
          <input id="fullName" name="fullName" type="text" placeholder="Tu nombre" required />

          <label htmlFor="registerEmail">Correo electronico</label>
          <input
            id="registerEmail"
            name="registerEmail"
            type="email"
            placeholder="tu@correo.com"
            required
          />

          <label htmlFor="registerPassword">Contrasena</label>
          <input
            id="registerPassword"
            name="registerPassword"
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

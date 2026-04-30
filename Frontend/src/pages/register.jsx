import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { createUser, login } from "../services/userService";
import { getPasswordHelpText, validateStrongPassword } from "../utils/passwordRules";

// Función para formatear RUT
function formatRUT(value) {
  const cleaned = value.replace(/[^\dkK]/g, "");
  if (cleaned.length <= 8) {
    return cleaned;
  }
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  return `${body}-${dv}`;
}

// Función para formatear teléfono
function formatPhone(value) {
  return value.replace(/[^\d]/g, "").slice(0, 11);
}

// Función para evaluar fortaleza de contraseña
function getPasswordStrength(password) {
  return {
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    hasMinLength: password.length >= 10
  };
}

export default function Register() {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    
    // Aplicar formateo especial para RUT y teléfono
    if (name === "rut") {
      setFormValues(previous => ({ ...previous, [name]: formatRUT(value) }));
    } else if (name === "phone") {
      setFormValues(previous => ({ ...previous, [name]: formatPhone(value) }));
    } else {
      setFormValues(previous => ({ ...previous, [name]: value }));
    }
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

    const passwordError = validateStrongPassword(formValues.registerPassword);
    if (passwordError) return passwordError;

    if (formValues.confirmPassword !== formValues.registerPassword) {
      return "Las contrasenas no coinciden.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

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
        rol: "participante",
        password: formValues.registerPassword
      });

      const loginResponse = await login(
        formValues.registerEmail.trim().toLowerCase(),
        formValues.registerPassword
      );

      const role = loginResponse?.user?.rol;
      navigate(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container grid min-h-[70vh] place-items-center py-4 pb-6 max-[640px]:min-h-0 max-[640px]:place-items-start max-[640px]:py-2">
      <article className="relative mt-12 z-[1] mb-12 w-full max-w-[440px] rounded-[14px] border border-[#e5e7eb] bg-white px-6 pb-6 pt-7 shadow-[0_20px_36px_-34px_rgba(15,35,23,0.35)] animate-[revealUp_0.7s_ease_both] max-[640px]:rounded-xl max-[640px]:px-4 max-[640px]:pb-5 max-[640px]:pt-6 max-[640px]:shadow-[0_14px_22px_-20px_rgba(15,35,23,0.33)]">
        <div className="mb-1 grid justify-items-center gap-0.5 text-center">
          <div className="grid h-[3.2rem] w-[3.2rem] place-items-center rounded-[10px]" aria-hidden="true">
            <img src="/iconOMJ.jpg" alt="OMJ" className="h-12 w-12 rounded-sm object-cover" />
          </div>
          <p className="m-0 text-base font-medium leading-[1.35] text-[var(--primary)]">Oficina Municipal de la Juventud</p>
          <h1 className="mb-1 mt-5 text-[clamp(1.45rem,2.5vw,1.82rem)] text-[#162e23] font-bold">Crear cuenta</h1>
          <p className="m-0 max-w-[33ch] text-[0.9rem] leading-[1.5] text-[var(--text-muted)] max-[640px]:text-[0.87rem]">
            Regístrate para postular a talleres y recibir novedades de actividades.
          </p>
        </div>

        <form className="mt-0 grid gap-3" onSubmit={handleSubmit} noValidate>
          <label htmlFor="fullName" className="text-[0.82rem] font-semibold text-[#2f4438]">Nombre</label>
          <input
            className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3.5 py-3 text-[0.93rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]"
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Tu nombre"
            required
            value={formValues.fullName}
            onChange={handleChange}
          />

          <label htmlFor="lastName" className="text-[0.82rem] font-semibold text-[#2f4438]">Apellido</label>
          <input
            className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3.5 py-3 text-[0.93rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]"
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Tu apellido"
            required
            value={formValues.lastName}
            onChange={handleChange}
          />

          <label htmlFor="rut" className="text-[0.82rem] font-semibold text-[#2f4438]">RUT</label>
          <input
            className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3.5 py-3 text-[0.93rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]"
            id="rut"
            name="rut"
            type="text"
            placeholder="12345678-9"
            required
            maxLength="12"
            value={formValues.rut}
            onChange={handleChange}
            pattern="\d{7,8}-[\dkK]"
          />

          <label htmlFor="registerEmail" className="text-[0.82rem] font-semibold text-[#2f4438]">Correo electronico</label>
          <input
            className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3.5 py-3 text-[0.93rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]"
            id="registerEmail"
            name="registerEmail"
            type="email"
            placeholder="tu@correo.com"
            required
            value={formValues.registerEmail}
            onChange={handleChange}
            autoComplete="email"
          />

          <label htmlFor="phone" className="text-[0.82rem] font-semibold text-[#2f4438]">Telefono</label>
          <input
            className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3.5 py-3 text-[0.93rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]"
            id="phone"
            name="phone"
            type="text"
            placeholder="987654321"
            required
            maxLength="11"
            value={formValues.phone}
            onChange={handleChange}
            pattern="\d{8,11}"
          />

          <label htmlFor="registerPassword" className="text-[0.82rem] font-semibold text-[#2f4438]">Contrasena</label>
          <input
            className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3.5 py-3 text-[0.93rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]"
            id="registerPassword"
            name="registerPassword"
            type="password"
            placeholder="Minimo 10 caracteres"
            required
            minLength={10}
            value={formValues.registerPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
          
          {formValues.registerPassword && (
            <div className="mt-2 grid gap-2 rounded-lg bg-[#f5f7fa] p-3">
              <p className="text-[0.75rem] font-semibold text-[#2f4438]">Requisitos de contraseña:</p>
              <div className="grid gap-1.5">
                <PasswordRequirement
                  met={getPasswordStrength(formValues.registerPassword).hasMinLength}
                  text="Mínimo 10 caracteres"
                />
                <PasswordRequirement
                  met={getPasswordStrength(formValues.registerPassword).hasUpperCase}
                  text="Al menos una mayúscula"
                />
                <PasswordRequirement
                  met={getPasswordStrength(formValues.registerPassword).hasNumber}
                  text="Al menos un número"
                />
                <PasswordRequirement
                  met={getPasswordStrength(formValues.registerPassword).hasSpecialChar}
                  text="Al menos un carácter especial (!@#$%^&*)"
                />
              </div>
            </div>
          )}
          <p className="m-0 text-[0.76rem] text-[var(--text-muted)]">{getPasswordHelpText()}</p>

          <label htmlFor="confirmPassword" className="text-[0.82rem] font-semibold text-[#2f4438]">Confirmar contrasena</label>
          <input
            className="w-full rounded-[10px] border border-[#d4dae2] bg-[var(--surface)] px-3.5 py-3 text-[0.93rem] text-[var(--text)] outline-none transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[#fbfefc] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.11)]"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Repite la contrasena"
            required
            minLength={10}
            value={formValues.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />

          {error && <p className="m-0 rounded-sm border border-[#f2cbc4] bg-[#fff0ee] px-3 py-2 text-[0.84rem] font-semibold text-[#8f3526]">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full mt-2 rounded-[10px] py-3 text-[0.92rem] tracking-[0.01em]" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-4 text-center text-[0.84rem] text-[var(--text-muted)]">
          Ya tienes cuenta? <Link to="/login" className="font-semibold text-[var(--primary)] transition-colors duration-200 hover:text-[var(--primary-strong)]">Inicia sesion</Link>
        </p>
      </article>
    </section>
  );
}

function PasswordRequirement({ met, text }) {
  return (
    <div className={`flex items-center gap-2 rounded px-2.5 py-1.5 text-[0.75rem] transition-colors ${
      met 
        ? 'bg-[#e7f5ed] text-[#047857]' 
        : 'bg-[#fef2f2] text-[#991b1b]'
    }`}>
      <span className="text-sm">
        {met ? '✓' : '○'}
      </span>
      <span>{text}</span>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Icon({ name, className = "h-5 w-5" }) {
  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <path d="M7 3v3M17 3v3M4 9h16M6 6h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7m3.5 10a2.5 2.5 0 0 0 5 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 2a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.76 0-5 1.57-5 3.5A1.5 1.5 0 0 0 4.5 20h7m1.5 0H20a1.5 1.5 0 0 0 1.5-1.5C21.5 16.57 19.26 15 16.5 15H13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "music") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <path d="M9 18V6l10-2v12M9 10l10-2M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "heart") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <path d="M12 20s-7-4.6-9-8.8C1.6 8.6 3 5.6 6.1 5c2.1-.4 4 .5 5 2 1-1.5 2.9-2.4 5-2 3.1.6 4.5 3.6 3.1 6.2C19 15.4 12 20 12 20Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "download") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <path d="M12 3v11m0 0 4-4m-4 4-4-4M4 20h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "sparkles") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <path d="m12 3 1.6 3.7L17 8.3l-3.4 1.5L12 13.5l-1.6-3.7L7 8.3l3.4-1.6L12 3Zm7 9 1 2.2L22 15l-2 .8L19 18l-1-2.2-2-.8 2-.8L19 12ZM5 14l1 2.2L8 17l-2 .8L5 20l-1-2.2L2 17l2-.8L5 14Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d="M3 12h4l2-5 4 10 2-5h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = event => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;

    installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
  };

  const features = [
    {
      title: "Inscripcion a actividades",
      description:
        "Postula en pocos pasos a talleres y eventos activos en tu comuna.",
      icon: "check"
    },
    {
      title: "Calendario interactivo",
      description:
        "Visualiza fechas, horarios y cupos para organizar tu semana.",
      icon: "calendar"
    },
    {
      title: "Notificaciones",
      description:
        "Recibe recordatorios y avisos importantes en tiempo real.",
      icon: "bell"
    },
    {
      title: "Gestion de asistencia",
      description:
        "Haz seguimiento de participacion y mantente al dia con tus talleres.",
      icon: "users"
    }
  ];

  const stats = [
    { number: "500+", label: "Jovenes activos", icon: "users" },
    { number: "50+", label: "Talleres al mes", icon: "music" },
    { number: "95%", label: "Satisfaccion", icon: "heart" },
    { number: "12", label: "Estilos disponibles", icon: "sparkles" }
  ];

  const highlightedActivities = [
    {
      title: "Taller de Bellydance",
      category: "Baile",
      date: "Viernes 17:00 - 18:30",
      place: "Manso de Velasco 744",
      state: "Cupos abiertos",
      image: "https://images.unsplash.com/photo-1719634689927-58ec6baf0f0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHBlb3BsZSUyMGRhbmNlJTIwd29ya3Nob3B8ZW58MXx8fHwxNzc0NzQxMjYxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      accent: "#0a8f4a"
    },
    {
      title: "Laboratorio de Musica Urbana",
      category: "Musica",
      date: "Miercoles 16:00 - 18:00",
      place: "Centro Cultural Curico",
      state: "Ultimos cupos",
      image: "https://images.unsplash.com/photo-1684590686110-f0014d2dd0fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXAlMjBob3AlMjBkYW5jZSUyMGNsYXNzfGVufDF8fHx8MTc3NDc0MTI2MXww&ixlib=rb-4.1.0&q=80&w=1080",
      accent: "#06783b"
    },
    {
      title: "Workshop de Emprendimiento Joven",
      category: "Formacion",
      date: "Sabado 10:00 - 13:00",
      place: "Espacio OMJ",
      state: "Inscripcion activa",
      image: "https://images.unsplash.com/photo-1690267647311-eeeac21df6c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBkYW5jZSUyMHN0dWRpb3xlbnwxfHx8fDE3NzQ3NDEyNjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      accent: "#0a9a55"
    }
  ];

  return (
    <div className="overflow-hidden">
      <section className="relative overflow-hidden bg-[linear-gradient(140deg,#0f6f3c_0%,var(--primary-strong)_52%,var(--primary)_100%)]">
        <div className="absolute right-4 top-16 h-72 w-72 rounded-full bg-[rgba(255,255,255,0.1)] blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-8 left-4 h-80 w-80 rounded-full bg-[rgba(205,235,218,0.16)] blur-3xl" aria-hidden="true" />

        <div className="container relative z-10 grid items-center gap-12 py-14 lg:min-h-[88vh] lg:grid-cols-2">
          <div className="animate-[revealUp_0.7s_ease_both]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-sm">
              <Icon name="sparkles" className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">OMJ Curico</span>
            </div>

            <h1 className="text-[clamp(2.3rem,5vw,4rem)] font-bold leading-[1.08] text-white">
              Participa en actividades de <span className="text-white/90">baile</span> en tu comunidad
            </h1>

            <p className="mb-8 mt-5 max-w-[62ch] text-[1.06rem] text-white/90">
              Explora talleres, eventos y experiencias juveniles en un solo lugar.
              Registrate y comienza a bailar hoy.
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[0.98rem] font-semibold text-[var(--primary-strong)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-white/90"
              >
                Crear cuenta gratis
                <Icon name="activity" className="h-4 w-4" />
              </Link>
              <a
                href="#actividades"
                className="inline-flex items-center justify-center rounded-xl border border-white/35 bg-white/10 px-7 py-3.5 text-[0.98rem] font-semibold !text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/18 hover:!text-white"
              >
                Ver actividades
              </a>
            </div>

            {!isInstalled && installPromptEvent && (
              <div className="max-w-[620px] rounded-2xl border border-white/60 bg-white/95 p-5 shadow-[0_22px_36px_-24px_rgba(7,32,23,0.55)] backdrop-blur-md">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-[linear-gradient(135deg,var(--primary),var(--primary-strong))] text-white">
                    <Icon name="download" className="h-5 w-5" />
                  </div>
                  <div className="min-w-[220px] flex-1">
                    <h3 className="text-[1rem] font-semibold text-[#1d3127]">Instala la app</h3>
                    <p className="mt-1 text-[0.9rem] text-[#50695c]">Accede rapido a actividades y recibe notificaciones.</p>
                    <button
                      type="button"
                      className="mt-3 hover:cursor-pointer rounded-lg border border-[var(--primary)] bg-[linear-gradient(135deg,var(--primary),var(--primary-strong))] px-4 py-2 text-[0.88rem] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:border-[#067a37] hover:bg-[linear-gradient(135deg,#099c49,#067a37)]"
                      onClick={handleInstallClick}
                    >
                      Instalar ahora
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isInstalled && <p className="mt-3 max-w-[60ch] text-[0.9rem] text-white/85">La app ya esta instalada en este dispositivo.</p>}
            {!isInstalled && !installPromptEvent && (
              <p className="mt-3 max-w-[60ch] text-[0.9rem] text-white/85">
                Si no aparece el boton de descarga, abre el menu del navegador y selecciona "Instalar aplicacion".
              </p>
            )}
          </div>

          <div className="animate-[revealUp_0.9s_ease_0.08s_both]">
            <div className="relative overflow-hidden rounded-3xl border border-white/15 shadow-[0_26px_44px_-28px_rgba(8,23,16,0.68)]">
              <img
                src="https://images.unsplash.com/photo-1764072970306-fd628c08780f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxzYSUyMGRhbmNlJTIwZ3JvdXB8ZW58MXx8fHwxNzc0NzQxMjYyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Jovenes bailando"
                className="h-[460px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_20%,rgba(0,0,0,0.58)_100%)]" />

              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/55 bg-white/92 px-4 py-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--primary),var(--primary-strong))] text-white">
                    <Icon name="music" className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[0.78rem] uppercase tracking-[0.04em] text-[#60786c]">Actividad destacada</p>
                    <p className="text-[1rem] font-semibold text-[#1f3329]">Taller de Bellydance</p>
                    <p className="text-[0.78rem] font-semibold text-[var(--primary-strong)]">Cupos abiertos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map(stat => (
            <article key={stat.label} className="text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-[rgba(10,143,74,0.1)] text-[var(--primary-strong)]">
                <Icon name={stat.icon} className="h-7 w-7" />
              </div>
              <p className="text-4xl font-bold text-[var(--primary-strong)]">{stat.number}</p>
              <p className="mt-1 text-[0.92rem] font-medium text-[#64786d]">{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f7faf8] py-16" id="funcionalidades">
        <div className="container">
          <header className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[rgba(10,143,74,0.12)] px-4 py-2">
              <Icon name="sparkles" className="h-4 w-4 text-[var(--primary-strong)]" />
              <span className="text-[0.82rem] font-semibold text-[var(--primary-strong)]">Funcionalidades</span>
            </div>
            <h2 className="text-[clamp(1.85rem,3vw,2.35rem)] font-bold text-[#1a2f25]">Todo lo necesario para gestionar tu participacion</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[1rem] text-[#64786d]">Una plataforma completa para que tu experiencia sea simple, clara y efectiva.</p>
          </header>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map(feature => (
              <article key={feature.title} className="group relative overflow-hidden rounded-3xl border border-[#d2dfd8] bg-white p-6 shadow-[0_18px_34px_-28px_rgba(10,35,25,0.4)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_40px_-28px_rgba(10,35,25,0.48)]">
                <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-3xl bg-[rgba(10,143,74,0.08)]" aria-hidden="true" />
                <div className="mb-5 inline-grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--primary-strong))] text-white shadow-[0_12px_22px_-16px_rgba(6,78,41,0.52)]">
                  <Icon name={feature.icon} className="h-7 w-7" />
                </div>
                <h3 className="text-[1.14rem] font-bold text-[#1c3127]">{feature.title}</h3>
                <p className="mt-2.5 leading-relaxed text-[#61766a]">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16" id="actividades">
        <div className="container">
          <header className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[rgba(10,143,74,0.12)] px-4 py-2">
              <Icon name="music" className="h-4 w-4 text-[var(--primary-strong)]" />
              <span className="text-[0.82rem] font-semibold text-[var(--primary-strong)]">Actividades destacadas</span>
            </div>
            <h2 className="text-[clamp(1.85rem,3vw,2.35rem)] font-bold text-[#1a2f25]">Conoce lo que viene esta semana</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[1rem] text-[#64786d]">Talleres para distintos niveles y estilos, en espacios de Curico.</p>
          </header>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {highlightedActivities.map(activity => (
              <article key={activity.title} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#d2dfd8] bg-white shadow-[0_18px_34px_-28px_rgba(10,35,25,0.4)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_40px_-28px_rgba(10,35,25,0.5)]">
                <div className="relative h-56 overflow-hidden">
                  <img src={activity.image} alt={activity.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.62))]" />

                  <div className="absolute left-4 top-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[0.74rem] font-semibold text-[#22362b] backdrop-blur-sm">
                      <Icon name="music" className="h-3.5 w-3.5" />
                      {activity.category}
                    </span>
                  </div>

                  <div className="absolute right-4 top-4">
                    <span className="inline-flex rounded-full px-3 py-1 text-[0.72rem] font-bold text-white" style={{ backgroundColor: activity.accent }}>
                      {activity.state}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="min-h-[3.6rem] text-[1.14rem] font-bold leading-tight text-[#1c3127]">{activity.title}</h3>
                  <div className="mb-5 mt-3 space-y-2">
                    <p className="flex items-center gap-2 text-[0.89rem] font-semibold text-[#406354]">
                      <Icon name="calendar" className="h-4 w-4 text-[var(--primary-strong)]" />
                      {activity.date}
                    </p>
                    <p className="flex items-center gap-2 text-[0.89rem] text-[#63796d]">
                      <Icon name="users" className="h-4 w-4 text-[var(--primary)]" />
                      {activity.place}
                    </p>
                  </div>

                  <button type="button" className="mt-auto w-full rounded-xl bg-[linear-gradient(90deg,var(--primary),var(--primary-strong))] px-4 py-3 text-[0.9rem] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_12px_20px_-16px_rgba(6,78,41,0.62)]">
                    Ver detalle
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[#dbe8e0] bg-[linear-gradient(135deg,#f4f9f6_0%,#e8f3ec_100%)] py-16">
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[rgba(10,143,74,0.08)] blur-3xl" aria-hidden="true" />

        <div className="container relative z-10 text-center">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#173326]">Listo para comenzar a bailar?</h2>
          <p className="mx-auto mt-4 max-w-3xl text-[1.08rem] text-[#4f6b5d]">
            Unete a cientos de jovenes que ya estan participando en actividades de baile en Curico.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-7 py-3.5 text-[0.98rem] font-bold !text-white transition-colors hover:bg-[var(--primary-strong)] hover:!text-white">
              Crear cuenta gratis
              <Icon name="activity" className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center rounded-xl border border-[#b8d8c5] bg-white px-7 py-3.5 text-[0.98rem] font-bold text-[#1f3b2d] transition-colors hover:bg-[#f2f8f4]">
              Iniciar sesion
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#14271f] py-10 text-white">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--primary-strong),var(--primary))]">
                  <Icon name="sparkles" className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">OMJ Curico</span>
              </div>
              <p className="text-[0.9rem] text-[#a9bab0]">Oficina Municipal de la Juventud</p>
            </div>

            <div className="flex gap-7">
              <a href="#funcionalidades" className="text-[#adc0b5] transition-colors hover:text-white">Funcionalidades</a>
              <a href="#actividades" className="text-[#adc0b5] transition-colors hover:text-white">Actividades</a>
              <Link to="/login" className="text-[#adc0b5] transition-colors hover:text-white">Iniciar sesion</Link>
            </div>
          </div>

          <div className="mt-7 border-t border-[#2d473a] pt-7 text-center text-[0.82rem] text-[#98ada1]">
            <p>© 2026 Oficina Municipal de la Juventud de Curico. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
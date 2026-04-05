import React, { useEffect, useState } from "react";
import { Activity, Bell, CalendarDays, Download, Heart, Music2, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import ActivityCard from "../components/ActivityCard";

function Icon({ name, className = "h-5 w-5" }) {
  if (name === "calendar") {
    return <CalendarDays className={className} aria-hidden="true" focusable="false" strokeWidth={1.8} />;
  }

  if (name === "bell") {
    return <Bell className={className} aria-hidden="true" focusable="false" strokeWidth={1.8} />;
  }

  if (name === "users") {
    return <Users className={className} aria-hidden="true" focusable="false" strokeWidth={1.8} />;
  }

  if (name === "music") {
    return <Music2 className={className} aria-hidden="true" focusable="false" strokeWidth={1.8} />;
  }

  if (name === "heart") {
    return <Heart className={className} aria-hidden="true" focusable="false" strokeWidth={1.8} />;
  }

  if (name === "download") {
    return <Download className={className} aria-hidden="true" focusable="false" strokeWidth={1.8} />;
  }

  if (name === "sparkles") {
    return <Sparkles className={className} aria-hidden="true" focusable="false" strokeWidth={1.8} />;
  }

  return <Activity className={className} aria-hidden="true" focusable="false" strokeWidth={1.8} />;
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
      date: "2026-04-03",
      time: "17:00 - 18:30",
      place: "Manso de Velasco 744",
      state: "Cupos abiertos",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1080&q=80"
    },
    {
      title: "Laboratorio de Musica Urbana",
      category: "Musica",
      date: "2026-04-08",
      time: "16:00 - 18:00",
      place: "Centro Cultural Curico",
      state: "Ultimos cupos",
      image: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&w=1080&q=80"
    },
    {
      title: "Workshop de Emprendimiento Joven",
      category: "Formacion",
      date: "2026-04-11",
      time: "10:00 - 13:00",
      place: "Espacio OMJ",
      state: "Inscripcion activa",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1080&q=80"
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

      <section className="bg-[var(--bg-neutral)] py-16" id="funcionalidades">
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

          <div className="space-y-3.5">
            {highlightedActivities.map(activity => (
              <ActivityCard key={activity.title} activity={activity} actionLabel="Ver detalle" />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[#dbe8e0] bg-[linear-gradient(135deg,#f4f9f6_0%,#e8f3ec_100%)] py-16">
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[rgba(10,143,74,0.08)] blur-3xl" aria-hidden="true" />

        <div className="container relative z-10 text-center">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#173326]">Listo para comenzar?</h2>
          <p className="mx-auto mt-4 max-w-3xl text-[1.08rem] text-[#4f6b5d]">
            Unete a cientos de jovenes que ya estan participando en actividades de la OMJ Curicó.
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
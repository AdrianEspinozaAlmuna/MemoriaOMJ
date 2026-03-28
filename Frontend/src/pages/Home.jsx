import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
      icon: "IA"
    },
    {
      title: "Calendario interactivo",
      description:
        "Visualiza fechas, horarios y cupos para organizar tu semana.",
      icon: "CI"
    },
    {
      title: "Notificaciones",
      description:
        "Recibe recordatorios y avisos importantes en tiempo real.",
      icon: "NT"
    },
    {
      title: "Gestion de asistencia",
      description:
        "Haz seguimiento de participacion y mantente al dia con tus talleres.",
      icon: "GA"
    }
  ];

  const highlightedActivities = [
    {
      title: "Taller de Bellydance",
      date: "Viernes 17:00 - 18:30",
      place: "Manso de Velasco 744"
    },
    {
      title: "Laboratorio de Musica Urbana",
      date: "Miercoles 16:00 - 18:00",
      place: "Centro Cultural Curico"
    },
    {
      title: "Workshop de Emprendimiento Joven",
      date: "Sabado 10:00 - 13:00",
      place: "Espacio OMJ"
    }
  ];

  return (
    <div className="pb-8">
      <section className="container grid items-center gap-9 py-9 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="animate-[revealUp_0.7s_ease_both]">
          <p className="eyebrow">OMJ Curico</p>
          <h1 className="mt-2 text-[clamp(1.95rem,3.8vw,3.2rem)] leading-[1.1]">Participa en actividades de tu comunidad</h1>
          <p className="mt-4 max-w-[58ch] text-[var(--text-muted)]">
            Explora talleres, eventos y experiencias juveniles en un solo lugar.
            Registra tu cuenta y comienza a participar hoy.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 max-[640px]:[&>.btn]:flex-1 max-[640px]:[&>.btn]:text-center">
            <a className="btn btn-primary" href="#actividades">
              Ver actividades
            </a>
            <Link className="btn btn-ghost" to="/register">
              Crear cuenta
            </Link>
            {!isInstalled && installPromptEvent && (
              <button type="button" className="btn bg-[linear-gradient(135deg,#0b7d44,#085c31)] text-[var(--surface)] shadow-[var(--shadow)] transition-all duration-200 hover:bg-[linear-gradient(135deg,#085c31,#0b7d44)]" onClick={handleInstallClick}>
                Descargar app
              </button>
            )}
          </div>
          {isInstalled && <p className="mt-3 max-w-[60ch] text-[0.9rem] text-[var(--text-muted)]">La app ya esta instalada en este dispositivo.</p>}
          {!isInstalled && !installPromptEvent && (
            <p className="mt-3 max-w-[60ch] text-[0.9rem] text-[var(--text-muted)]">
              Si no aparece el boton de descarga, abre el menu del navegador y selecciona "Instalar
              aplicacion".
            </p>
          )}
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[linear-gradient(145deg,#e4f5ea_0%,#cbebd8_100%)] shadow-[var(--shadow)] animate-[revealUp_0.9s_ease_0.08s_both] max-[980px]:min-h-[260px]" aria-hidden="true">
          <div className="absolute -left-5 -top-7 h-[170px] w-[170px] rounded-full bg-[rgba(15,143,78,0.25)] blur-[0.4px]" />
          <div className="absolute -bottom-8 -right-6 h-[210px] w-[210px] rounded-full bg-[rgba(242,215,66,0.24)] blur-[0.4px]" />
          <div className="absolute bottom-5 left-5 right-5 rounded-[var(--radius-md)] border border-[rgba(199,223,208,0.95)] bg-[rgba(255,255,255,0.85)] px-4 py-4 backdrop-blur-[5px]">
            <p className="m-0 text-[0.78rem] uppercase tracking-[0.06em] text-[var(--text-muted)]">Actividad destacada</p>
            <h3 className="my-2 text-[1.2rem]">Taller de Bellydance</h3>
            <span className="font-bold text-[var(--primary-strong)]">Cupos abiertos</span>
          </div>
        </div>
      </section>

      <section className="container py-6" id="funcionalidades">
        <div className="mb-4">
          <p className="eyebrow">Funcionalidades</p>
          <h2 className="mt-2 text-[clamp(1.45rem,2.6vw,2rem)]">Todo lo necesario para gestionar tu participacion</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {features.map(feature => (
            <article key={feature.title} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
              <div className="mb-3 inline-grid h-[2.3rem] w-[2.3rem] place-items-center rounded-[11px] bg-[linear-gradient(135deg,var(--primary),var(--primary-strong))] text-[0.77rem] font-extrabold text-[var(--surface)]" aria-hidden="true">
                {feature.icon}
              </div>
              <h3 className="m-0 text-[1.06rem]">{feature.title}</h3>
              <p className="mt-2 text-[var(--text-muted)]">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container py-6" id="actividades">
        <div className="mb-4">
          <p className="eyebrow">Actividades destacadas</p>
          <h2 className="mt-2 text-[clamp(1.45rem,2.6vw,2rem)]">Conoce lo que viene esta semana</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {highlightedActivities.map(activity => (
            <article key={activity.title} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
              <h3 className="m-0 text-[1.06rem]">{activity.title}</h3>
              <p className="mt-2 font-semibold text-[var(--text-muted)]">{activity.date}</p>
              <p className="mb-4 mt-2 text-[var(--text-muted)]">{activity.place}</p>
              <button type="button" className="btn btn-ghost btn-inline">
                Ver mas
              </button>
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-8 border-t border-[rgba(199,223,208,0.8)] pb-6 pt-4">
        <div className="container flex items-center justify-between gap-4 max-[640px]:items-start max-[640px]:flex-col">
          <p className="m-0 text-[var(--text-muted)]">Plataforma OMJ Curico</p>
          <div className="inline-flex gap-4">
            <a href="#funcionalidades" className="font-bold text-[var(--primary-strong)]">Funcionalidades</a>
            <a href="#actividades" className="font-bold text-[var(--primary-strong)]">Actividades</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
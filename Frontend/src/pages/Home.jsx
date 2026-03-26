import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

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
    <div className="landing">
      <section className="hero container">
        <div className="hero-content reveal-up">
          <p className="eyebrow">OMJ Curico</p>
          <h1>Participa en actividades de tu comunidad</h1>
          <p className="hero-copy">
            Explora talleres, eventos y experiencias juveniles en un solo lugar.
            Registra tu cuenta y comienza a participar hoy.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#actividades">
              Ver actividades
            </a>
            <Link className="btn btn-ghost" to="/register">
              Crear cuenta
            </Link>
            {!isInstalled && installPromptEvent && (
              <button type="button" className="btn btn-install" onClick={handleInstallClick}>
                Descargar app
              </button>
            )}
          </div>
          {isInstalled && <p className="install-note">La app ya esta instalada en este dispositivo.</p>}
          {!isInstalled && !installPromptEvent && (
            <p className="install-note">
              Si no aparece el boton de descarga, abre el menu del navegador y selecciona "Instalar
              aplicacion".
            </p>
          )}
        </div>
        <div className="hero-visual reveal-up-delay" aria-hidden="true">
          <div className="hero-orb hero-orb-a" />
          <div className="hero-orb hero-orb-b" />
          <div className="hero-card">
            <p>Actividad destacada</p>
            <h3>Taller de Bellydance</h3>
            <span>Cupos abiertos</span>
          </div>
        </div>
      </section>

      <section className="features container" id="funcionalidades">
        <div className="section-heading">
          <p className="eyebrow">Funcionalidades</p>
          <h2>Todo lo necesario para gestionar tu participacion</h2>
        </div>
        <div className="feature-grid">
          {features.map(feature => (
            <article key={feature.title} className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="activities container" id="actividades">
        <div className="section-heading">
          <p className="eyebrow">Actividades destacadas</p>
          <h2>Conoce lo que viene esta semana</h2>
        </div>
        <div className="activity-grid">
          {highlightedActivities.map(activity => (
            <article key={activity.title} className="activity-card">
              <h3>{activity.title}</h3>
              <p className="activity-date">{activity.date}</p>
              <p className="activity-place">{activity.place}</p>
              <button type="button" className="btn btn-ghost btn-inline">
                Ver mas
              </button>
            </article>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container footer-row">
          <p>Plataforma OMJ Curico</p>
          <div className="footer-links">
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#actividades">Actividades</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
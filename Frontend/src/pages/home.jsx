import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { requestNotificationPermissionAndGetToken } from "../services/firebase";

// ─── ICONS (outline, 1.6 stroke — matches dashboard) ──────────────────────
const Icon = ({ d, size = 20, stroke = 1.6, fill = 'none', className = '' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

const I = {
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></>,
  users:    <><circle cx="9" cy="9" r="3.2"/><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17" cy="8" r="2.5"/><path d="M15 19c0-2.3 1.5-4 4-4"/></>,
  chat:     <><path d="M4 6.5C4 5.7 4.7 5 5.5 5h13c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5H10l-4 3v-3H5.5C4.7 17 4 16.3 4 15.5z"/><path d="M8 10h8M8 13h5"/></>,
  star:     <><path d="m12 3.5 2.7 5.5 6 .9-4.4 4.2 1 6L12 17.3 6.6 20.1l1-6L3.3 9.9l6-.9z"/></>,
  bell:     <><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></>,
  layout:   <><rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M3.5 9.5h17M9.5 9.5v11"/></>,
  check:    'M5 12.5l4 4 10-10',
  x:        'M6 6l12 12M18 6L6 18',
  arrow:    'M5 12h14M13 6l6 6-6 6',
  arrowL:   'M19 12H5M11 6l-6 6 6 6',
  bolt:     <><path d="M13 3 4 14h7l-1 7 9-11h-7z"/></>,
  shield:   <><path d="M12 3.5 4 6v6c0 4.5 3.5 7.5 8 9 4.5-1.5 8-4.5 8-9V6z"/></>,
  spark:    <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8"/></>,
  pin:      <><path d="M12 21s7-7.3 7-12a7 7 0 1 0-14 0c0 4.7 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></>,
  clock:    <><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></>,
  trend:    <><path d="M3 17l6-6 4 4 8-9"/><path d="M14 6h7v7"/></>,
  download: <><path d="M12 4v11M6 11l6 6 6-6M5 20h14"/></>,
  grid:     <><rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/></>,
  filter:   <><path d="M4 5h16M7 12h10M10 19h4"/></>,
  search:   <><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/></>,
  send:     <><path d="M21 3 3 11l7 3 3 7z"/><path d="M21 3 10 14"/></>,
  globe:    <><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 4 5.5 4 8.5s-1.5 6-4 8.5c-2.5-2.5-4-5.5-4-8.5s1.5-6 4-8.5z"/></>,
  phone:    <><rect x="6.5" y="2.5" width="11" height="19" rx="2"/><path d="M11 18.5h2"/></>,
  award:    <><circle cx="12" cy="9" r="5.5"/><path d="M8 13l-2 8 6-3 6 3-2-8"/></>,
  lock:     <><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
  refresh:  <><path d="M4 12a8 8 0 0 1 14-5l2 2"/><path d="M20 12a8 8 0 0 1-14 5l-2-2"/><path d="M20 4v5h-5M4 20v-5h5"/></>,
  flag:     <><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></>,
};

// ─── BRAND MARK (shield + leaf) ────────────────────────────────────────────
const BrandMark = ({ size = 32 }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} aria-label="OMJ Curicó">
    <path d="M20 3 L34 7 V19 C34 28 28 34 20 37 C12 34 6 28 6 19 V7 Z"
          fill="var(--pjc-primary)" />
    <path d="M14 22 C14 16 19 12 26 12 C26 19 22 24 14 24 Z M14 24 C14 24 16 21 19 19"
          fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── SECTION SHELL ─────────────────────────────────────────────────────────
const Eyebrow = ({ children }) => (
  <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--pjc-primary)]">
    {children}
  </div>
);


// ──────────────────────────────────────────────────────────────────────────
// HERO
// ──────────────────────────────────────────────────────────────────────────
const Hero = ({ onInstallClick }) => {
  const stats = [
    { v: 'Calendario', l: 'actividades y cupos' },
    { v: 'Actividades', l: 'chat, asistencia y valoración' },
    { v: 'Grupos', l: 'coordinación y roles' },
    { v: 'Avisos', l: 'notificaciones y cambios' },
  ];
  return (
    <section className="relative bg-white overflow-hidden">
      {/* subtle dotted backdrop */}
      <div aria-hidden className="absolute inset-0 opacity-[0.4] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(circle, #d4d4d8 1px, transparent 1px)', backgroundSize: '22px 22px', maskImage: 'linear-gradient(to bottom, black 30%, transparent 90%)' }} />
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-14 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* copy */}
          <div className="lg:col-span-7">
            <h1 className="mt-5 text-[44px] sm:text-[56px] lg:text-[68px] leading-[1.02] tracking-[-0.025em] font-semibold text-[var(--pjc-ink)]">
              Donde lo que pasa<br/>en la ciudad<br/>
              <span className="relative inline-block">
                <span className="relative z-10 text-[var(--pjc-primary)]">te incluye a ti.</span>
                <span aria-hidden className="absolute left-0 right-0 bottom-1.5 h-3 bg-[var(--pjc-primary-100)] -z-0"/>
              </span>
            </h1>
            <p className="mt-6 text-[17px] sm:text-[18px] leading-relaxed text-[var(--pjc-muted)] max-w-[560px]">
              Revisa el calendario, inscríbete en actividades, sigue tus grupos y consulta notificaciones, asistencia y valoraciones desde el mismo sistema.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-white">
              <Link to="/register" className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--pjc-primary)] text-white rounded-sm font-medium hover:bg-[var(--pjc-primary-700)] transition shadow-[0_1px_0_rgba(0,0,0,0.06)]">
                Crear mi cuenta gratis
                <Icon d={I.arrow} size={18}/>
              </Link>
              <button 
                onClick={onInstallClick}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-[var(--primary-soft)] text-[var(--primary)] rounded-sm font-medium hover:border-[var(--primary)] hover:bg-[var(--gray)] transition disabled:cursor-not-allowed disabled:opacity-60">
                <Icon d={I.download} size={18}/> Instalar app PWA
              </button>
            </div>
            <div className="mt-7 flex items-center gap-4 text-[13px] text-[var(--pjc-muted)]">
              <div className="flex -space-x-2">
                {['#dcfce7','#bbf7d0','#86efac','#4ade80'].map((c,i)=>(
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white" style={{background:c}}/>
                ))}
              </div>
              <span>Calendario, grupos y avisos en una sola cuenta</span>
            </div>
          </div>

          {/* visual: floating activity card */}
          <div className="lg:col-span-5 relative">
            <HeroVisual />
          </div>
        </div>

        {/* stats strip */}
        <div className="mt-16 lg:mt-24 grid grid-cols-2 lg:grid-cols-4 border border-zinc-200 rounded-sm bg-white">
          {stats.map((s, i) => (
            <div key={i} className={`p-5 sm:p-6 ${i < 3 ? 'lg:border-r' : ''} ${i < 2 ? 'border-b lg:border-b-0' : ''} ${i % 2 === 0 ? 'border-r lg:border-r' : ''} border-zinc-200`}>
              <div className="text-[28px] sm:text-[34px] font-semibold tracking-tight text-[var(--pjc-ink)]">{s.v}</div>
              <div className="mt-1 text-[13px] text-[var(--pjc-muted)]">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HeroVisual = () => (
  <div className="relative h-[520px] lg:h-[560px]">
    {/* phone mock */}
    <div className="absolute right-0 top-0 w-[300px] h-[560px] rounded-[36px] bg-[var(--pjc-ink)] p-2 shadow-[0_30px_60px_-20px_rgba(31,51,40,0.35)]">
      <div className="w-full h-full bg-[#f3f4f6] rounded-[28px] overflow-hidden relative">
        <div className="h-9 flex items-center justify-between px-5 text-[10px] font-semibold text-[var(--pjc-ink)]">
          <span>9:41</span>
          <span className="flex gap-1 items-center">
            <span className="w-1 h-1 rounded-full bg-[var(--pjc-ink)]"/>
            <span className="w-1 h-1 rounded-full bg-[var(--pjc-ink)]"/>
            <span className="w-1 h-1 rounded-full bg-[var(--pjc-ink)]"/>
          </span>
        </div>
        <div className="px-4">
          <div className="text-[10px] tracking-[0.18em] font-semibold text-[var(--pjc-primary)]">HOY · 8 MAYO</div>
          <div className="text-[20px] font-semibold tracking-tight text-[var(--pjc-ink)] mt-0.5">Tus actividades</div>
        </div>
        <div className="px-4 mt-3 space-y-2">
          {[
            { t:'Taller de muralismo', l:'Casa de la Cultura', h:'17:00', s:'Programada', sc:'green' },
            { t:'Liga de fútbol joven', l:'Estadio La Granja', h:'19:30', s:'En curso', sc:'blue' },
            { t:'Voluntariado río Guaiquillo', l:'Parque Aguas Negras', h:'Sáb 10:00', s:'Pendiente', sc:'amber' },
          ].map((a,i)=>(
            <div key={i} className="bg-white rounded-sm border border-zinc-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13px] font-semibold text-[var(--pjc-ink)] leading-tight">{a.t}</div>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                  a.sc==='green' ? 'bg-[var(--pjc-primary-50)] text-[var(--pjc-primary-800)] border border-[var(--pjc-primary-200)]' :
                  a.sc==='blue'  ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                   'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>{a.s}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2.5 text-[10.5px] text-[var(--pjc-muted)]">
                <span className="flex items-center gap-1"><Icon d={I.clock} size={11}/>{a.h}</span>
                <span className="flex items-center gap-1"><Icon d={I.pin} size={11}/>{a.l}</span>
              </div>
            </div>
          ))}
        </div>
        {/* floating notification */}
        <div className="absolute left-3 right-3 bottom-20 bg-[var(--pjc-ink)] text-white rounded-sm p-3 shadow-lg flex items-start gap-2.5">
          <div className="mt-0.5"><Icon d={I.bell} size={14} className="text-[var(--pjc-primary-300)]"/></div>
          <div className="flex-1">
            <div className="text-[11px] font-semibold">Actividad confirmada</div>
            <div className="text-[10px] text-zinc-300 mt-0.5">Tu inscripción a "Taller de muralismo" fue aceptada.</div>
          </div>
        </div>
        {/* tab bar */}
        <div className="absolute left-0 right-0 bottom-0 h-14 bg-white border-t border-zinc-200 flex items-center justify-around">
          {[I.layout, I.calendar, I.users, I.bell].map((d,i)=>(
            <div key={i} className={i===1 ? 'text-[var(--pjc-primary)]' : 'text-zinc-400'}>
              <Icon d={d} size={20} />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* floating stat card */}
    <div className="hidden sm:block absolute left-0 top-12 w-[230px] bg-white rounded-sm border border-zinc-200 p-4 shadow-[0_12px_30px_-12px_rgba(31,51,40,0.2)]">
      <div className="flex items-center justify-between">
        <div className="text-[11px] tracking-[0.16em] font-semibold uppercase text-[var(--pjc-muted)]">Mis asistencias</div>
        <Icon d={I.trend} size={14} className="text-[var(--pjc-primary)]"/>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <div className="text-[36px] font-semibold tracking-tight text-[var(--pjc-ink)] leading-none">94<span className="text-[20px] text-[var(--pjc-primary)]">%</span></div>
        <div className="pb-1.5 text-[11px] text-[var(--pjc-muted)]">este mes</div>
      </div>
      {/* mini bar chart */}
      <div className="mt-3 flex items-end gap-1 h-12">
        {[40,55,38,72,58,80,94].map((h,i)=>(
          <div key={i} className="flex-1 rounded-sm" style={{
            height: `${h}%`,
            background: i === 6 ? 'var(--pjc-primary)' : 'var(--pjc-primary-100)'
          }}/>
        ))}
      </div>
    </div>

    {/* floating group card */}
    <div className="hidden sm:flex absolute left-6 bottom-6 w-[260px] bg-white rounded-sm border border-zinc-200 p-3.5 items-center gap-3 shadow-[0_12px_30px_-12px_rgba(31,51,40,0.2)]">
      <div className="w-10 h-10 rounded-sm bg-[var(--pjc-primary)] flex items-center justify-center text-white">
        <Icon d={I.users} size={18}/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-[var(--pjc-ink)] truncate">Colectivo Maule Joven</div>
        <div className="text-[11px] text-[var(--pjc-muted)]">3 mensajes nuevos · 18 miembros</div>
      </div>
      <div className="w-2 h-2 rounded-full bg-[var(--pjc-primary)]"/>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────────────────
// FEATURES
// ──────────────────────────────────────────────────────────────────────────
const Features = () => {
  const items = [
    {
      icon: I.calendar,
      tag: 'Actividades',
      title: 'Calendario y cupos siempre visibles',
      body: 'Filtra por categoría, fecha o sala y abre el detalle de cada actividad para revisar la información disponible antes de inscribirte.',
      bullets: ['Calendario mensual', 'Cupos actualizados', 'Detalle de actividad'],
    },
    {
      icon: I.users,
      tag: 'Grupos',
      title: 'Grupos y colectivos en un mismo espacio',
      body: 'Organiza o sigue grupos vinculados a las actividades, con roles definidos y acceso al seguimiento desde el panel correspondiente.',
      bullets: ['Roles de coordinador y miembro', 'Actividades asociadas', 'Gestión centralizada'],
    },
    {
      icon: I.chat,
      tag: 'Chat',
      title: 'Chat por actividad',
      body: 'Cada actividad puede mostrar mensajes y seguimiento directo para coordinar dudas o información relacionada sin salir del detalle.',
      bullets: ['Hilos por actividad', 'Mensajes en contexto', 'Seguimiento de avisos'],
    },
    {
      icon: I.star,
      tag: 'Asistencia & Ratings',
      title: 'Asistencia y valoración de actividades',
      body: 'Revisa tu participación, marca asistencia cuando corresponda y deja una valoración desde el detalle de cada actividad.',
      bullets: ['Registro de asistencia', 'Valoración de 1 a 5', 'Historial de participación'],
    },
  ];
  return (
    <section id="caracteristicas" className="py-24 lg:py-32 bg-[var(--pjc-bg)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8 mb-14">
          <div className="lg:col-span-5">
            <Eyebrow>Lo que hace la plataforma</Eyebrow>
            <h2 className="mt-3 text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.02em] font-semibold text-[var(--pjc-ink)]">
              Todo lo que necesitas para participar, en un solo lugar.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 self-end">
            <p className="text-[16px] leading-relaxed text-[var(--pjc-muted)]">
              Diseñada para centralizar calendario, inscripción, grupos, notificaciones y seguimiento de actividades en un solo sistema.
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((it, i) => (
            <article key={i} className="group bg-white border border-zinc-200 rounded-sm p-7 lg:p-8 hover:border-[var(--pjc-primary-300)] hover:shadow-[0_8px_28px_-12px_rgba(5,166,61,0.18)] transition">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-sm bg-[var(--pjc-primary-50)] text-[var(--pjc-primary)] border border-[var(--pjc-primary-200)] flex items-center justify-center">
                  <Icon d={it.icon} size={20}/>
                </div>
                <span className="text-[11px] tracking-[0.18em] font-semibold uppercase text-[var(--pjc-primary)]">{it.tag}</span>
              </div>
              <h3 className="mt-6 text-[22px] font-semibold tracking-tight text-[var(--pjc-ink)] leading-snug">{it.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--pjc-muted)]">{it.body}</p>
              <ul className="mt-5 pt-5 border-t border-zinc-100 space-y-2.5">
                {it.bullets.map((b, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-[13.5px] text-[var(--pjc-ink)]">
                    <span className="w-4 h-4 rounded-full bg-[var(--pjc-primary)] flex items-center justify-center text-white">
                      <Icon d={I.check} size={10} stroke={2.5}/>
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* secondary feature row */}
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="bg-[var(--pjc-ink)] text-white rounded-sm p-7 lg:p-8 flex items-center gap-5">
            <div className="w-12 h-12 rounded-sm bg-[var(--pjc-primary)] flex items-center justify-center shrink-0">
              <Icon d={I.bell} size={20}/>
            </div>
            <div>
              <div className="text-[11px] tracking-[0.18em] font-semibold uppercase text-[var(--pjc-primary-300)]">Notificaciones contextuales</div>
              <div className="mt-1 text-[16px] leading-snug text-zinc-100">Avisos de aprobaciones, cambios de actividad y mensajes del sistema en tu bandeja.</div>
            </div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-sm p-7 lg:p-8 flex items-center gap-5">
            <div className="w-12 h-12 rounded-sm bg-[var(--pjc-primary-50)] border border-[var(--pjc-primary-200)] text-[var(--pjc-primary)] flex items-center justify-center shrink-0">
              <Icon d={I.layout} size={20}/>
            </div>
            <div>
              <div className="text-[11px] tracking-[0.18em] font-semibold uppercase text-[var(--pjc-primary)]">Dashboard personal</div>
              <div className="mt-1 text-[16px] leading-snug text-[var(--pjc-ink)]">Tu historial de participación, calendario, grupos y notificaciones siempre a la vista.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// HOW IT WORKS — TIMELINE
// ──────────────────────────────────────────────────────────────────────────
const HowItWorks = () => {
  const steps = [
    { n:'01', t:'Crea tu cuenta',   d:'Regístrate con correo o RUT y completa tu perfil según tu rol.', i: I.shield },
    { n:'02', t:'Explora el calendario', d:'Revisa actividades disponibles, filtra por fecha o categoría y abre su detalle.', i: I.calendar },
    { n:'03', t:'Inscríbete o propone', d:'Inscríbete a una actividad o crea una nueva si tu rol lo permite.', i: I.spark },
    { n:'04', t:'Participa y da seguimiento',  d:'Consulta mensajes, asistencia y estado de la actividad desde su detalle.', i: I.users },
    { n:'05', t:'Revisa tu historial',   d:'Vuelve a ver asistencias, valoraciones y notificaciones relacionadas con tu actividad.', i: I.award },
  ];

  return (
    <section id="como-funciona" className="py-24 lg:py-32 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <Eyebrow>Cómo funciona</Eyebrow>
          <h2 className="mt-3 text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.02em] font-semibold text-[var(--pjc-ink)]">
            De crear cuenta a participar, en menos de 5 minutos.
          </h2>
        </div>

        <ol className="mt-14 relative">
          {/* center line on desktop */}
          <div aria-hidden className="hidden lg:block absolute left-[7.5%] right-[7.5%] top-[42px] h-px bg-zinc-200"/>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-4">
            {steps.map((s, i) => (
              <li key={i} className="relative">
                <div className="flex lg:flex-col items-start lg:items-center gap-4 lg:gap-0">
                  <div className="relative shrink-0">
                    <div className="w-[60px] h-[60px] rounded-sm bg-white border-2 border-[var(--pjc-primary)] flex items-center justify-center text-[var(--pjc-primary)] relative z-10">
                      <Icon d={s.i} size={22}/>
                    </div>
                    <span className="absolute -top-2 -right-2 z-20 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--pjc-ink)] text-white tracking-widest">{s.n}</span>
                  </div>
                  <div className="lg:mt-5 lg:text-center lg:px-2">
                    <h4 className="text-[16px] font-semibold text-[var(--pjc-ink)] tracking-tight">{s.t}</h4>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--pjc-muted)]">{s.d}</p>
                  </div>
                </div>
              </li>
            ))}
          </div>
        </ol>
      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// FINAL CTA
// ──────────────────────────────────────────────────────────────────────────
const FinalCTA = () => (
  <section id="registro" className="relative py-24 lg:py-32 bg-[var(--pjc-ink)] text-white overflow-hidden">
    <div aria-hidden className="absolute inset-0 opacity-[0.06]"
         style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
    {/* big leaf accent */}
    <div aria-hidden className="absolute -right-20 -top-20 opacity-10">
      <BrandMark size={420}/>
    </div>

    <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--pjc-primary)]/15 border border-[var(--pjc-primary)]/30 rounded-full text-[12px] font-medium text-[var(--pjc-primary-300)]">
            <Icon d={I.flag} size={12}/> Plataforma oficial OMJ Curicó
          </div>
          <h2 className="mt-5 text-[40px] sm:text-[52px] lg:text-[60px] leading-[1.05] tracking-[-0.025em] font-semibold">
            Tu próxima<br/>actividad ya está<br/>
            <span className="text-[var(--pjc-primary-300)]">esperando.</span>
          </h2>
          <p className="mt-6 text-[17px] text-zinc-300 max-w-[520px]">
            Crea tu cuenta gratuita en menos de un minuto. Desde ahí puedes revisar actividades, grupos, notificaciones y tu historial de participación.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--pjc-primary)] text-white rounded-sm font-medium hover:bg-[var(--pjc-primary-700)] transition">
              Crear mi cuenta <Icon d={I.arrow} size={18}/>
            </Link>
            <a href="/login" className="inline-flex items-center gap-2 px-5 py-3 border-2 border-white/25 text-white rounded-sm font-medium hover:bg-white/10 transition">
              Ya tengo cuenta
            </a>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-zinc-300">
            {['Gratis para residentes', 'Sin tarjeta de crédito', 'PWA — sin descargas'].map(t=>(
              <li key={t} className="flex items-center gap-1.5"><Icon d={I.check} size={14} stroke={2} className="text-[var(--pjc-primary-300)]"/>{t}</li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <form onSubmit={e=>e.preventDefault()} className="bg-white text-[var(--pjc-ink)] rounded-sm p-6 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.4)]">
            <div className="text-[10.5px] tracking-[0.16em] uppercase font-semibold text-[var(--pjc-primary)]">Acceso rápido</div>
            <div className="mt-1 text-[20px] font-semibold tracking-tight">Comencemos.</div>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-[12px] font-medium">Nombre completo</span>
                <input type="text" defaultValue="" placeholder="Daniela Castro"
                       className="mt-1 w-full px-3 py-2.5 border border-zinc-200 rounded-sm text-[14px] focus:outline-none focus:border-[var(--pjc-primary)]"/>
              </label>
              <label className="block">
                <span className="text-[12px] font-medium">Correo electrónico</span>
                <input type="email" placeholder="daniela@curico.cl"
                       className="mt-1 w-full px-3 py-2.5 border border-zinc-200 rounded-sm text-[14px] focus:outline-none focus:border-[var(--pjc-primary)]"/>
              </label>
              <label className="block">
                <span className="text-[12px] font-medium">Tu rol</span>
                <select className="mt-1 w-full px-3 py-2.5 border border-zinc-200 rounded-sm text-[14px] bg-white focus:outline-none focus:border-[var(--pjc-primary)]">
                  <option>Joven inscrito/a</option>
                  <option>Líder de grupo / colectivo</option>
                  <option>Funcionario/a OMJ</option>
                </select>
              </label>
            </div>
            <button type="submit" className="mt-5 w-full px-4 py-3 bg-[var(--pjc-primary)] text-white rounded-sm text-[14px] font-medium hover:bg-[var(--pjc-primary-700)] transition flex items-center justify-center gap-2">
              Continuar <Icon d={I.arrow} size={16}/>
            </button>
            <div className="mt-3 text-[11px] text-[var(--pjc-muted)] text-center">
              Al continuar aceptas los términos y la política de privacidad municipal.
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
);

// ──────────────────────────────────────────────────────────────────────────
// FOOTER
// ──────────────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-white border-t border-zinc-200">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 lg:py-16">
      <div className="grid grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="col-span-2 lg:col-span-4">
          <div className="flex items-center gap-2.5">
            <BrandMark size={32}/>
            <span className="font-semibold text-[15px] tracking-tight text-[var(--pjc-ink)]">
               Oficina Municipal Juvenil <span className="text-[var(--pjc-primary)]">Curicó</span>
            </span>
          </div>
          <p className="mt-4 text-[13.5px] leading-relaxed text-[var(--pjc-muted)] max-w-[300px]">
            Iniciativa de la Oficina Municipal de la Juventud, I. Municipalidad de Curicó. Construida para centralizar la gestión de actividades juveniles.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {[I.globe, I.send, I.phone].map((d, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-sm border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 flex items-center justify-center text-[var(--pjc-muted)] hover:text-[var(--pjc-ink)]">
                <Icon d={d} size={15}/>
              </a>
            ))}
          </div>
        </div>

        {[
          ['Plataforma',['Cómo funciona','Características','Calendario','Estado del servicio']],
          ['Organizaciones',['Crear cuenta de grupo','Solicitar acceso','Gestión de actividades','Soporte técnico']],
          ['Municipalidad',['OMJ Curicó','Transparencia','Política de datos','Contacto']],
        ].map(([title, links], i) => (
          <div key={i} className="lg:col-span-2 lg:col-start-auto">
            <div className="text-[11px] tracking-[0.18em] uppercase font-semibold text-[var(--pjc-ink)]">{title}</div>
            <ul className="mt-4 space-y-2.5">
              {links.map(l=>(
                <li key={l}><a href="#" className="text-[13.5px] text-[var(--pjc-muted)] hover:text-[var(--pjc-ink)]">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-2 lg:col-span-2">
          <div className="text-[11px] tracking-[0.18em] uppercase font-semibold text-[var(--pjc-ink)]">Boletín</div>
          <p className="mt-4 text-[12.5px] text-[var(--pjc-muted)]">Resumen mensual de actividades y avisos para jóvenes de Curicó.</p>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[12px] text-[var(--pjc-muted)]">
        <div>© 2026 I. Municipalidad de Curicó · Oficina Municipal de la Juventud. Todos los derechos reservados.</div>
        <div className="flex gap-5">
          <a href="#" className="hover:text-[var(--pjc-ink)]">Términos</a>
          <a href="#" className="hover:text-[var(--pjc-ink)]">Privacidad</a>
          <a href="#" className="hover:text-[var(--pjc-ink)]">Accesibilidad</a>
          <a href="#" className="hover:text-[var(--pjc-ink)]">v1.0.0</a>
        </div>
      </div>
    </div>
  </footer>
);

// ──────────────────────────────────────────────────────────────────────────
// APP
// ──────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installHint, setInstallHint] = useState("");

  useEffect(() => {
    // Verificar si la app ya está instalada
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      setInstallHint("La app ya está instalada en este dispositivo.");
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setInstallHint("");
    };

    // Escuchar cuando se instale
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setInstallHint("La app ya quedó instalada.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled) {
      setInstallHint("La app ya está instalada.");
      return;
    }

    if (!installPrompt) {
      setInstallHint("El navegador no expuso el instalador en esta sesión. Si estás en una ventana privada, abre la app en una ventana normal para instalarla.");
      return;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === "accepted") {
      setInstallPrompt(null);
      setIsInstalled(true);
      setInstallHint("La app se instaló correctamente.");
      // Intentar solicitar permisos de notificaciones push tras la instalación
      try {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (vapidKey) {
          await requestNotificationPermissionAndGetToken(vapidKey);
          setInstallHint(prev => prev + " Notificaciones habilitadas.");
        } else {
          console.warn("VITE_FIREBASE_VAPID_KEY no definido. No se solicitaron notificaciones.");
        }
      } catch (err) {
        console.warn("No se pudo activar notificaciones tras instalar:", err?.message || err);
        // No bloquear la UX por el fallo; informar brevemente al usuario
        setInstallHint(prev => prev + " (No se pudo habilitar notificaciones)");
      }
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--pjc-primary', '#05a63d');
    root.style.setProperty('--pjc-primary-50', '#dcfce7');
    root.style.setProperty('--pjc-primary-100', '#bbf7d0');
    root.style.setProperty('--pjc-primary-200', '#86efac');
    root.style.setProperty('--pjc-primary-300', '#4ade80');
    root.style.setProperty('--pjc-primary-700', '#15803d');
    root.style.setProperty('--pjc-primary-800', '#166534');
    root.style.setProperty('--pjc-ink', '#1f3328');
    root.style.setProperty('--pjc-muted', '#64786d');
    root.style.setProperty('--pjc-bg', '#f8faf9');
  }, []);

  // smooth scroll for in-page nav
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      const el = id && document.getElementById(id);
      if (el) {
        e.preventDefault();
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[var(--pjc-ink)]">
      <Hero onInstallClick={handleInstallClick}/>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 -mt-8">
        {installHint && (
          <div className="rounded-sm border border-[#d8e6dd] bg-[#f7fcf9] px-4 py-3 text-[0.9rem] text-[var(--pjc-muted)] shadow-sm">
            {installHint}
          </div>
        )}
      </div>
      <Features/>
      <HowItWorks/>
      <FinalCTA/>
      <Footer/>
    </div>
  );
}
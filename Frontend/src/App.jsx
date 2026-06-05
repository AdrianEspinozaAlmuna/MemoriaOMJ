import React, { useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import UserDashboard from "./pages/userDashboard";
import UserCalendar from "./pages/userCalendar";
import MyActivities from "./pages/myActivities";
import MyAttendance from "./pages/myAttendance";
import CreateActivity from "./pages/createActivity";
import UserNotifications from "./pages/userNotifications";
import UserGroups from "./pages/userGroups";
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/adminDashboard";
import AdminUsers from "./pages/adminUsers";
import AdminGroups from "./pages/adminGroups";
import AdminApprovals from "./pages/adminApprovals";
import AdminCalendar from "./pages/adminCalendar";
import AdminActivities from "./pages/adminActivities";
import AdminReports from "./pages/adminReports";
import AdminNotifications from "./pages/adminNotifications";
import AdminRoom from "./pages/adminRoom";
import AdminImagesManager from "./pages/adminImagesManager";
import ActivityDetail from "./pages/activityDetail";
import { AdminProtectedRoute, ParticipantProtectedRoute, PublicOnlyRoute } from "./components/RouteGuards";
import { getNotificationPresentation, normalizeNotification } from "./services/notificationsService";
import { onForegroundMessage } from "./services/firebase";

function buildForegroundNotification(payload = {}) {
  const title = String(payload?.notification?.title || payload?.data?.title || "").trim();
  const body = String(payload?.notification?.body || payload?.data?.body || "").trim();
  const activityId = payload?.data?.activityId ? Number(payload.data.activityId) : null;
  const receiverId = payload?.data?.receiverId ? Number(payload.data.receiverId) : null;
  const notificationId = payload?.data?.notificationId ? Number(payload.data.notificationId) : null;
  const type = String(payload?.data?.type || "sistema").toLowerCase();
  const presentation = getNotificationPresentation({
    titulo: title,
    descripcion: body,
    tipo: type
  });

  return normalizeNotification({
    id_notificacion: notificationId,
    titulo: presentation.title,
    descripcion: presentation.detail,
    tipo: type,
    id_actividad: Number.isInteger(activityId) ? activityId : null,
    id_receptor: Number.isInteger(receiverId) ? receiverId : null
  });
}

export default function App() {
  const visibleForegroundNotificationIds = useRef(new Set());
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPublicRoute = ["/", "/login", "/register"].includes(location.pathname);
  const shellVariant = isPublicRoute ? "app-shell-public" : isAdminRoute ? "app-shell-admin" : "app-shell-user";

  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return undefined;
    }

    const unsubscribe = onForegroundMessage(payload => {
      const notification = buildForegroundNotification(payload);
      const notificationKey = String(notification.id || notification.id_notificacion || "");

      if (notificationKey && visibleForegroundNotificationIds.current.has(notificationKey)) {
        return;
      }

      if (notificationKey) {
        visibleForegroundNotificationIds.current.add(notificationKey);
      }

      try {
        new Notification(notification.title || "NotificaciÃ³n de Sistema", {
          body: notification.detail || notification.descripcion || "",
          icon: "/icons/icon-192.png",
          tag: String(notification.id || notification.id_notificacion || notificationKey || "notification"),
          renotify: false,
          data: {
            url: notification.activityId ? `/user/actividad/${notification.activityId}` : "/user/notificaciones"
          }
        });
      } catch (_error) {
        // Si el navegador no permite mostrarla, dejamos que socket/lista cubran la actualizaciÃ³n.
      }
    });

    return () => {
      visibleForegroundNotificationIds.current.clear();
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div className={`app-shell ${shellVariant}`}>
      {!isAdminRoute && <Navbar />}
      <main className={`page-main${isAdminRoute ? " page-main-admin" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ParticipantProtectedRoute />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/calendario" element={<UserCalendar />} />
            <Route path="/user/mis-actividades" element={<MyActivities />} />
            <Route path="/user/actividad/:activityId" element={<ActivityDetail />} />
            <Route path="/user/grupos" element={<UserGroups />} />
            <Route path="/user/asistencia" element={<MyAttendance />} />
            <Route path="/user/notificaciones" element={<UserNotifications />} />
            <Route path="/user/crear-actividad" element={<CreateActivity />} />
          </Route>

          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="usuarios" element={<AdminUsers />} />`n              <Route path="grupos" element={<AdminGroups />} />
              <Route path="aprobaciones" element={<AdminApprovals />} />
              <Route path="calendario" element={<AdminCalendar />} />
              <Route path="actividades" element={<AdminActivities />} />
              <Route path="actividad/:activityId" element={<ActivityDetail />} />
              <Route path="crear-actividad" element={<CreateActivity />} />
              <Route path="reportes" element={<AdminReports />} />
              <Route path="notificaciones" element={<AdminNotifications />} />
              <Route path="tipos-e-imagenes" element={<AdminImagesManager />} />
              <Route path="salas" element={<AdminRoom />} />
            </Route>
          </Route>
        </Routes>
      </main>
    </div>
  );
}

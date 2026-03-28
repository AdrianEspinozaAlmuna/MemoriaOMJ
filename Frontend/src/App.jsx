import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import UserDashboard from "./pages/userDashboard";
import UserCalendar from "./pages/userCalendar";
import MyActivities from "./pages/myActivities";
import MyAttendance from "./pages/myAttendance";
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/adminDashboard";
import AdminUsers from "./pages/adminUsers";
import AdminApprovals from "./pages/adminApprovals";
import AdminCalendar from "./pages/adminCalendar";
import AdminActivities from "./pages/adminActivities";
import AdminReports from "./pages/adminReports";
import AdminNotifications from "./pages/adminNotifications";
import AdminSettings from "./pages/adminSettings";
import { AdminProtectedRoute, ParticipantProtectedRoute, PublicOnlyRoute } from "./components/RouteGuards";

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPublicRoute = ["/", "/login", "/register"].includes(location.pathname);
  const shellVariant = isPublicRoute ? "app-shell-public" : isAdminRoute ? "app-shell-admin" : "app-shell-user";

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
            <Route path="/user/asistencia" element={<MyAttendance />} />
          </Route>

          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="usuarios" element={<AdminUsers />} />
              <Route path="aprobaciones" element={<AdminApprovals />} />
              <Route path="calendario" element={<AdminCalendar />} />
              <Route path="actividades" element={<AdminActivities />} />
              <Route path="reportes" element={<AdminReports />} />
              <Route path="notificaciones" element={<AdminNotifications />} />
              <Route path="configuracion" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </main>
    </div>
  );
}
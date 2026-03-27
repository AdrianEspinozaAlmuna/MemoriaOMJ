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
import { ParticipantProtectedRoute, PublicOnlyRoute } from "./components/RouteGuards";

export default function App() {
  const location = useLocation();
  const isPublicRoute = ["/", "/login", "/register"].includes(location.pathname);

  return (
    <div className={`app-shell ${isPublicRoute ? "app-shell-public" : "app-shell-user"}`}>
      <Navbar />
      <main className="page-main">
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
        </Routes>
      </main>
    </div>
  );
}
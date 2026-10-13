import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useOutletContext } from "react-router-dom";
import { API_URL } from "./config";
import { toCurrentUser } from "./lib/currentUser";
import AdminDashboardPage from "./pages/admin/dashboard/DashboardPage";
import ConfirmAccountPage from "./pages/auth/ConfirmAccountPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import SignupPage from "./pages/auth/SignupPage";
import SupportDashboardPage from "./pages/support/dashboard/DashboardPage";
import type { CurrentUser, UserProfile } from "./types/user";

const isAuthenticated = () => Boolean(localStorage.getItem("token"));

function ProfileLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EBEFEC] text-sm font-medium text-[#53665A]">
      Loading your workspace...
    </div>
  );
}

function PrivateRoute() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(isAuthenticated());
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    let active = true;

    async function loadProfile(authToken: string) {
      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: { Accept: "application/json", Authorization: authToken },
        });

        if (!active) return;

        if (response.status === 401) {
          localStorage.removeItem("token");
          setUnauthorized(true);
          return;
        }

        if (!response.ok) return;

        const data = (await response.json()) as UserProfile;

        if (active) setProfile(data);
      } catch {
        // Network failure: fall through to the sign-in redirect below.
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile(token);

    return () => {
      active = false;
    };
  }, []);

  if (!isAuthenticated() || unauthorized) {
    return <Navigate to="/users/sign_in" replace />;
  }

  if (loading) {
    return <ProfileLoadingScreen />;
  }

  if (!profile) {
    return <Navigate to="/users/sign_in" replace />;
  }

  return <Outlet context={toCurrentUser(profile)} />;
}

// UX-only guard: the backend remains the real authorization boundary.
function AdminRoute() {
  const user = useOutletContext<CurrentUser>();

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <AdminDashboardPage />;
}

function App() {
  return (
    <Routes>
      <Route path="/users/sign_in" element={<LoginPage />} />
      <Route path="/users/sign_up" element={<SignupPage />} />
      <Route path="/users/password/new" element={<ForgotPasswordPage />} />
      <Route path="/users/password/edit" element={<ResetPasswordPage />} />
      <Route path="/confirm" element={<ConfirmAccountPage />} />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<SupportDashboardPage />} />
        <Route path="/admin" element={<AdminRoute />} />
      </Route>

      <Route path="*" element={<Navigate to="/users/sign_in" replace />} />
    </Routes>
  );
}

export default App;

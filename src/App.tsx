import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboardPage from "./pages/admin/dashboard/DashboardPage";
import ConfirmAccountPage from "./pages/auth/ConfirmAccountPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import SignupPage from "./pages/auth/SignupPage";
import SupportDashboardPage from "./pages/support/dashboard/DashboardPage";

const isAuthenticated = () => Boolean(localStorage.getItem("token"));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? children : <Navigate to="/users/sign_in" replace />;
}

function App() {
  const supportUser = {
    id: "1",
    name: "Support User",
    email: "support@hookyard.com",
    role: "support" as const,
  };

  const adminUser = {
    id: "2",
    name: "System Admin",
    email: "admin@hookyard.com",
    role: "admin" as const,
  };

  return (
    <Routes>
      <Route path="/users/sign_in" element={<LoginPage />} />
      <Route path="/users/sign_up" element={<SignupPage />} />
      <Route path="/users/password/new" element={<ForgotPasswordPage />} />
      <Route path="/users/password/edit" element={<ResetPasswordPage />} />
      <Route path="/confirm" element={<ConfirmAccountPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <SupportDashboardPage user={supportUser} />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminDashboardPage user={adminUser} />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/users/sign_in" replace />} />
    </Routes>
  );
}

export default App;

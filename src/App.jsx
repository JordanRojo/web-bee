import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LoginScreen from "./components/LoginScreen/LoginScreen";
import ForgotPasswordScreen from "./components/ForgotPasswordScreen/ForgotPasswordScreen";
import DashboardScreen from "./components/DashboardScreen/DashboardScreen";
import HiveDetailScreen from "./components/HiveDetailScreen/HiveDetailScreen";
import ReportsScreen from "./components/ReportsScreen/ReportsScreen";
import SettingsScreen from "./components/SettingsScreen/SettingsScreen";
import HiveManagementScreen from "./components/HiveManagementScreen/HiveManagementScreen"; // <-- Nueva importación
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen";
import LogOut from "./components/LogoutScreen/Logout";
import { AuthProvider } from "./context/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/colmena/:hiveId" element={<HiveDetailScreen />} />
            <Route path="/reports" element={<ReportsScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/hives" element={<HiveManagementScreen />} />{" "}
            <Route path="/logout" element={<LogOut />} />
            {/* <-- Nueva ruta */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

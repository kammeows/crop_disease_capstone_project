import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import OAuthSuccess from "./pages/OAuthSuccess";
import PrivateRoute from "./components/PrivateRoute";
import './i18n'; // add this at the top
import './i18n';  // ← just this line, nothing else changes

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>

        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Signup Page */}
        <Route path="/register" element={<Signup />} />

        {/* OAuth Success */}
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
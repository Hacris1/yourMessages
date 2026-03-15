import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./components/LoginForm";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ChatPage from "./app/posts/ChatPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta de login - pública */}
        <Route path="/login" element={<LoginForm />} />

        {/* Ruta del chat - protegida */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Redirigir la raíz al chat */}
        <Route path="/" element={<Navigate to="/chat" replace />} />

        {/* Cualquier otra ruta redirige a chat */}
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </Router>
  );
}
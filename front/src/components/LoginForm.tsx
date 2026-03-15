import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function LoginForm() {

  const API_URL = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {

      const res = await fetch(`${API_URL}api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        setError("Usuario o contraseña incorrecta");
        return;
      }

      const data = await res.json();
      setToken(data.token);

    } catch (err) {
      setError("Error de conexión");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Ingresar</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
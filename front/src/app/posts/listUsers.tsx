import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { buildApiUrl } from "../../utils/apiUrl";

interface User {
  _id: string;
  name: string;
  email: string;
  publicKey: string;
}

export function UsersList({
  onSelect,
}: {
  onSelect: (user: User) => void;
}) {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !currentUser) return;

    fetchUsers();
  }, [token, currentUser]);

  const fetchUsers = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(buildApiUrl("/api/user"), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar los usuarios");
      }

      const data = await response.json();
      // Filtrar al usuario actual
      const filtered = data.filter(
        (user: User) => user._id !== currentUser?._id
      );
      setUsers(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="users-list">
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-list">
        <p className="error">{error}</p>
        <button onClick={fetchUsers}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="users-list">
      <h4>Usuarios disponibles</h4>
      {users.length === 0 ? (
        <p className="no-users">No hay otros usuarios disponibles</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user._id}>
              <button
                className="user-item"
                onClick={() => onSelect(user)}
              >
                <div className="user-info">
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
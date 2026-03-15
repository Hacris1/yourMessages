//desplegar usuarios
//seleccioanr usuario para chatear
//enviar contraseña publica a usuario seleccionado
//iniciar chat


import React, { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
};

export function UsersList({ onSelect }: { onSelect: (user: User) => void }) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div>
      <h3>Usuarios</h3>

      {users.map(user => (
        <button key={user.id} onClick={() => onSelect(user)}>
          {user.name}
        </button>
      ))}
    </div>
  );
}
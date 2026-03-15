import React, { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
};

export function UsersList({ onSelect }: { onSelect: (user: User) => void }) {

  const [users, setUsers] = useState<User[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;

useEffect(() => {
  fetch(`${API_URL}/api/user`)
    .then(res => res.json())
    .then(data => {
      console.log("datos backend:", data);
      setUsers(data);
    });
}, []);

  

  return (
    <div>
      <h3>Usuarios</h3>

      {users.map(user => (
        <button key={user.name} onClick={() => onSelect(user)}>
          {user.name}
        </button>
      ))}

    </div>
  );
}
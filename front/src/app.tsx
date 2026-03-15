import { useState } from "react";
import { UsersList } from "./app/posts/listUsers";
import ChatContainer from "./app/posts/chatContainer";

type User = {
  id: string;
  name: string;
};

export default function App() {

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>

      <div>
        <UsersList onSelect={setSelectedUser} />
      </div>

      <div style={{ flex: 1 }}>
        <ChatContainer user={selectedUser} />
      </div>

    </div>
  );
}
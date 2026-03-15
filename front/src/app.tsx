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
    <div style={{ display: "flex", gap: "20px" }}>

      <UsersList onSelect={setSelectedUser} />

      <ChatContainer user={selectedUser} />

    </div>
  );
}
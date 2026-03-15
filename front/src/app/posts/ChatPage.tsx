import React, { useState } from "react";
import 'react-chat-elements/dist/main.css'
//import { MessageBox } from 'react-chat-elements'
import { useAuth } from "../../context/AuthContext";
import {jwtDecode} from "jwt-decode";


//  const { token } = useAuth();

//  if (token) {
  //  const decoded = jwtDecode(token);
//
  //  console.log(decoded);
  //}



import { useState } from "react";
import UsersList from "./UsersList";
import ChatContainer from "./ChatContainer";

type User = {
  id: string;
  name: string;
};

export default function ChatPage() {

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div style={{ display: "flex", gap: "20px" }}>

      <UsersList onSelect={setSelectedUser} />

      <ChatContainer user={selectedUser} />

    </div>
  );
}
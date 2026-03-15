import { useState, useEffect } from "react";
import { UsersList } from "./listUsers";
import ChatContainer from "./chatContainer";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRSA } from "../../hooks/useRSA";
import forge from "node-forge";
import {jwtDecode} from "jwt-decode";

type TokenPayload = {
  id: string;
  name: string;
  email: string;
  publicKey: string;
  exp: number;
};

type User = {
  _id: string;
  name: string;
  email: string;
  publicKey?: string;
};

const API_URL = import.meta.env.VITE_API_URL;

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { logout, token } = useAuth(); 
  const navigate = useNavigate();

  const { publicKey, privateKey } = useRSA();

  // Decodificar token
  let currentUserId: string | null = null;
  if (token) {
    const decoded = jwtDecode<TokenPayload>(token);
    currentUserId = decoded.id;
  }

  // Enviar publicKey generada al backend
  useEffect(() => {
    if (publicKey && currentUserId) {
      const publicKeyPem = forge.pki.publicKeyToPem(publicKey);

      fetch(`${API_URL}/api/user/updateKey`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ publicKey: publicKeyPem })
      })
      .then(res => res.json())
      .then(data => console.log("Public key enviada", data))
      .catch(err => console.error("Error enviando public key", err));
    }
  }, [publicKey, currentUserId, token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#f0f0f0",
        borderBottom: "1px solid #ddd"
      }}>
        <h1>Your Messages</h1>
        <button 
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Contenido */}
      <div style={{ display: "flex", gap: "20px", padding: "20px", flex: 1, overflow: "hidden" }}>
        <div style={{ width: "300px", borderRight: "1px solid #ddd", overflowY: "auto" }}>
          <UsersList onSelect={setSelectedUser} />
        </div>

          <ChatContainer 
            user={selectedUser} 
            myPrivateKey={privateKey} 
            myPublicKey={publicKey} 
            token={token || ""}/>
        </div>
      </div>

  );
}
// hooks/useRSA.ts
import { useState, useEffect } from "react";
import forge from "node-forge";

export function useRSA() {
  const [publicKey, setPublicKey] = useState<forge.pki.PublicKey | null>(null);
  const [privateKey, setPrivateKey] = useState<forge.pki.PrivateKey | null>(null);

  useEffect(() => {

    const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    setPublicKey(keypair.publicKey);
    setPrivateKey(keypair.privateKey);
  }, []);

  //cifrar  clave publica
  const encryptMessage = (message: string, pubKey: forge.pki.PublicKey) => {
    return pubKey.encrypt(message, "RSA-OAEP");
  };

  //descifrar  con clave privada
  const decryptMessage = (cipherText: string) => {
    if (!privateKey) throw new Error("No hay clave privada");
    return privateKey.decrypt(cipherText, "RSA-OAEP");
  };

  return { publicKey, privateKey, encryptMessage, decryptMessage };
}

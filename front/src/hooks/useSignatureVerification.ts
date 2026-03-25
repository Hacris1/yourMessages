import { useState } from 'react';

interface SignatureStatus {
    [messageId: string]: {
        isValid: boolean;
        verified: boolean;
        error?: string;
    }
}

export const useSignatureVerification = () => {
    const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>({});
    const [isVerifying, setIsVerifying] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

    const verifyMessageSignature = async (messageId: string, senderPublicKey: string) => {
        setIsVerifying(true);
        try {
            const response = await fetch(`${apiUrl}/messages/${messageId}/verify-signature`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ senderPublicKey })
            });

            if (!response.ok) {
                throw new Error('Error verifying signature');
            }

            const result = await response.json();

            setSignatureStatus(prev => ({
                ...prev,
                [messageId]: {
                    isValid: result.signatureValid,
                    verified: true
                }
            }));

            return result.signatureValid;
        } catch (error) {
            console.error('Error verifying signature:', error);
            setSignatureStatus(prev => ({
                ...prev,
                [messageId]: {
                    isValid: false,
                    verified: true,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            }));
            return false;
        } finally {
            setIsVerifying(false);
        }
    };

    const decryptMessage = async (messageId: string, recipientPrivateKey: string, senderPublicKey?: string) => {
        try {
            const response = await fetch(`${apiUrl}/messages/${messageId}/decrypt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    recipientPrivateKey,
                    senderPublicKey: senderPublicKey || undefined
                })
            });

            if (!response.ok) {
                throw new Error('Error decrypting message');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error decrypting message:', error);
            throw error;
        }
    };

    const getSignatureStatus = (messageId: string) => {
        return signatureStatus[messageId] || { isValid: false, verified: false };
    };

    return {
        signatureStatus,
        isVerifying,
        verifyMessageSignature,
        decryptMessage,
        getSignatureStatus
    };
};

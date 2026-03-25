import type { MessageInput, MessageInputUpdate } from "./dto/message.dto.js";
import { MessageModel } from "./message.model.js";
import type { IMessage } from "./message.model.js";
import { signatureService } from "../encrypt/SignatureService.js";
import { rsaUserService } from "../encrypt/RSAUser.js";

class MessageService {

    public async create (messageData: MessageInput, senderPrivateKey: string, recipientPublicKey: string) : Promise<IMessage> {
        try {
            const encryptedContent = rsaUserService.encryptMessage(messageData.content, recipientPublicKey);
            const signature = signatureService.signMessage(messageData.content, senderPrivateKey);
            const messageHash = signatureService.hashMessage(messageData.content);
            return MessageModel.create({
                content: messageData.content, 
                encryptedContent,
                signature,
                messageHash,
                emisor: messageData.emisor,
                receptor: messageData.receptor,
                date: messageData.date
            });
        } catch (error) {
            throw new Error(`Error creating encrypted message: ${error}`);
        }
    }


    public async createFromSocket(
        messageData: MessageInput,
        encryptedContent: string,
        encryptedContentForSender: string,
        signature?: string
    ): Promise<IMessage> {
        try {
   
            const messageHash = signatureService.hashMessage(encryptedContent);

            return MessageModel.create({
                content: messageData.content || '', 
                encryptedContent,
                encryptedContentForSender,
                signature: signature || '',
                messageHash,
                emisor: messageData.emisor,
                receptor: messageData.receptor,
                date: messageData.date || new Date()
            });
        } catch (error) {
            throw new Error(`Error creating message from socket: ${error}`);
        }
    }

    public async update (messageId: string, messageData: MessageInputUpdate) {
        try {
            
            const message: IMessage | null = await MessageModel.findOneAndUpdate({ _id: messageId }, messageData, { returnOriginal: false });

            return message;
            
        }
        catch (error) {
            if (error instanceof ReferenceError) {
                throw new Error("Message not found");
            }
            throw error;
        }
    }

    public async delete (messageId: string) {
        try {
            const message: IMessage | null = await MessageModel.findOneAndDelete({ _id: messageId });   
            return message;
        } catch (error) {
            if (error instanceof ReferenceError) {
                throw new Error("Message not found");
            }
            throw error;
        }
    }

    public async getById (messageId: string) {
        return MessageModel.findById(messageId).populate("emisor").populate("receptor");
    }
    
    public async getByUser (userId: string) {
        return MessageModel.find({ $or: [{ emisor: userId }, { receptor: userId }] }).populate("emisor").populate("receptor");
    }

    public async getConversation (user1Id: string, user2Id: string) {
        return MessageModel.find({
            $or: [
                { emisor: user1Id, receptor: user2Id },
                { emisor: user2Id, receptor: user1Id }
            ]
        }).populate("emisor").populate("receptor").sort({ date: 1 });
    }

    public async decryptMessageContent(messageId: string, recipientPrivateKey: string): Promise<string> {
        try {
            const message = await this.getById(messageId);
            if (!message || !message.encryptedContent) {
                throw new Error("Message not found or not encrypted");
            }

            const decryptedContent = rsaUserService.decryptMessage(message.encryptedContent, recipientPrivateKey);
            return decryptedContent;
        } catch (error) {
            throw new Error(`Error decrypting message: ${error}`);
        }
    }

    public async verifyMessageSignature(messageId: string, senderPublicKey: string): Promise<boolean> {
        try {
            const message = await this.getById(messageId);
            if (!message || !message.signature) {
                throw new Error("Message not found or no signature");
            }

            const isValid = signatureService.verifySignature(
                message.content,
                message.signature,
                senderPublicKey
            );

            return isValid;
        } catch (error) {
            console.error(`Error verifying signature: ${error}`);
            return false;
        }
    }

    public async getMessageDecrypted(messageId: string, recipientPrivateKey: string, senderPublicKey: string) {
        try {
            const message = await this.getById(messageId);
            if (!message) {
                throw new Error("Message not found");
            }

            let decryptedContent = message.content;
            let signatureValid = false;

            if (message.encryptedContent) {
                decryptedContent = await this.decryptMessageContent(messageId, recipientPrivateKey);
            }

            if (message.signature && senderPublicKey) {
                signatureValid = await this.verifyMessageSignature(messageId, senderPublicKey);
            }

            return {
                ...message.toObject(),
                decryptedContent,
                signatureValid,
                originalContent: message.content
            };
        } catch (error) {
            throw new Error(`Error getting decrypted message: ${error}`);
        }
    }

}

export const messageServices = new MessageService();
import type { MessageInput, MessageInputUpdate } from "./dto/message.dto.js";
import { MessageModel } from "./message.model.js";
import type { IMessage } from "./message.model.js";

class MessageService {

    public async create (messageData: MessageInput) : Promise<IMessage> {
        return MessageModel.create(messageData);
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

}

export const messageServices = new MessageService();
import mongoose from "mongoose";
import type { MessageInput } from "./dto/message.dto.js";

export interface IMessage extends MessageInput, mongoose.Document {
    createdAt: Date,
    updatedAt: Date
}

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    emisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receptor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date : { type: Date, required: true }
}, { timestamps: true });

export const MessageModel = mongoose.model<IMessage>("Message", messageSchema);
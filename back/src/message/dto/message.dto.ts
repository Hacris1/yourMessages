import type { IUser } from "../../user/user.model.js";

export interface MessageInput {
    content: string,
    emisor: IUser,
    receptor: IUser,
    date : Date,
    encryptedContent: string,
    encryptedContentForSender: string,
    signature: string,
    messageHash: string
}

export interface MessageInputUpdate {
    content: string,
    date : Date,
    encryptedContent?: string,
    signature?: string,
    messageHash?: string
}
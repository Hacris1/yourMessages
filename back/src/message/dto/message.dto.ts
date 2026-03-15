import type { IUser } from "../../user/user.model.js";

export interface MessageInput {
    content: string,
    emisor: IUser,
    receptor: IUser,
    date : Date

}

export interface MessageInputUpdate {
    content: string,
    date : Date
}
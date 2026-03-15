import mongoose from "mongoose";
import type { createUserDto } from "./dto/user.dto.js";

export  interface IUser extends createUserDto, mongoose.Document {
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
    name : {type: String, requires: true},
    email : {type: String, requires: true, unique: true},
    password : {type: String, requires: true}
}, {
    timestamps: true
});

export const UserModel = mongoose.model<IUser>('User', userSchema);
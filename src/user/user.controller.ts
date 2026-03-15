import type { Request, Response } from "express";
import { userServices } from "./user.service.js";
import type { updateUserDto } from "./dto/user.dto.js";

class UserController {

    public async create (req: Request, res: Response) {
        try {
            const user = await userServices.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Error creating user' });
        }
    }

    public async update (req: Request, res: Response) {
        const id : string = req.params.id as string || "";
        const userData = req.body;
        try {
            const user = await userServices.update(id, userData as updateUserDto);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: 'Error updating user' });
        }
    }

    public async delete (req: Request, res: Response) {
        const id : string = req.params.id as string || "";
        try {
            const user = await userServices.delete(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: 'Error deleting user' });
        }
    }

    public async getOne (req: Request, res: Response) {
        const id : string = req.params.id as string || "";
        try {
            const user = await userServices.getById(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching user' });
        }
    }

    public async login (req: Request, res: Response) {
        const { email, password } = req.body;
        try {
            const token = await userServices.login(email, password);
            res.json({ token });
        } catch (error) {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    }

}

export const userController = new UserController();
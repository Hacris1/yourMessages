import express from "express";
import { userController } from "./user.controller.js";

export const router = express.Router();

router.get("/:id", userController.getOne);

router.put("/:id", userController.update);

router.post("/", userController.create);

router.post("/login", userController.login);

router.delete("/:id", userController.delete);

router.get("/", userController.getAll);

router.post("/updatePublickey", userController.sendPublicKey);

router.get("/publicKey/:id", userController.getPublicKey);
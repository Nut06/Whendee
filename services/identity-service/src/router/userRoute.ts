import { updatePreferences } from "@/controller/userController";
import { Router } from "express";

export const userRouter = Router();

userRouter.post("/preferences", updatePreferences);
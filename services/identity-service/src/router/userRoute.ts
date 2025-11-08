import { updatePreferences, addFriend, getPreferences, getUserList, getUsersByIds, updateUserProfile } from "@/controller/userController";
import { Router } from "express";

export const userRouter: Router = Router();

userRouter.get("/preferences", getPreferences);

userRouter.post("/preferences", updatePreferences);

userRouter.post("/add/friend", addFriend);

userRouter.get("/list", getUserList);

userRouter.post("/lookup", getUsersByIds);

userRouter.put("/", updateUserProfile);
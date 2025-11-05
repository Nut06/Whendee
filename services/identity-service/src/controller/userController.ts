import authService from "@/service/authService";
import userService from "@/service/userService";
import { AppError } from "@/types/appError";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from "@/types/http";
import type { Request, Response } from "express";

export const updatePreferences = async (req: Request, res: Response) => {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(" ")[1];

	if (!token) {
		return res.status(BAD_REQUEST).json({ success: false, message: "Access token is required" });
	}

	const preferences = (req.body && (req.body.preferences ?? req.body)) as unknown;

	if (!Array.isArray(preferences)) {
		return res.status(BAD_REQUEST).json({ success: false, message: "Preferences must be an array" });
	}

	try {
		const currentUser = await authService.getUserFromToken(token);
		const updatedUser = await userService.setPreferences(currentUser.id, preferences);

		return res.status(OK).json({
			success: true,
			message: "Preferences updated successfully",
			data: { user: updatedUser },
		});
	} catch (error) {
		if (error instanceof AppError) {
			return res.status(error.status).json({
				success: false,
				message: error.message,
				code: error.code,
			});
		}

		return res.status(INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "Failed to update preferences",
		});
	}
};

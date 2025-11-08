import authService from "@/service/authService";
import userService from "@/service/userService";
import { AppError } from "@/types/appError";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from "@/types/http";
import type { Request, Response } from "express";
import { resolveUserId, ensureAuthenticated } from "@/utils/authRequest";

export const updatePreferences = async (req: Request, res: Response) => {
	// Dev override supports userId via header/query/body; otherwise requires token

	const preferences = (req.body && (req.body.preferences ?? req.body)) as unknown;

	if (!Array.isArray(preferences)) {
		return res.status(BAD_REQUEST).json({ success: false, message: "Preferences must be an array" });
	}

	try {
		const userId = await resolveUserId(req);
		const updatedUser = await userService.setPreferences(userId, preferences);

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

export const addFriend = async (req: Request, res: Response) => {
	// Accept from JSON body first; fallback to params for backward compatibility
	const bodyFriendId = (req.body && (req.body.friendId ?? req.body.id ?? req.body.userId)) as unknown;
	const paramFriendId = req.params?.friendId;
	const friendId = typeof bodyFriendId === 'string' && bodyFriendId.trim().length > 0
		? bodyFriendId.trim()
		: (typeof paramFriendId === 'string' ? paramFriendId : '');
	if (!friendId) {
		return res.status(BAD_REQUEST).json({ success: false, message: "Friend ID is required" });
	}
	try {
		const userId = await resolveUserId(req);
		const updatedUser = await userService.addFriend(userId, friendId);
		return res.status(OK).json({
			success: true,
			message: "Friend added successfully",
			data: {
				user: updatedUser,
				input: { friendId },
			},
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
			message: "Failed to add friend",
		});
	}
};

export const getPreferences = async (req: Request, res: Response) => {
	try {
		const userId = await resolveUserId(req);
		const preferences = await userService.getPreferences(userId);
		return res.status(OK).json({
			success: true,
			message: "Preferences retrieved successfully",
			data: { preferences },
		});
	}
	catch (error) {
		if (error instanceof AppError) {
			return res.status(error.status).json({
				success: false,
				message: error.message,
				code: error.code,
			});
		}
		return res.status(INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "Failed to retrieve preferences",
		});
	}
};

export const getUserList = async (req: Request, res: Response) => {
	const page = Number(req.query.page ?? 1);
	const limit = Number(req.query.limit ?? 20);
	const search = typeof req.query.q === 'string' ? req.query.q : undefined;
	try {
		const userId = await resolveUserId(req);
		const result = await userService.getUserList(userId, { page, limit, search });
		return res.status(OK).json({
			success: true,
			message: "User list retrieved successfully",
			data: { users: result.users, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } },
		});
	}
	catch (error) {
		if (error instanceof AppError) {
			return res.status(error.status).json({
				success: false,
				message: error.message,
				code: error.code,
			});
		}
		return res.status(INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "Failed to retrieve user list",
		});
	}
};

export const getUsersByIds = async (req: Request, res: Response) => {
	const payload = req.body && (req.body.ids ?? req.body);
	const ids = Array.isArray(payload) ? payload : [];
	try {
		await ensureAuthenticated(req); // ensure auth (dev override or token)
		const users = await userService.getUsersByIds(ids);
		return res.status(OK).json({
			success: true,
			message: "Users retrieved successfully",
			data: { users },
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
			message: "Failed to retrieve users",
		});
	}
};

export const updateUserProfile = async (req: Request, res: Response) => {
	const profileData = req.body;
	try {
		const userId = await resolveUserId(req);
		const updatedUser = await userService.updateUserProfile(userId, profileData);
		return res.status(OK).json({
			success: true,
			message: "User profile updated successfully",
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
			message: "Failed to update user profile",
		});
	}
};

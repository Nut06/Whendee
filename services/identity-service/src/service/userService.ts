import { addFriend } from "@/controller/userController";
import UserRepo from "@/repo/userRepo";
import { AppError } from "@/types/appError";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } from "@/types/http";
import { User } from "@/types/user";

type PreferencePayload = {
	key: string;
	label?: string;
	icon?: string | null;
	score?: number;
};

const coerceScore = (score?: number): number => {
	if (typeof score !== "number" || Number.isNaN(score)) {
		return 5;
	}
	return Math.min(Math.max(Math.trunc(score), 1), 10);
};

const dedupePreferences = (preferences: PreferencePayload[]): PreferencePayload[] => {
	const map = new Map<string, PreferencePayload>();
	preferences.forEach((item) => {
		const key = item.key?.trim();
		if (!key) {
			return;
		}

		map.set(key, {
			key,
			label: item.label?.trim() || undefined,
			icon: item.icon ?? null,
			score: coerceScore(item.score),
		});
	});
	return Array.from(map.values());
};

const resolveMinimumSelections = (): number => {
	const raw = Number(process.env.USER_PREFERENCE_MIN ?? 0);
	if (Number.isFinite(raw) && raw > 0) {
		return Math.trunc(raw);
	}
	return 1;
};

const userService = {
	updateUserProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
		if (!userId) {
			throw new AppError("User id is required", BAD_REQUEST, "USER_ID_REQUIRED");
		}
		try {

			await UserRepo.updateUserProfile(userId, updates);
			const fresh = await UserRepo.findUserById(userId);
			if (!fresh) {
				throw new AppError("User not found", NOT_FOUND, "USER_NOT_FOUND");
			}
			return fresh;
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			throw new AppError("Unable to update user profile", INTERNAL_SERVER_ERROR, "USER_UPDATE_FAILED");
		}
	},
	setPreferences: async (userId: string, preferences: PreferencePayload[]): Promise<User> => {
		if (!userId) {
			throw new AppError("User id is required", BAD_REQUEST, "USER_ID_REQUIRED");
		}

		if (!Array.isArray(preferences)) {
			throw new AppError("Preferences payload must be an array", BAD_REQUEST, "PREFERENCES_INVALID");
		}

		const normalized = dedupePreferences(preferences);

		const minimum = resolveMinimumSelections();
		if (normalized.length < minimum) {
			throw new AppError(
				`Please select at least ${minimum} preference${minimum > 1 ? "s" : ""}`,
				BAD_REQUEST,
				"PREFERENCES_TOO_FEW",
			);
		}

		try {
			await UserRepo.replacePreferences(userId, normalized);
			const user = await UserRepo.findUserById(userId);
			if (!user) {
				throw new AppError("User not found", NOT_FOUND, "USER_NOT_FOUND");
			}
			return user;
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			throw new AppError("Unable to save preferences", INTERNAL_SERVER_ERROR, "PREFERENCES_SAVE_FAILED");
		}
	},
	
	getPreferences: async (userId: string): Promise<string[]> => {
			const preferences = await UserRepo.getPreferences(userId);
			if (!preferences) {
				throw new AppError('User not found', NOT_FOUND, 'USER_NOT_FOUND');
			}
			return preferences;
	},

	addFriend: async (userId: string, friendId: string): Promise<User> => {
		if (!userId) {
			throw new AppError("User id is required", BAD_REQUEST, "USER_ID_REQUIRED");
		}

		if (!friendId) {
			throw new AppError("Friend id is required", BAD_REQUEST, "FRIEND_ID_REQUIRED");
		}
		try {
			await UserRepo.addFriend(userId, friendId);
			const user = await UserRepo.findUserById(userId);
			if (!user) {
				throw new AppError("User not found", NOT_FOUND, "USER_NOT_FOUND");
			}
			return user;
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			throw new AppError("Unable to add friend", INTERNAL_SERVER_ERROR, "ADD_FRIEND_FAILED");
		}
	}
,
	getUserList: async (currentUserId: string, options: { page?: number; limit?: number; search?: string; orderBy?: 'createdAt' | 'updatedAt'; sort?: 'asc' | 'desc'; } = {}) => {
		if (!currentUserId) {
			throw new AppError('User id is required', BAD_REQUEST, 'USER_ID_REQUIRED');
		}
		try {
			const result = await UserRepo.listUsers({
				page: options.page,
				limit: options.limit,
				search: options.search,
				excludeUserId: currentUserId,
				orderBy: options.orderBy,
				sort: options.sort,
			});
			return result;
		} catch (error) {
			throw new AppError('Unable to fetch user list', INTERNAL_SERVER_ERROR, 'USER_LIST_FAILED');
		}
	}
	,
	getUsersByIds: async (ids: string[]): Promise<User[]> => {
		if (!Array.isArray(ids)) {
			throw new AppError('ids must be an array', BAD_REQUEST, 'IDS_INVALID');
		}
		const cleaned = ids
			.map((x) => (typeof x === 'string' ? x.trim() : ''))
			.filter((x) => x.length > 0);
		const unique = Array.from(new Set(cleaned));
		if (unique.length === 0) return [];
		if (unique.length > 100) {
			throw new AppError('Maximum 100 ids allowed', BAD_REQUEST, 'IDS_TOO_MANY');
		}
		try {
			return await UserRepo.findUsersByIds(unique);
		} catch {
			throw new AppError('Unable to fetch users', INTERNAL_SERVER_ERROR, 'USERS_FETCH_FAILED');
		}
	}
};

export default userService;

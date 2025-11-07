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
};

export default userService;

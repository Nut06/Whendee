import type { Request } from "express";
import { AppError } from "@/types/appError";
import { BAD_REQUEST, UNAUTHORIZED } from "@/types/http";
import authService from "@/service/authService";

// Dev override allows passing userId directly without token when true
const devOverrideEnabled = () => {
  const val = process.env.DEV_AUTH_OVERRIDE ?? process.env.AUTH_DEV_OVERRIDE ?? "";
  if (typeof val === "string" && /^(1|true|yes)$/i.test(val.trim())) return true;
  // Also allow when NODE_ENV is explicitly 'development'
  return process.env.NODE_ENV === "development";
};

export const extractAccessToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization || req.headers.Authorization as string | undefined;
  if (typeof authHeader === "string") {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && /^Bearer$/i.test(parts[0]) && parts[1]) {
      return parts[1];
    }
  }
  // Optional: also support token in query/body for dev tools
  const fromQuery = typeof req.query.accessToken === "string" ? req.query.accessToken : undefined;
  const fromBody = typeof (req.body?.accessToken) === "string" ? req.body.accessToken : undefined;
  return fromQuery || fromBody || null;
};

const extractUserIdFromRequest = (req: Request): string | null => {
  const fromHeader = typeof req.headers["x-user-id"] === "string" ? (req.headers["x-user-id"] as string) : undefined;
  const fromQuery = typeof req.query.userId === "string" ? (req.query.userId as string) : undefined;
  const bodyAny = req.body as any;
  const fromBody = typeof bodyAny?.userId === "string" ? bodyAny.userId : (typeof bodyAny?.id === "string" ? bodyAny.id : undefined);
  const id = (fromHeader || fromQuery || fromBody || "").trim();
  return id.length ? id : null;
};

// Resolve the current userId from request.
// - If dev override is enabled and userId is provided (header/query/body), use it.
// - Else require a valid access token and resolve the user via authService.
export const resolveUserId = async (req: Request): Promise<string> => {
  if (devOverrideEnabled()) {
    const override = extractUserIdFromRequest(req);
    if (override) {
      return override;
    }
  }

  const token = extractAccessToken(req);
  if (!token) {
    throw new AppError("Access token is required", BAD_REQUEST, "ACCESS_TOKEN_REQUIRED");
  }

  const user = await authService.getUserFromToken(token);
  if (!user?.id) {
    throw new AppError("Invalid access token", UNAUTHORIZED, "INVALID_ACCESS_TOKEN");
  }
  return user.id;
};

// Simple guard that throws if neither a dev userId nor a valid token is present
export const ensureAuthenticated = async (req: Request): Promise<void> => {
  await resolveUserId(req); // throws if invalid
};

export default {
  extractAccessToken,
  resolveUserId,
  ensureAuthenticated,
};

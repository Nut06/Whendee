import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export interface JWTPayload extends JwtPayload {
    id: string;
}

export type TokenWithExpiry = {
    token: string;
    expiresAt: Date | null;
};

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '1h';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '7d';

const getExpiryDate = (token: string): Date | null => {
    const decoded = jwt.decode(token) as JwtPayload | null;
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
};

const signToken = (payload: object, secret: string, options: SignOptions): TokenWithExpiry => {
    const token = jwt.sign(payload, secret, options);
    return {
        token,
        expiresAt: getExpiryDate(token),
    };
};

export const generateAccessToken = (
    payload: object,
    expiresIn: SignOptions['expiresIn'] = ACCESS_TOKEN_TTL as SignOptions['expiresIn']
): TokenWithExpiry => {
    return signToken(payload, ACCESS_TOKEN_SECRET, { expiresIn });
};

export const generateRefreshToken = (
    payload: object,
    expiresIn: SignOptions['expiresIn'] = REFRESH_TOKEN_TTL as SignOptions['expiresIn']
): TokenWithExpiry => {
    return signToken(payload, REFRESH_TOKEN_SECRET, { expiresIn });
};

export const verifyAccessToken = (token: string): JWTPayload => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
};
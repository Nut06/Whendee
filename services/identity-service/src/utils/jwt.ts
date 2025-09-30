const jwt = require('jsonwebtoken');

const JWT = {
    sign: (payload: object, secret: string, options?: object) => {
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, options);
    },

    verify: (token: string, secret: string, options?: object) => {
        return jwt.verify(token, secret, options);
    }
}

export const createAccessToken = (payload: object) => {
    return JWT.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '1h' }) as string;
}

export const createRefreshToken = (payload: object) => {
    return JWT.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' }) as string;
}
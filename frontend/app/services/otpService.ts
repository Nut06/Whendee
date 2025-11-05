import { identityApi } from "@/utils/api";
import { SecureStorage } from "./secureStorage";
import { RegisterRequest, RequestOTP, ResponseOTP } from "@/types/user.types";

export const otpService = {
        async requestOtp(data: RequestOTP | RegisterRequest): Promise<void> {
            try {
                // Backend expects: { email, password, fullname, phone }
                const payload = {
                    email: (data as any).email,
                    password: (data as any).password,
                    fullname: (data as any).name ?? (data as any).fullname,
                    phone: (data as any).phone,
                };
                const response = await identityApi.post('/auth/request-otp', payload);
                const resdata = response.data?.data ?? response.data;
                const sessionToken = resdata?.sessionToken;
                const expiresIn = resdata?.expiresIn;

                if (!sessionToken || !expiresIn) {
                    throw new Error('Invalid OTP response');
                }

                // Persist session info for verification/resend
                await SecureStorage.saveOTPSession(sessionToken, expiresIn);
                // Persist minimal user info for resend (needs phone)
                await SecureStorage.saveTempUserData({
                    email: payload.email,
                    name: payload.fullname,
                    phone: payload.phone,
                });
            } catch {
                throw new Error('Failed to request OTP');
            }
        },

        async verifyOtp(otp: string) {
            try {
                    const sessionToken = await SecureStorage.getOTPSessionToken();
                    if (!sessionToken) {
                        throw new Error('OTP session has expired. Please request a new OTP.');
                    }

                    // Backend expects: { session, otp }
                    const response = await identityApi.post('/auth/verify-otp', {
                        session: sessionToken,
                        otp,
                    });

                    const redata = response.data;
                    const user = redata?.data?.user;
                    const accessToken = redata?.data?.accessToken;
                    const refreshToken = redata?.data?.refreshToken;
                    const accessTokenExpiresAt = redata?.data?.accessTokenExpiresAt ?? null;
                    const refreshTokenExpiresAt = redata?.data?.refreshTokenExpiresAt ?? null;

                    if (!accessToken || !refreshToken) {
                        throw new Error('Missing tokens from verify response');
                    }

                    // Clear OTP session and persist auth tokens
                    await SecureStorage.clearOTPSession();
                    await SecureStorage.saveAccessToken(accessToken);
                    await SecureStorage.saveRefreshToken(refreshToken);

                    return {
                        success: true,
                        user,
                        tokens: {
                            accessToken,
                            refreshToken,
                            accessTokenExpiresAt,
                            refreshTokenExpiresAt,
                        },
                        message: redata?.message ?? 'OTP verified successfully',
                    };

            } catch {
                throw new Error('Failed to verify OTP');
            }
        },

        async resendOTP(){
            try {
                    const session = await SecureStorage.getOTPSessionToken();
                    if(!session) throw new Error('No OTP session found');

                    const tmp = await SecureStorage.getTempUserData();
                    const phone: string | undefined = tmp?.phone;
                    if (!phone) throw new Error('Missing phone number for resend');

                    // Backend handler reads req.query.session and req.query.phone (even on POST)
                    const response = await identityApi.post<ResponseOTP>('/auth/resend-otp', undefined, {
                        params: { session, phone },
                    });

                    const resdata = response.data;
                    const sessionToken = resdata?.data?.sessionToken;
                    const expiresIn = resdata?.data?.expiresIn;
                    if (sessionToken && expiresIn) {
                        await SecureStorage.saveOTPSession(sessionToken, expiresIn);
                    }

                    return {
                        success: true,
                        expiresIn: expiresIn ?? 0,
                        message: resdata?.message ?? 'OTP resent',
                    }

            } catch {
                throw new Error('Failed to resend OTP');
            }
        },

        async completeRegister(_userData: RequestOTP){
            // Not used in current backend; registration happens within verifyOtp
            // Keep as no-op for forward compatibility
            return { success: true, message: 'Registration completed' };
        }
    }
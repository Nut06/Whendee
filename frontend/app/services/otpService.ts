import api from "@/utils/api";
import { SecureStorage } from "./secureStorage";
import { RegisterRequest, RequestOTP, ResponseOtp, VerifyOtpRespone } from "@/types/user.types";
import { ResponseOTP } from "@/types/user.types";

export const otpService = {
        async requestOtp(data: RequestOTP): Promise<void> {
            try {
                const response = await api.post('/auth/request-otp', data);
                const resdata = response.data;
                await SecureStorage.saveOTPSession(
                    resdata.token,
                    resdata.expiresIn
                );
            } catch (error) {
                throw new Error('Failed to request OTP');
            }
        },

        async verifyOtp(otp: string) {
            try {
                    const sessionToken = await SecureStorage.getOTPSessionToken();
                    if (!sessionToken) {
                        throw new Error('OTP session has expired. Please request a new OTP.');
                    }

                    const response = await api.post<VerifyOtpRespone>('/auth/verify-otp', {
                        otp,
                        sessionToken
                    });

                    const redata = response.data;
                    if (redata) {
                        await SecureStorage.clearOTPSession();

                        await SecureStorage.saveVerificationToken(redata.data.accessToken);
                    }

                    return{
                        success:true,
                        user: redata.data.user,
                        message: redata.message
                    }

            } catch (error) {
                throw new Error('Failed to verify OTP');
            }
        },

        async resendOTP(){
            try {
                    const oldToken = await SecureStorage.getOTPSessionToken();
                    if(!oldToken) throw new Error('No OTP session found');

                    const response = await api.post<ResponseOTP>('/auth/resend-otp', {
                        oldToken
                    });

                    const resdata = response.data;
                    if (resdata) {
                        await SecureStorage.saveOTPSession(
                            resdata.data.sessionToken,
                            resdata.data.expiresIn
                        );
                    }

                    return {
                        success: true,
                        expiresIn: resdata.data.expiresIn,
                        message: resdata.message
                    }

            } catch (error) {
                throw new Error('Failed to resend OTP');
            }
        },

        async completeRegister(userData: RequestOTP){
            try {
                    const verificationToken = await SecureStorage.getVerificationToken();
                    
                    if(!verificationToken) throw new Error('No verification token found');
                    const response = await api.post('/auth/register', userData, {
                        headers: {
                            Authorization: `Bearer ${verificationToken}`
                        }
                    });
                    return {
                        success: true,
                        message: response.data.message
                    };
            } catch (err) {
                throw new Error('Registration failed');
            }
        }
    }
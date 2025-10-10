import { useMutation } from "@tanstack/react-query";
import { otpService } from "@/services/otpService";
import { SecureStorage } from "@/services/secureStorage";
import { UserAuthInput } from "@/types/user.types";

export const useRequestOTP = () => {
    return useMutation({
        mutationFn: otpService.requestOtp,
        onSuccess: () => {
            console.log("OTP requested successfully");
        },
        onError: (error) => {
            console.error("Error requesting OTP:", error);
        },
    });
}

export const useVerifyOTP = (otp:string, phone:string) => {
    return useMutation({
        mutationFn: () => otpService.verifyOtp(otp, phone),
        onSuccess: async (data) => {
            console.log("OTP verified successfully");
        },
        onError: (error) => {
            console.error("Error verifying OTP:", error);
        },
    });
}

export const useResendOTP = () => {
    return useMutation({
        mutationFn: otpService.resendOTP,
        onSuccess: () => {
            console.log("OTP resent successfully");
        },
        onError: (error) => {
            console.error("Error resending OTP:", error);
        },
    });
}

export const useCompleteRegisteration = (data: UserAuthInput) => {
    return useMutation({
        mutationFn: () => otpService.completeRegister(data),
        onSuccess: async (data) => {
            console.log("Registration completed successfully");
            await SecureStorage.clearAll();
        }
    });
}

export const useOTPSession = () => {
    const checkSession = async () => {
        const token = await SecureStorage.getOTPSessionToken();
        const isExpired = await SecureStorage.isOTPSessionExpired();
        
        return {
            hasSession: !!token,
            isExpired,
        };
    };

  return { checkSession };
};
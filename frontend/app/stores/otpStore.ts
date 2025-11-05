import { create } from "zustand";
import { otpService } from "@/services/otpService";
import { RegisterRequest, RequestOTP, User } from "@/types/user.types";

interface OtpState{
    countdown:number;
    canResend:boolean;
    attempts:number;

    isRequesting:boolean;
    isVerifying:boolean;
    isResending:boolean;
    otp:number[],
    requestError:string | null;
    verifyError:string | null;
    resendError:string | null;
    
    setOtp: (otp:number,index:number) => void,
    requestOtp: (payload: RegisterRequest) => Promise<void>;
    verifyOtp: (otp:string) => Promise<{
        success: boolean;
        user: User;
        tokens: {
            accessToken: string;
            refreshToken: string;
            accessTokenExpiresAt: string | null;
            refreshTokenExpiresAt: string | null;
        };
        message: string;
    } | void>;
    resendOtp: () => Promise<void>;

    setCountdown: (seconds:number) => void;
    decrementCountdown: () => void;
    resetState: () => void;
}

const threeMinute = 1000 * 60 * 3; // 3 นาที

export const useOtpStore = create<OtpState>((set,get) => ({
    countdown:0,
    canResend:false,
    attempts:0,
    isRequesting:false,
    isVerifying:false,
    isResending:false,
    requestError:null,
    verifyError:null,
    resendError:null,
    otp:Array(6).fill(0),
    setOtp: (otp:number,index:number) => {
        const currentOtp = get().otp;
        
        const newOtp = [...currentOtp];
        newOtp[index] = otp;
        set({ otp: newOtp });
    },

    requestOtp: async (payload:RegisterRequest) => {
        const { canResend, attempts } = get();
        if(!canResend && attempts >= 3){
            set((state) => ({canResend:true, attempts:state.attempts + 1}));
            return;
        }
        set({isRequesting:true, requestError:null});
        try {
            await otpService.requestOtp({
                phone: payload.phone,
                email: payload.email,
                password: payload.password
            });
            set({isRequesting:false, countdown:threeMinute, canResend:false, attempts:0});
        } catch (error:any) {
            set({isRequesting:false, requestError: error.message || 'Failed to request OTP'});
        }
    },

    verifyOtp: async (otp:string) => {
        set({isVerifying:true, verifyError:null});
        try {
            const response = await otpService.verifyOtp(otp);
            set({isVerifying:false});
            return response;
        } catch (error:any) {
            set({isVerifying:false, verifyError: error.message || 'Failed to verify OTP'});
        }
    },

    resendOtp: async () => {
        set({isResending:true, resendError:null});
        try {
            await otpService.resendOTP();
            set((state) => ({
                isResending:false,
                countdown: threeMinute,
                canResend: false,
                attempts: state.attempts + 1
            }));
        } catch (error:any) {
            set({isResending:false, resendError: error.message || 'Failed to resend OTP'});
        }
    },

    setCountdown: (seconds:number) => {
        set({countdown:seconds});
    },

    decrementCountdown: () => {
        set((state) => {
            const newCountDown = state.countdown > 0 ? state.countdown - 1 : 0;
            return {
                countdown: newCountDown,
                canResend: newCountDown === 0 ? true : state.canResend
            }
        });
    },

    resetState: () => {
        set({
            countdown:0,
            canResend:false,
            attempts:0,
            isRequesting:false,
            isVerifying:false,
            isResending:false,
            requestError:null,
            verifyError:null,
            resendError:null,
            otp:Array(6).fill(0),
        });
    }
}));

import React, {createContext, useContext, useState} from "react";
import { SecureStorage } from "@/services/secureStorage";
import { UserAuthInput } from "@/types/user.types";

interface RegistrationContextType {
    userData: UserAuthInput | null;
    setUserData: (data: UserAuthInput) => void;
    clearUserData: () => void;
    hasActiveSession: () => Promise<boolean>;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [userData, setUserDataState] = useState<UserAuthInput | null>(null);

    const setUserData = async (data: UserAuthInput) => {
        setUserDataState(data);
        await SecureStorage.saveTempUserData(data);
    };

    const clearUserData = () => {
        setUserDataState(null);
    };

    const hasActiveSession = async () => {
        const token = await SecureStorage.getOTPSessionToken();
        const isExpired = await SecureStorage.isOTPSessionExpired();
        
        return !!token && !isExpired;
    };

    return (
        <RegistrationContext.Provider value={{ 
            userData,
            setUserData,
            clearUserData,
            hasActiveSession
            }}>
            {children}
        </RegistrationContext.Provider>
    );
}

export const useRegistration = (): RegistrationContextType => {
    const context = useContext(RegistrationContext);
    if (!context) {
        throw new Error("useRegistration must be used within a RegistrationProvider");
    }
    return context;
};
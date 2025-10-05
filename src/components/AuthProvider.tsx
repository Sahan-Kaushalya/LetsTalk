import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
    userId: string | null;
    userStatus: string | null;
    isLoading: boolean;
    signUp: (id: string) => Promise<void>;
    signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

export const USER_ID_KEY = "userId"; // saved name on AsyncStorage
export const USER_STATUS_KEY = "userStatus"; // saved name on AsyncStorage

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [userStatus, setUserStatus] = useState<string | null>(null);
    const [isLoading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            try {
                const storeId = await AsyncStorage.getItem(USER_ID_KEY);
                const loginStatus = await AsyncStorage.getItem(USER_STATUS_KEY);
                setUserId(storeId);
                setUserStatus(loginStatus);
            } catch (error) {
                console.error("Error retrieving userId from storage:", error);
            }finally{
                setTimeout(() => {
                    setLoading(false);
                }, 4000);
            }
        })();
    }, []);

    const signUp = async (id: string) => {
        await AsyncStorage.setItem(USER_ID_KEY,id);
        await AsyncStorage.setItem(USER_STATUS_KEY,"login");
        setUserId(id);
        setUserStatus("login");
    };


    const signOut = async () => {
        await AsyncStorage.removeItem(USER_ID_KEY);
        await AsyncStorage.removeItem(USER_STATUS_KEY);
        setUserId(null);
        setUserStatus(null);
    };

    // when calling this hook, if any value inside the dependency array changes, 
    // the value will be recalculated.

    const value = useMemo(()=>({
        userId,isLoading,userStatus,signUp,signOut
    }),[userId,isLoading,userStatus]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


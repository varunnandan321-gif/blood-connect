"use client";
import { createContext, useContext } from "react";

export const AuthContext = createContext<any>({ user: null, userData: null });

export function useAuth() {
    return useContext(AuthContext);
}

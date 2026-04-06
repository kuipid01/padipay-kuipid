"use client"
import React, { createContext, useContext, useState } from "react";

interface ConsentContextType {
    consented: boolean;
    setConsented: (val: boolean) => void;
    skipConsent: boolean;
    setSkipConsent: (val: boolean) => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider = ({ children, defaultValue = false }: { children: React.ReactNode, defaultValue?: boolean }) => {
    const [consented, setConsented] = useState(defaultValue);
    const [skipConsent, setSkipConsent] = useState(false);

    return (
        <ConsentContext.Provider value={{ consented, setConsented, skipConsent, setSkipConsent }}>
            {children}
        </ConsentContext.Provider>
    );
};

export const useConsent = () => {
    const context = useContext(ConsentContext);
    if (!context) {
        throw new Error("useConsent must be used within a ConsentProvider");
    }
    return context;
};

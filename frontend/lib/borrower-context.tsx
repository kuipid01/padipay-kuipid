"use client"
import React from "react";

export const BorrowerDataContext = React.createContext<any>(null);

export const BorrowerProvider = ({ children, value }: { children: React.ReactNode, value: any }) => {
    return (
        <BorrowerDataContext.Provider value={value}>
            {children}
        </BorrowerDataContext.Provider>
    );
};
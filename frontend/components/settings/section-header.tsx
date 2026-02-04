import React, { ReactNode } from 'react'

export function SectionHeader({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-center gap-4 mb-2">
            <div className="size-14 rounded-3xl bg-lemon-primary/20 flex items-center justify-center text-main-green shrink-0">
                {icon}
            </div>
            <div>
                <h2 className="text-2xl font-black text-main-green">{title}</h2>
                <p className="text-gray-500 font-medium">{description}</p>
            </div>
        </div>
    );
}
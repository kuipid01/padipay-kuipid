import React from 'react'
import { cn } from '../../lib/utils';

const ButtonPrimary = ({
    text,
    href,
    onClick,
    className,
    disabled,
    children,
    variant = "default",
    size = "default",
    type = "button",
    ...props
}: {
    text: string;
    href?: string;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    children?: React.ReactNode;
    variant?: "default" | "outline" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    type?: "button" | "submit" | "reset";
}) => {
    return (
        <button
            onClick={onClick}
            className={cn("bg-lemon-primary cursor-pointer text-black font-medium text-[15px] px-6 py-3 rounded-[10px]", className)}
            disabled={disabled}
            type={type}
            {...props}
        >
            {text}
        </button>
    )
}

export default ButtonPrimary
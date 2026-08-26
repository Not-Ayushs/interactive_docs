import React from 'react';

export default function CapsuleButton({ label, children, type = "outline", onClick, className = "", buttonType = "button", disabled = false }) {
    const baseStyle = "flex items-center justify-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
    const activeStyle = "bg-white text-black hover:bg-zinc-200 shadow-md font-semibold";
    const outlineStyle = "text-white bg-transparent border-2 border-amber-50 hover:bg-amber-50 hover:text-black";

    const variantStyle = type === "active" ? activeStyle : outlineStyle;

    return (
        <button
            type={buttonType}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variantStyle} ${className}`}
        >
            {children || label}
        </button>
    );
}
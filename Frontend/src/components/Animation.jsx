import React from 'react';

export default function Animation() {
    return (
        <div className="relative flex items-center justify-center w-80 h-96 select-none group cursor-pointer">
            {/* Base Stack Real Background Image */}
            <div className="w-full h-full relative flex items-center justify-center drop-shadow-2xl">
                <img
                    src="/stackreal.png"
                    alt="Stack Real"
                    className="w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-300"
                />
            </div>

            {/* Before Hover Image (Default visible) */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <img
                    src="/BEFOREHOVER.png"
                    alt="Before Hover"
                    className="w-[85%] h-[85%] object-contain opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                />
            </div>

            {/* Hero Card Image (Visible on Hover with smooth reveal) */}
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <img
                    src="/HeroCard.png"
                    alt="Hero Card"
                    className="w-[85%] h-[85%] object-contain opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"
                />
            </div>
        </div>
    );
}
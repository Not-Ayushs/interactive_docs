import React from 'react';
import { Link } from 'react-router-dom';
import CapsuleButton from '../components/CapsuleButton.jsx';
import Animation from '../components/Animation.jsx';

export default function Hero() {
    return (
        <section id="home" className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-6 sm:px-10 max-w-7xl mx-auto min-h-[85vh] flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full">
                
                {/* Left Column: Text Content & CTAs */}
                <div className="lg:col-span-7 flex flex-col items-start text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-5 sm:mb-6">
                        <span>✨ Interactive Knowledge Base</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight">
                        Turn your knowledge <br />
                        <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                            into an interactive
                        </span> <br />
                        workspace.
                    </h1>
                    
                    <h3 className="mt-4 sm:mt-6 text-zinc-300 text-base sm:text-xl lg:text-2xl font-medium">
                        Documentation, notes, and collaboration — all in one place.
                    </h3>
                    
                    <p className="mt-3 sm:mt-4 text-zinc-400 max-w-xl text-sm sm:text-base leading-relaxed">
                        Create, organize, edit, and share documentation and quick notes in one collaborative workspace 
                        designed to make knowledge easier to manage and work with.
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8 w-full">
                        <Link to="/app/dashboard" className="w-full sm:w-auto">
                            <CapsuleButton label="Get Started" type="active" className="w-full sm:w-auto px-7 py-3 text-base font-bold shadow-lg shadow-white/10" />
                        </Link>
                        <Link to="/app/dashboard" className="w-full sm:w-auto">
                            <CapsuleButton label="View Demo" type="outline" className="w-full sm:w-auto px-7 py-3 text-base font-bold" />
                        </Link>
                    </div>
                </div>

                {/* Right Column: Animation Card Stack — hidden on mobile, visible on lg+ */}
                <div className="hidden lg:flex lg:col-span-5 justify-center lg:justify-end items-center">
                    <Animation />
                </div>

            </div>
        </section>
    );
}
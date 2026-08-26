import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { FiHome, FiFolder, FiLogOut } from 'react-icons/fi';
import CapsuleButton from './CapsuleButton';

export default function AppNavbar() {
    const location = useLocation();

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-[#0A0E15]/85 backdrop-blur-md border-b border-zinc-800/60 px-8 py-3.5 flex items-center justify-between shadow-lg">
            {/* Left: Brand Logo linking back to Landing */}
            <Link 
                to="/" 
                className="flex items-center gap-2 group transition-transform active:scale-95" 
                title="DOCS. Home - Return to Landing Page"
            >
                <span className="text-white font-bold text-2xl tracking-widest uppercase">
                    DOCS<span className="text-white">.</span>
                </span>
            </Link>

            {/* Center: Dashboard and Collections Tabs */}
            <nav className="flex items-center gap-3">
                <NavLink to="/app/dashboard">
                    <CapsuleButton
                        type={location.pathname === '/app/dashboard' ? 'active' : 'outline'}
                    >
                        <FiHome className="text-base" />
                        <span>Dashboard</span>
                    </CapsuleButton>
                </NavLink>

                <NavLink to="/app/collections">
                    <CapsuleButton
                        type={location.pathname.startsWith('/app/collections') ? 'active' : 'outline'}
                    >
                        <FiFolder className="text-base" />
                        <span>Collections</span>
                    </CapsuleButton>
                </NavLink>
            </nav>

            {/* Right: Exit App Icon Button */}
            <Link 
                to="/" 
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all duration-200 text-xs font-medium border border-transparent hover:border-zinc-700"
                title="Exit App (Return to Landing Page)"
            >
                <FiLogOut className="text-sm text-white" />
                <span>Exit App</span>
            </Link>
        </header>
    );
}

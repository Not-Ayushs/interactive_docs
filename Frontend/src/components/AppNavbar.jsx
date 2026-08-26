import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiFolder } from 'react-icons/fi';

export default function AppNavbar() {
    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-[#0A0E15]/80 backdrop-blur-md border-b border-zinc-800/60 px-8 py-3.5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-black text-sm shadow-md shadow-emerald-500/20">
                    D
                </div>
                <span className="text-white font-semibold text-lg tracking-wide">
                    Docs<span className="text-emerald-400">.</span>
                </span>
            </div>

            <nav className="flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800/80">
                <NavLink
                    to="/app/dashboard"
                    className={({ isActive }) =>
                        `flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md font-semibold'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`
                    }
                >
                    <FiHome className="text-base" />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/app/collections"
                    className={({ isActive }) =>
                        `flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md font-semibold'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`
                    }
                >
                    <FiFolder className="text-base" />
                    <span>Collections</span>
                </NavLink>
            </nav>
        </header>
    );
}

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar, setSidebarOpen } from '../store/uiSlice';
import { 
    FiMenu, FiLayout, FiCommand, FiFolder, 
    FiUser, FiMessageSquare, FiPlus, FiLogOut, FiMap
} from "react-icons/fi";
import { BiLayer } from "react-icons/bi";

export default function Sidebar() {
    const isOpen = useSelector((state) => state.ui.sidebarOpen);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    let userInitials = "U";
    let userName = "User";
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.name) {
            userName = userInfo.name;
            userInitials = userInfo.name.substring(0, 2).toUpperCase();
        } else if (userInfo && userInfo.email) {
            userName = userInfo.email.split('@')[0];
            userInitials = userName.substring(0, 2).toUpperCase();
        }
    } catch (e) {
        // Fallback
    }

    return (
        <div className={`fixed left-0 top-0 h-full bg-[#0A0A0A] border-r border-zinc-800/50 z-50 text-zinc-400 flex flex-col transition-all duration-300 ${isOpen ? 'w-[240px] translate-x-0' : 'w-[80px] -translate-x-full sm:translate-x-0'}`}>
            
            {/* Top Mac-like buttons & Toggle */}
            <div className="flex items-center gap-2 p-4 h-16 shrink-0 mt-2">

                {isOpen && (
                    <button 
                        onClick={() => dispatch(setSidebarOpen(false))} 
                        className="ml-auto p-1.5 hover:bg-zinc-800/50 rounded-lg cursor-pointer text-zinc-400 hover:text-white transition-colors"
                    >
                        <FiMenu size={20} />
                    </button>
                )}
                {!isOpen && (
                    <button 
                        onClick={() => dispatch(setSidebarOpen(true))} 
                        className="mx-auto mt-6 p-1.5 hover:bg-zinc-800/50 rounded-lg cursor-pointer text-zinc-400 hover:text-white transition-colors absolute top-12 left-1/2 -translate-x-1/2"
                    >
                        <FiMenu size={20} />
                    </button>
                )}
            </div>

            {/* Navigation links */}
            <nav className={`flex flex-col gap-1 px-4 mt-6 ${!isOpen ? 'items-center px-2 mt-16' : ''}`}>
                
                {/* Project Header */}
                <NavLink to="/app/dashboard" className={({isActive}) => `flex items-center gap-3 p-2.5 rounded-xl transition-all group ${isActive ? 'bg-[#2B2D31] text-white' : 'hover:bg-zinc-800/30'}`}>
                    <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <BiLayer size={16} />
                    </div>
                    {isOpen && <span className="font-semibold text-sm truncate">{userName}'s Project</span>}
                </NavLink>

                <div className="h-4"></div> {/* Spacer */}

                <NavLink to="/app/dashboard" className={({isActive}) => `flex items-center gap-3 p-2.5 rounded-xl transition-all group ${isActive ? 'text-white' : 'hover:bg-zinc-800/30'}`}>
                    <FiLayout size={18} className="group-hover:text-white shrink-0" />
                    {isOpen && <span className="font-medium text-sm transition-opacity duration-200">Board</span>}
                </NavLink>

                <NavLink to="/app/collections" className={({isActive}) => `flex items-center gap-3 p-2.5 rounded-xl transition-all group ${isActive ? 'text-white' : 'hover:bg-zinc-800/30'}`}>
                    <FiFolder size={18} className="group-hover:text-white shrink-0" />
                    {isOpen && <span className="font-medium text-sm transition-opacity duration-200">Files</span>}
                </NavLink>

                <NavLink to="/app/account" className="flex items-center gap-3 p-2.5 hover:bg-zinc-800/30 rounded-xl transition-all group">
                    <FiUser size={18} className="group-hover:text-white shrink-0" />
                    {isOpen && <span className="font-medium text-sm transition-opacity duration-200">My account</span>}
                </NavLink>

                <button className="flex items-center gap-3 p-2.5 hover:bg-zinc-800/30 rounded-xl transition-all group mt-2 text-zinc-500 hover:text-zinc-300">
                    <FiPlus size={18} className="shrink-0" />
                    {isOpen && <span className="font-medium text-sm transition-opacity duration-200">Add section</span>}
                </button>
            </nav>

            <div className="mt-auto p-4 mb-4 flex items-center justify-between">
                <div className={`flex items-center gap-3 ${!isOpen ? 'justify-center w-full' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold overflow-hidden flex items-center justify-center shrink-0 border border-zinc-700">
                        {userInitials}
                    </div>
                </div>
                {isOpen && (
                    <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/50 rounded-lg transition-all" title="Logout">
                        <FiLogOut size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}
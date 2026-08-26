import React from 'react';
import { Link } from 'react-router-dom';
import CapsuleButton from './CapsuleButton';

export default function Navbar() {
    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E15]/90 backdrop-blur-md border-b border-zinc-800/60 px-10 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-white text-2xl font-extrabold tracking-tight hover:opacity-90 transition-opacity">
                iDOCS<span className="text-white">.</span>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center gap-10 text-white font-semibold text-sm tracking-wide">
                <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="hover:text-zinc-300 transition-colors">
                    Home
                </a>
                <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-zinc-300 transition-colors">
                    Features
                </a>
                <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-zinc-300 transition-colors">
                    About
                </a>
                <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-zinc-300 transition-colors">
                    Price
                </a>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
                <Link to="/app/dashboard">
                    <CapsuleButton label="Sign In" type="outline" className="px-6 py-2 text-sm font-semibold" />
                </Link>
                <Link to="/app/dashboard">
                    <CapsuleButton label="Sign Up" type="active" className="px-6 py-2 text-sm font-semibold" />
                </Link>
            </div>
        </header>
    );
}
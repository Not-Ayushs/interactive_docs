import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CapsuleButton from './CapsuleButton';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileOpen(false);
    };

    const navLinks = [
        { label: 'Home', id: 'home' },
        { label: 'Features', id: 'features' },
        { label: 'About', id: 'about' },
        { label: 'Price', id: 'pricing' },
    ];

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E15]/90 backdrop-blur-md border-b border-zinc-800/60 px-6 sm:px-10 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-white text-2xl font-extrabold tracking-tight hover:opacity-90 transition-opacity flex-shrink-0">
                    iDOCS<span className="text-white">.</span>
                </Link>

                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-white font-semibold text-sm tracking-wide">
                    {navLinks.map(link => (
                        <a
                            key={link.id}
                            href={`#${link.id}`}
                            onClick={(e) => scrollToSection(e, link.id)}
                            className="hover:text-zinc-300 transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* Desktop Action Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <Link to="/app/dashboard">
                        <CapsuleButton label="Sign In" type="outline" className="px-5 py-2 text-sm font-semibold" />
                    </Link>
                    <Link to="/app/dashboard">
                        <CapsuleButton label="Sign Up" type="active" className="px-5 py-2 text-sm font-semibold" />
                    </Link>
                </div>

                {/* Mobile Hamburger Button */}
                <button
                    onClick={() => setMobileOpen(prev => !prev)}
                    className="md:hidden text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                </button>
            </header>

            {/* Mobile Dropdown Menu */}
            {mobileOpen && (
                <div className="fixed top-[65px] left-0 right-0 z-40 bg-[#0A0E15]/98 backdrop-blur-xl border-b border-zinc-800 flex flex-col px-6 pt-4 pb-6 gap-5 shadow-2xl md:hidden">
                    {navLinks.map(link => (
                        <a
                            key={link.id}
                            href={`#${link.id}`}
                            onClick={(e) => scrollToSection(e, link.id)}
                            className="text-white font-semibold text-base hover:text-amber-300 transition-colors border-b border-zinc-800/60 pb-4"
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="flex flex-col gap-3 pt-2">
                        <Link to="/app/dashboard" onClick={() => setMobileOpen(false)}>
                            <CapsuleButton label="Sign In" type="outline" className="w-full py-2.5 text-sm font-semibold" />
                        </Link>
                        <Link to="/app/dashboard" onClick={() => setMobileOpen(false)}>
                            <CapsuleButton label="Sign Up" type="active" className="w-full py-2.5 text-sm font-semibold" />
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
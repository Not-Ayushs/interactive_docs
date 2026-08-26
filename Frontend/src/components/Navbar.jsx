import React from 'react';
import { Link } from 'react-router-dom';
import CapsuleButton from './CapsuleButton';

export default function Navbar() {
    return (
        <div className="nav flex justify-between items-center">
            <Link to="/" className="logo text-white text-2xl font-extrabold mr-20 hover:opacity-90">
                iDOCS<span className="text-emerald-400">.</span>
            </Link>
            
            <div className="pages flex text-white text-base font-medium gap-8">
                <a href="#templates" className="hover:text-emerald-400 transition-colors">Templates</a>
                <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
                <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
                <a href="#about" className="hover:text-emerald-400 transition-colors">About</a>
            </div>

            <div className="sign flex items-center gap-3">
                <Link to="/app/dashboard">
                    <CapsuleButton label="Login" type="active" />
                </Link>
                <Link to="/app/dashboard">
                    <CapsuleButton label="Open App" type="outline" />
                </Link>
            </div>
        </div>
    );
}
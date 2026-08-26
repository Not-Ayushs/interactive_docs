import React from 'react';
import { Link } from 'react-router-dom';
import CapsuleButton from '../components/CapsuleButton.jsx';

export default function Hero() {
    return (
        <div className="hero flex flex-col justify-center items-center text-center">
            <h1 className="text-[5.5vw] leading-[1.1] font-extrabold text-[#b36315ff] text-center">
                Turn your knowledge <br /> into an interactive <br /> workspace.
            </h1>
            
            <h3 className="mt-8 text-slate-400 text-2xl font-medium">
                Documentation, notes, and collaboration — all in one place.
            </h3>
            
            <p className="mt-5 text-zinc-300 max-w-2xl text-base leading-relaxed">
                Create, organize, edit, and share documentation and quick notes in one collaborative workspace 
                designed to make knowledge easier to manage and work with.
            </p>

            <div className="hero-btns flex justify-center items-center gap-4 mt-10">
                <Link to="/app/dashboard">
                    <CapsuleButton label="Get Started" type="active" />
                </Link>
                <Link to="/app/dashboard">
                    <CapsuleButton label="View Demo" type="outline" />
                </Link>
            </div>
        </div>
    );
}
import React from 'react';
import { Link } from 'react-router-dom';
import CapsuleButton from '../components/CapsuleButton.jsx';

const Prank = () => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0A0E15] text-center p-6 relative overflow-hidden">
            {/* Background elements to make it look technical before the prank */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#0A0E15] to-[#0A0E15]"></div>
            
            <div className="z-10 flex flex-col items-center max-w-lg">
                <div className="text-red-500 font-mono text-xl mb-4 font-bold border border-red-500/30 bg-red-500/10 px-4 py-1 rounded">
                    ACCESS DENIED
                </div>
                
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                    Nice Try!
                </h1>
                
                <p className="text-zinc-400 text-lg mb-8 font-mono">
                    Did you really think you could find hidden files here? 
                    <br/><br/>
                    Logging IP Address... <span className="text-emerald-400 animate-pulse">192.168.x.x</span>
                    <br/>
                    Initiating self-destruct sequence...
                </p>

                {/* Funny rickroll GIF or image */}
                <div className="w-64 h-64 rounded-xl overflow-hidden mb-10 border-4 border-zinc-800 shadow-2xl">
                    <img 
                        src="https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif" 
                        alt="Rickroll" 
                        className="w-full h-full object-cover"
                    />
                </div>

                <Link to="/">
                    <CapsuleButton label="Kindly Get Lost!" type="outline" />
                </Link>
            </div>
        </div>
    );
};

export default Prank;

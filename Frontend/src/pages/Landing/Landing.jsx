import React from 'react';
import Navbar from '../../components/Navbar.jsx';
import Hero from '../../sections/Hero.jsx';
import Mockup from '../../sections/Mockup.jsx';
import Showcase from '../../sections/Showcase.jsx';
import About from '../../sections/About.jsx';
import Pricing from '../../sections/Pricing.jsx';

export default function Landing() {
    return (
        <div className="relative w-full h-screen overflow-y-auto bg-[#0A0E15] text-white scroll-smooth">
            <Navbar />
            <main>
                <Hero />
                <Mockup />
                <Showcase />
                <About />
                <Pricing />
            </main>

            <footer className="py-10 sm:py-12 border-t border-zinc-800/80 text-center text-zinc-500 text-xs font-medium px-6">
                <p>© {new Date().getFullYear()} iDOCS. All rights reserved. Interactive Knowledge Base & Documentation.</p>
            </footer>
        </div>
    );
}

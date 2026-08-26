import React from 'react';
import { FiLayers, FiFileText, FiFolder, FiZap } from 'react-icons/fi';

const FEATURES = [
    {
        icon: FiFolder,
        title: 'Folder Collections',
        desc: 'Organize notes and documents into custom folders with dynamic empty and filed folder visual indicators.'
    },
    {
        icon: FiFileText,
        title: 'Full-Page Rich Editor',
        desc: 'Experience a distraction-free Google Docs-style document editor with Tiptap formatting capabilities.'
    },
    {
        icon: FiZap,
        title: 'MongoDB Cloud Sync',
        desc: 'Seamlessly store and fetch your documents in real-time with Express and MongoDB Atlas integration.'
    },
    {
        icon: FiLayers,
        title: 'Interactive UI & Dragging',
        desc: 'Fluid drag-and-drop document cards built with Framer Motion animations and responsive dark glassmorphism.'
    }
];

export default function About() {
    return (
        <section id="about" className="py-16 sm:py-24 px-6 sm:px-10 max-w-7xl mx-auto border-t border-zinc-800/80">
            <div className="text-center mb-10 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
                    <span>ABOUT IDOCS</span>
                </div>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                    Designed for effortless knowledge management
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base lg:text-lg mt-4 max-w-2xl mx-auto font-normal">
                    Everything you need to write, organize, and manage technical documentation in one place.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {FEATURES.map((item, idx) => (
                    <div
                        key={idx}
                        className="bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-6 flex flex-col items-start transition-all duration-300 hover:-translate-y-1 shadow-lg"
                    >
                        <div className="w-10 h-10 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-bold mb-4 shadow-md">
                            <item.icon size={20} />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                        <p className="text-zinc-400 text-xs leading-relaxed font-normal">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

import React from 'react';
import { FiCheckCircle, FiFolder } from 'react-icons/fi';

export default function Showcase() {
    return (
        <section id="features" className="py-16 sm:py-24 px-6 sm:px-10 max-w-7xl mx-auto border-t border-zinc-800/80">
            <div className="text-center mb-10 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
                    <span>PRODUCT FEATURES</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
                    Built for fast, modern documentation workflows
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base lg:text-lg mt-4 max-w-2xl mx-auto font-normal">
                    Experience dynamic search, scoped collections, and full-page writing tools.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Feature 1 — Search: Video Card */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col hover:border-zinc-700 transition-all duration-300 group">
                    {/* Video */}
                    <div className="relative w-full overflow-hidden bg-black rounded-t-3xl">
                        <video
                            src="/search.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-48 sm:h-56 object-cover block group-hover:scale-[1.02] transition-transform duration-500"
                        />
                        {/* Subtle gradient overlay at bottom of video */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-900/80 to-transparent pointer-events-none" />
                    </div>

                    {/* Text content */}
                    <div className="p-6 flex flex-col flex-1 justify-between">
                        <div>
                            <h3 className="text-white font-bold text-lg sm:text-xl mb-2">Real-time Search Filter</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed font-normal mb-4">
                                Filter through all your document cards instantly — just type and results update live across titles and content snippets.
                            </p>
                        </div>
                        <div className="pt-4 border-t border-zinc-800/80">
                            <span className="text-xs text-amber-300 font-semibold flex items-center gap-2">
                                <FiCheckCircle size={14} /> Instant live search
                            </span>
                        </div>
                    </div>
                </div>

                {/* Feature 2 — Collections: Standard Card */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700 transition-all duration-300">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-white text-zinc-950 flex items-center justify-center font-bold mb-6 shadow-md">
                            <FiFolder size={22} />
                        </div>
                        <h3 className="text-white font-bold text-lg sm:text-xl mb-3">Scoped Collections</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-normal">
                            Group document notes into custom category folders. Dynamic folder graphics indicate filled vs empty collections at a glance.
                        </p>
                    </div>
                    <div className="pt-4 border-t border-zinc-800/80">
                        <span className="text-xs text-amber-300 font-semibold flex items-center gap-2">
                            <FiCheckCircle size={14} /> Dynamic folder states
                        </span>
                    </div>
                </div>

                {/* Feature 3 — Editor: Video Card */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col hover:border-zinc-700 transition-all duration-300 group">
                    {/* Video */}
                    <div className="relative w-full overflow-hidden bg-black rounded-t-3xl">
                        <video
                            src="/editor.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-48 sm:h-56 object-cover block group-hover:scale-[1.02] transition-transform duration-500"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-900/80 to-transparent pointer-events-none" />
                    </div>

                    {/* Text content */}
                    <div className="p-6 flex flex-col flex-1 justify-between">
                        <div>
                            <h3 className="text-white font-bold text-lg sm:text-xl mb-2">Google Docs-Style Editor</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed font-normal mb-4">
                                Write in a full-page scrollable paper canvas with Tiptap rich formatting. Save changes directly to MongoDB Atlas in the cloud.
                            </p>
                        </div>
                        <div className="pt-4 border-t border-zinc-800/80">
                            <span className="text-xs text-amber-300 font-semibold flex items-center gap-2">
                                <FiCheckCircle size={14} /> Full-screen paper view
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
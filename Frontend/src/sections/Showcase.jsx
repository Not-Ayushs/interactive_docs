import React from 'react';
import { Link } from 'react-router-dom';
import CapsuleButton from '../components/CapsuleButton.jsx';
import { FiCheckCircle, FiSearch, FiFolder, FiEdit3 } from 'react-icons/fi';

export default function Showcase() {
    return (
        <section id="features" className="py-24 px-10 max-w-7xl mx-auto border-t border-zinc-800/80">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
                    <span>PRODUCT FEATURES</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                    Built for fast, modern documentation workflows
                </h2>
                <p className="text-zinc-400 text-base sm:text-lg mt-4 max-w-2xl mx-auto font-normal">
                    Experience dynamic search, scoped collections, and full-page writing tools.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between hover:border-zinc-700 transition-all duration-300">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-white text-zinc-950 flex items-center justify-center font-bold mb-6 shadow-md">
                            <FiSearch size={22} />
                        </div>
                        <h3 className="text-white font-bold text-xl mb-3">Real-time Search Filter</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-normal">
                            Filter through hundreds of project notes instantly with full-text search across titles and content snippets.
                        </p>
                    </div>
                    <div className="pt-4 border-t border-zinc-800/80">
                        <span className="text-xs text-amber-300 font-semibold flex items-center gap-2">
                            <FiCheckCircle size={14} /> Instant live search
                        </span>
                    </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between hover:border-zinc-700 transition-all duration-300">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-white text-zinc-950 flex items-center justify-center font-bold mb-6 shadow-md">
                            <FiFolder size={22} />
                        </div>
                        <h3 className="text-white font-bold text-xl mb-3">Scoped Collections</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-normal">
                            Group document notes into custom category folders. Dynamic folder graphics indicate filled vs empty collections.
                        </p>
                    </div>
                    <div className="pt-4 border-t border-zinc-800/80">
                        <span className="text-xs text-amber-300 font-semibold flex items-center gap-2">
                            <FiCheckCircle size={14} /> Dynamic folder states
                        </span>
                    </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between hover:border-zinc-700 transition-all duration-300">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-white text-zinc-950 flex items-center justify-center font-bold mb-6 shadow-md">
                            <FiEdit3 size={22} />
                        </div>
                        <h3 className="text-white font-bold text-xl mb-3">Google Docs-Style Editor</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-normal">
                            Write seamlessly in a full-page scrollable paper view featuring Tiptap rich formatting and instant MongoDB cloud saving.
                        </p>
                    </div>
                    <div className="pt-4 border-t border-zinc-800/80">
                        <span className="text-xs text-amber-300 font-semibold flex items-center gap-2">
                            <FiCheckCircle size={14} /> Full-screen paper view
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
import React from 'react';

export default function Mockup() {
    return (
        <section id="mockup" className="py-16 sm:py-24 px-6 sm:px-10">
            <div className="max-w-6xl mx-auto text-center">
                {/* Section label */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
                    <span>Product Preview</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3">
                    See iDOCS in action
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-10 sm:mb-14 font-normal">
                    A clean, distraction-free workspace for your documentation needs.
                </p>

                {/* Mockup Image Container */}
                <div className="relative mx-auto max-w-5xl">
                    {/* Glow effect behind the image */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-500/10 via-white/5 to-transparent rounded-3xl blur-3xl scale-110" />

                    {/* Outer frame */}
                    <div className="rounded-2xl sm:rounded-3xl border border-zinc-700/60 bg-zinc-900/50 p-1.5 sm:p-2.5 shadow-2xl shadow-black/60 backdrop-blur-sm">
                        {/* Inner frame top bar */}
                        <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800/80 shadow-inner">
                            {/* Browser-style top bar */}
                            <div className="bg-zinc-900 flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800/80">

                                <div className="flex-1 mx-4">
                                    <div className="bg-zinc-800/80 rounded-md px-3 py-1 text-[10px] text-zinc-500 font-mono text-left w-full max-w-xs mx-auto truncate">
                                        interactive-docs.vercel.app/app/dashboard
                                    </div>
                                </div>
                            </div>

                            {/* Mockup Screenshot */}
                            <img
                                src="/Screenshot 2026-08-26 204315.png"
                                alt="iDOCS Dashboard Mockup"
                                className="w-full h-auto object-cover block"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiRefreshCw, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { FaTrashAlt } from 'react-icons/fa';

// Web Audio API Synthesizer for instant satisfying sound effects without external audio files
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playShred() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const duration = 0.55;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Pink/crunch noise generation for paper crunch
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            const pink = b0 + b1 + b2 + white * 0.5362;
            // Decay
            const envelope = Math.exp(-3 * (i / bufferSize));
            data[i] = pink * 0.12 * envelope;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + duration);
        filter.Q.value = 2.5;

        noise.connect(filter);
        filter.connect(this.ctx.destination);
        noise.start();
    }

    playWhoosh() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.65);
    }

    playCrumple() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.setValueAtTime(140, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    playPop() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }
}

const sounds = new SoundEngine();

export default function StressBusterMode({ documents, onClose }) {
    // Local list of cards in playground (not modifying DB)
    const [playDocs, setPlayDocs] = useState(() => {
        return (documents || []).map((doc, idx) => ({
            ...doc,
            playId: doc._id || `doc-${idx}`,
            x: 60 + (idx % 4) * 260,
            y: 110 + Math.floor(idx / 4) * 220,
            rotation: (Math.random() - 0.5) * 16,
            isShredded: false,
            isPlane: false,
            isBoat: false,
            isCrumpled: false,
        }));
    });

    const [shredCount, setShredCount] = useState(0);
    const [launchCount, setLaunchCount] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [toastMessage, setToastMessage] = useState("Drag docs around, throw them, or feed them to the shredder!");
    const [isNearShredder, setIsNearShredder] = useState(false);

    const shredderRef = useRef(null);

    useEffect(() => {
        sounds.muted = isMuted;
    }, [isMuted]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3500);
    };

    // Check if card was dropped near shredder
    const handleDragEnd = (event, info, doc) => {
        if (!shredderRef.current) return;
        const rect = shredderRef.current.getBoundingClientRect();
        const pointX = info.point.x;
        const pointY = info.point.y;

        const buffer = 50;
        if (
            pointX >= rect.left - buffer &&
            pointX <= rect.right + buffer &&
            pointY >= rect.top - buffer &&
            pointY <= rect.bottom + buffer
        ) {
            shredCard(doc.playId);
        }
        setIsNearShredder(false);
    };

    const handleDrag = (event, info) => {
        if (!shredderRef.current) return;
        const rect = shredderRef.current.getBoundingClientRect();
        const dist = Math.hypot(info.point.x - (rect.left + rect.width / 2), info.point.y - (rect.top + rect.height / 2));
        setIsNearShredder(dist < 180);
    };

    const shredCard = (playId) => {
        sounds.playShred();
        setShredCount(prev => prev + 1);
        setPlayDocs(prev => prev.map(d => d.playId === playId ? { ...d, isShredded: true } : d));
        showToast("💥 Document shredded into pieces! (Database is 100% safe)");
    };

    const turnIntoAirplane = (playId) => {
        sounds.playWhoosh();
        setLaunchCount(prev => prev + 1);
        setPlayDocs(prev => prev.map(d => d.playId === playId ? { ...d, isPlane: true } : d));
        showToast("✈️ Paper airplane swooshed into the sky!");
    };

    const turnIntoBoat = (playId) => {
        sounds.playCrumple();
        setPlayDocs(prev => prev.map(d => d.playId === playId ? { ...d, isBoat: true } : d));
        showToast("⛵ Origami boat sailing peacefully across the screen!");
    };

    const crumpleCard = (playId) => {
        sounds.playCrumple();
        setPlayDocs(prev => prev.map(d => d.playId === playId ? {
            ...d,
            isCrumpled: !d.isCrumpled,
            rotation: !d.isCrumpled ? (Math.random() * 40 - 20) : d.rotation,
        } : d));
        showToast("🗞️ Document crumpled into a paper ball!");
    };

    const respawnAll = () => {
        sounds.playPop();
        setPlayDocs((documents || []).map((doc, idx) => ({
            ...doc,
            playId: doc._id || `doc-${idx}`,
            x: 60 + (idx % 4) * 260,
            y: 110 + Math.floor(idx / 4) * 220,
            rotation: (Math.random() - 0.5) * 16,
            isShredded: false,
            isPlane: false,
            isBoat: false,
            isCrumpled: false,
        })));
        showToast("✨ All documents respawned back safely!");
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#090B10] text-white overflow-hidden select-none flex flex-col font-sans">
            {/* Top Playful HUD Navigation */}
            <div className="relative z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl animate-bounce">🔥</span>
                    <div>
                        <h1 className="text-sm font-extrabold tracking-wider uppercase text-rose-400 flex items-center gap-2">
                            Stress Buster Playground
                            <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                🛡️ Safe Mode
                            </span>
                        </h1>
                        <p className="text-[11px] text-zinc-400">
                            Fling cards, crumple notes, or feed them to the shredder — zero actual data is deleted!
                        </p>
                    </div>
                </div>

                {/* Score & Controls */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
                        <span className="text-rose-400 font-bold">⚙️ Shredded: {shredCount}</span>
                        <span className="text-zinc-600">|</span>
                        <span className="text-sky-400 font-bold">✈️ Launched: {launchCount}</span>
                    </div>

                    <button
                        onClick={respawnAll}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer border border-zinc-700"
                        title="Respawn all documents"
                    >
                        <FiRefreshCw size={13} /> Respawn All
                    </button>

                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700"
                        title={isMuted ? "Unmute sounds" : "Mute sounds"}
                    >
                        {isMuted ? <FiVolumeX size={15} /> : <FiVolume2 size={15} />}
                    </button>

                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                    >
                        <FiX size={15} /> Exit
                    </button>
                </div>
            </div>

            {/* Dynamic Toast Feedback */}
            {toastMessage && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/90 border border-zinc-700 text-zinc-200 text-xs px-4 py-2 rounded-full shadow-2xl backdrop-blur flex items-center gap-2">
                    <span className="animate-pulse">💡</span>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Main Physics Area */}
            <div className="relative flex-1 w-full h-full overflow-hidden">
                {/* Visual Grid Lines */}
                <div 
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)`,
                        backgroundSize: '32px 32px'
                    }}
                />

                {/* Draggable Document Cards */}
                <AnimatePresence>
                    {playDocs.map((doc) => {
                        if (doc.isShredded) return null;

                        // Airplane state (flies in an arc across the screen)
                        if (doc.isPlane) {
                            return (
                                <motion.div
                                    key={`plane-${doc.playId}`}
                                    initial={{ x: doc.x, y: doc.y, scale: 0.8, rotate: 0 }}
                                    animate={{
                                        x: [doc.x, doc.x + 300, window.innerWidth + 150],
                                        y: [doc.y, doc.y - 180, -200],
                                        rotate: [0, -25, -50],
                                        scale: [0.8, 1.1, 0.4]
                                    }}
                                    transition={{ duration: 2.2, ease: "easeInOut" }}
                                    className="absolute pointer-events-none z-30"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="text-6xl filter drop-shadow-2xl">✈️</div>
                                        <span className="bg-sky-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                                            {doc.title || 'Note Plane'}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        }

                        // Boat state (sails gently at bottom)
                        if (doc.isBoat) {
                            return (
                                <motion.div
                                    key={`boat-${doc.playId}`}
                                    initial={{ x: doc.x, y: window.innerHeight - 150 }}
                                    animate={{
                                        x: [doc.x, window.innerWidth + 100],
                                        y: [window.innerHeight - 150, window.innerHeight - 140, window.innerHeight - 150],
                                        rotate: [0, 4, -4, 0]
                                    }}
                                    transition={{
                                        x: { duration: 12, ease: "linear" },
                                        y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                                        rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    className="absolute z-20 cursor-grab"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="text-6xl filter drop-shadow-lg">⛵</div>
                                        <span className="bg-amber-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                                            {doc.title || 'Note Boat'}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        }

                        return (
                            <motion.div
                                key={doc.playId}
                                drag
                                dragMomentum={true}
                                dragElastic={0.15}
                                onDrag={(e, info) => handleDrag(e, info)}
                                onDragEnd={(e, info) => handleDragEnd(e, info, doc)}
                                initial={{ x: doc.x, y: doc.y, rotate: doc.rotation, scale: 0.9 }}
                                animate={{
                                    scale: 1,
                                    rotate: doc.rotation
                                }}
                                whileDrag={{
                                    scale: 1.08,
                                    rotate: doc.rotation + 8,
                                    boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.45)",
                                    zIndex: 50
                                }}
                                whileHover={{ scale: 1.02 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className={`absolute z-20 cursor-grab active:cursor-grabbing select-none transition-shadow ${
                                    doc.isCrumpled
                                        ? 'w-36 h-36 rounded-full bg-zinc-800 border-2 border-dashed border-amber-400 p-3 flex flex-col items-center justify-center text-center shadow-xl'
                                        : 'w-60 rounded-2xl bg-[#14161F] border border-zinc-700/80 p-4 shadow-2xl flex flex-col justify-between'
                                }`}
                            >
                                {doc.isCrumpled ? (
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="text-3xl">🗞️</span>
                                        <span className="text-[11px] font-bold text-amber-300 mt-1 truncate max-w-[100px]">
                                            {doc.title}
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); crumpleCard(doc.playId); }}
                                            className="text-[9px] text-zinc-400 hover:text-white mt-1 underline cursor-pointer"
                                        >
                                            Unfold
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                                                    {doc.docType || 'Text'}
                                                </span>
                                                <span className="text-[10px] text-zinc-500">Hold & Fling 🖐️</span>
                                            </div>
                                            <h3 className="font-bold text-sm text-white line-clamp-1 mb-1">
                                                {doc.title || 'Untitled Doc'}
                                            </h3>
                                            <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                                                {doc.desc ? doc.desc.replace(/<[^>]*>/g, '') : 'No notes inside.'}
                                            </p>
                                        </div>

                                        {/* Playful Interactive Mini-Actions */}
                                        <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); turnIntoAirplane(doc.playId); }}
                                                className="flex items-center gap-1 text-[10px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                                title="Fly as Paper Airplane"
                                            >
                                                ✈️ Fly
                                            </button>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); turnIntoBoat(doc.playId); }}
                                                className="flex items-center gap-1 text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                                title="Origami Boat"
                                            >
                                                ⛵ Boat
                                            </button>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); crumpleCard(doc.playId); }}
                                                className="flex items-center gap-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                                title="Crumple into Ball"
                                            >
                                                🗞️ Ball
                                            </button>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); shredCard(doc.playId); }}
                                                className="flex items-center gap-1 text-[10px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                                title="Drop in Shredder"
                                            >
                                                <FaTrashAlt size={10} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Industrial Paper Crusher / Shredder Target */}
                <div
                    ref={shredderRef}
                    className={`absolute bottom-6 right-8 w-64 h-48 rounded-2xl border-2 transition-all duration-200 z-30 flex flex-col justify-between p-4 shadow-2xl backdrop-blur ${
                        isNearShredder
                            ? 'bg-rose-950/70 border-rose-500 scale-105 shadow-rose-500/30 ring-4 ring-rose-500/40'
                            : 'bg-zinc-900/80 border-zinc-700/80'
                    }`}
                >
                    {/* Danger Strip Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-700/80">
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full animate-ping ${isNearShredder ? 'bg-rose-500' : 'bg-amber-500'}`} />
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-300">
                                {isNearShredder ? 'FEED ME!' : 'DOC SHREDDER 3000'}
                            </span>
                        </div>
                        <span className="text-xs">⚙️</span>
                    </div>

                    {/* Shredder Intake Mouth */}
                    <div className="flex-1 flex flex-col items-center justify-center my-2">
                        <div className={`w-full h-8 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
                            isNearShredder ? 'border-rose-400 bg-rose-900/40 text-rose-300' : 'border-zinc-700 bg-black/40 text-zinc-500'
                        }`}>
                            <span className="text-[10px] font-semibold tracking-wide">
                                {isNearShredder ? 'DROP HERE TO CRUNCH!' : 'DRAG ANY CARD HERE'}
                            </span>
                        </div>
                        <div className="flex gap-1 mt-2 text-zinc-600 text-xs">
                            <span className={isNearShredder ? 'animate-spin text-rose-400' : ''}>⚙️</span>
                            <span className={isNearShredder ? 'animate-spin text-rose-400' : ''}>⚙️</span>
                            <span className={isNearShredder ? 'animate-spin text-rose-400' : ''}>⚙️</span>
                        </div>
                    </div>

                    {/* Bottom Status */}
                    <div className="text-[10px] text-zinc-400 text-center bg-zinc-950/60 py-1 rounded-md border border-zinc-800">
                        Safe Shreds: <span className="font-bold text-rose-400">{shredCount}</span> | Throw velocity enabled
                    </div>
                </div>
            </div>
        </div>
    );
}

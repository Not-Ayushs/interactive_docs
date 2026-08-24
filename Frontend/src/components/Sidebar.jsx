import { FiChevronLeft, FiChevronRight, FiFolder, FiSettings, FiHome } from "react-icons/fi";

export default function Sidebar({ isOpen, setIsOpen }) {
    return (
        <div className={`fixed left-0 top-0 h-full bg-zinc-950/80 backdrop-blur-md border-r border-zinc-800/80 z-30 text-white transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-16'}`}>
            {/* Header / Toggle Area */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800/50 h-16 shrink-0">
                {isOpen && <span className="font-bold tracking-wider text-green-400 uppercase text-xs">Interactive Docs</span>}
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="p-1.5 hover:bg-zinc-850 rounded-lg cursor-pointer text-zinc-400 hover:text-white transition-colors mx-auto"
                >
                    {isOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
                </button>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-2 p-2 mt-4">
                <a href="#" className="flex items-center gap-4 p-3 hover:bg-zinc-900 rounded-xl transition-all group" title="Dashboard">
                    <FiHome size={20} className="text-zinc-400 group-hover:text-green-400 shrink-0" />
                    {isOpen && <span className="font-medium text-sm transition-opacity duration-200">Dashboard</span>}
                </a>
                <a href="#" className="flex items-center gap-4 p-3 hover:bg-zinc-900 rounded-xl transition-all group" title="My Collections">
                    <FiFolder size={20} className="text-zinc-400 group-hover:text-green-400 shrink-0" />
                    {isOpen && <span className="font-medium text-sm transition-opacity duration-200">My Collections</span>}
                </a>
                <a href="#" className="flex items-center gap-4 p-3 hover:bg-zinc-900 rounded-xl transition-all group" title="Settings">
                    <FiSettings size={20} className="text-zinc-400 group-hover:text-green-400 shrink-0" />
                    {isOpen && <span className="font-medium text-sm transition-opacity duration-200">Settings</span>}
                </a>
            </nav>
        </div>
    );
}
import { FiUsers, FiShare2 } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

export default function CollaboratorsBar({ doc, activeUsers = [], onOpenShare }) {
    if (!doc) return null;

    const isCollaborative = doc.isCollaborative || (doc.collaborators && doc.collaborators.length > 0);
    const ownerName = doc.userId?.name || 'Owner';
    const ownerEmail = doc.userId?.email || '';

    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('userInfo')) || {};
        } catch {
            return {};
        }
    })();

    const isOwner = doc.userId?._id ? doc.userId._id === currentUser._id : true;

    return (
        <div className="flex items-center gap-3">
            {/* Real-time Active Presence Avatars */}
            {activeUsers.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-medium text-zinc-300 mr-1">
                        {activeUsers.length} live
                    </span>
                    <div className="flex -space-x-1.5 overflow-hidden">
                        {activeUsers.slice(0, 4).map((user, idx) => (
                            <div
                                key={user.socketId || idx}
                                title={`${user.name} (${user.email || 'active'})`}
                                style={{ backgroundColor: user.color || '#6366f1' }}
                                className="w-5 h-5 rounded-full ring-2 ring-zinc-900 flex items-center justify-center text-[10px] font-bold text-white uppercase select-none shadow-sm cursor-help"
                            >
                                {user.name ? user.name.charAt(0) : 'U'}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Collaborative Badge & Owner Indicator */}
            {isCollaborative && (
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                        <FiUsers className="text-xs" />
                        <span>Collaborative</span>
                    </div>

                    <div 
                        title={`Original Owner: ${ownerName} (${ownerEmail})`}
                        className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium cursor-help"
                    >
                        <FaCrown className="text-[10px]" />
                        <span>Owner: {isOwner ? 'You' : ownerName}</span>
                    </div>
                </div>
            )}

            {/* Share / Invite Button */}
            <button
                onClick={onOpenShare}
                title="Share & Collaborate"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
                <FiShare2 size={13} />
                <span>Share</span>
            </button>
        </div>
    );
}

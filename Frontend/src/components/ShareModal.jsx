import { useState, useEffect } from 'react';
import { FiX, FiUserPlus, FiUsers, FiLink, FiCheck, FiTrash2 } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import { getApiBaseUrl } from '../utils/api.js';

export default function ShareModal(props) {
    const key = props.isOpen ? `open-${props.doc?._id || props.collectionName || 'collection'}` : 'closed';
    return <ShareModalContent key={key} {...props} />;
}

function ShareModalContent({ isOpen, onClose, doc, collectionName, onUpdate }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('editor');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [copied, setCopied] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [searching, setSearching] = useState(false);

    // Current logged-in user
    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('userInfo')) || {};
        } catch {
            return {};
        }
    })();

    const apiBaseUrl = getApiBaseUrl();
    const token = localStorage.getItem('token');

    // Live search suggestions as user types
    useEffect(() => {
        if (!email.trim() || email.length < 2) {
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            setSearching(true);
            fetch(`${apiBaseUrl}/api/users/search?q=${encodeURIComponent(email)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setSuggestions(data);
                    }
                })
                .catch(() => {})
                .finally(() => setSearching(false));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [email, apiBaseUrl, token]);

    if (!isOpen) return null;

    // Identify owner
    const ownerName = doc?.userId?.name || (collectionName ? 'Collection Creator' : 'Unknown');
    const ownerEmail = doc?.userId?.email || '';
    const isCurrentUserOwner = doc?.userId?._id 
        ? doc.userId._id === currentUser._id 
        : true; // fallback

    const collaborators = doc?.collaborators || [];

    const handleShare = async (targetEmail = email) => {
        if (!targetEmail.trim()) {
            setError('Please enter a partner\'s email');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const endpoint = doc 
                ? `${apiBaseUrl}/api/documents/${doc._id}/share`
                : `${apiBaseUrl}/api/collections/${encodeURIComponent(collectionName)}/share`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: targetEmail.trim(), role })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to share');
            }

            setSuccessMsg(`Shared with ${targetEmail.trim()} successfully!`);
            setEmail('');
            setSuggestions([]);
            if (onUpdate) onUpdate(data);
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCollaborator = async (collabEmail) => {
        if (!doc) return;
        try {
            const res = await fetch(`${apiBaseUrl}/api/documents/${doc._id}/collaborators/${encodeURIComponent(collabEmail)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                if (onUpdate) onUpdate(data);
                setSuccessMsg(`Removed ${collabEmail}`);
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch {
            setError('Failed to remove collaborator');
        }
    };

    const copyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="w-full max-w-lg bg-[#14161E] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <FiUsers className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-white">
                                {doc ? `Collaborate: ${doc.title || 'Document'}` : `Share Collection: ${collectionName}`}
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Work together with real-time live synchronization
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Feedback Messages */}
                    {error && (
                        <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                            <span>{error}</span>
                        </div>
                    )}
                    {successMsg && (
                        <div className="px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                            <FiCheck />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Invite Section */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                            Invite Partner
                        </label>
                        <div className="relative">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter partner's email address..."
                                        className="w-full bg-[#1C1D26] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors pr-8"
                                    />
                                    {searching && (
                                        <div className="absolute right-3 top-3 text-zinc-500 animate-spin">
                                            ◌
                                        </div>
                                    )}
                                </div>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="bg-[#1C1D26] border border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                                >
                                    <option value="editor">Can edit</option>
                                    <option value="viewer">Can view</option>
                                </select>
                                <button
                                    onClick={() => handleShare()}
                                    disabled={loading || !email.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
                                >
                                    <FiUserPlus size={14} />
                                    {loading ? 'Sharing...' : 'Share'}
                                </button>
                            </div>

                            {/* User suggestions dropdown */}
                            {suggestions.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-1 bg-[#1C1D26] border border-zinc-700 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-zinc-800">
                                    <div className="px-3 py-1.5 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider bg-zinc-900/60">
                                        Registered Users Found:
                                    </div>
                                    {suggestions.map((u) => (
                                        <div
                                            key={u._id}
                                            onClick={() => {
                                                setEmail(u.email);
                                                handleShare(u.email);
                                            }}
                                            className="px-3 py-2 hover:bg-indigo-600/10 hover:text-white cursor-pointer flex items-center justify-between text-xs transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-zinc-200">{u.name}</span>
                                                <span className="text-zinc-500 text-[11px]">({u.email})</span>
                                            </div>
                                            <span className="text-[10px] text-indigo-400 font-medium">Select & Invite</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* People with Access */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                            People with Access
                        </label>
                        <div className="bg-[#1C1D26]/60 border border-zinc-800/80 rounded-xl divide-y divide-zinc-800/60 overflow-hidden">
                            {/* Original Owner Row */}
                            <div className="p-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-sm shadow-sm">
                                        {ownerName?.charAt(0).toUpperCase() || 'O'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{ownerName}</span>
                                            {isCurrentUserOwner && (
                                                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-400">{ownerEmail || 'Original Document Owner'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
                                    <FaCrown className="text-[11px]" />
                                    <span>Original Owner</span>
                                </div>
                            </div>

                            {/* Collaborators List */}
                            {collaborators.map((c, i) => (
                                <div key={i} className="p-3.5 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-sm">
                                            {(c.name || c.email)?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-zinc-200">
                                                    {c.name || c.email.split('@')[0]}
                                                </span>
                                                {c.email?.toLowerCase() === currentUser?.email?.toLowerCase() && (
                                                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-zinc-400">{c.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md capitalize font-medium">
                                            {c.role || 'Editor'}
                                        </span>
                                        {isCurrentUserOwner && (
                                            <button
                                                onClick={() => handleRemoveCollaborator(c.email)}
                                                title="Remove collaborator"
                                                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {collaborators.length === 0 && (
                                <div className="p-4 text-center text-xs text-zinc-500">
                                    No partners invited yet. Share the doc above to collaborate!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Copy Link Section */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                            Shareable Link
                        </label>
                        <div className="flex items-center gap-2 p-2.5 bg-[#1C1D26] border border-zinc-800 rounded-xl">
                            <FiLink className="text-zinc-500 shrink-0 ml-1" />
                            <input
                                readOnly
                                value={window.location.href}
                                className="bg-transparent text-xs text-zinc-400 w-full focus:outline-none select-all font-mono truncate"
                            />
                            <button
                                onClick={copyLink}
                                className="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                {copied ? (
                                    <>
                                        <FiCheck className="text-emerald-400" />
                                        <span className="text-emerald-400">Copied</span>
                                    </>
                                ) : (
                                    'Copy Link'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Notice */}
                <div className="px-6 py-3.5 bg-zinc-900/40 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Real-time WebSockets collaboration active
                    </span>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white font-medium cursor-pointer"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

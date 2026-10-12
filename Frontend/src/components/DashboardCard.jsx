import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiShare2, FiPenTool } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import ShareModal from './ShareModal.jsx';

export default function DashboardCard({ doc, onUpdate }) {
    const navigate = useNavigate();
    const [showShareModal, setShowShareModal] = useState(false);

    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('userInfo')) || {};
        } catch {
            return {};
        }
    })();

    const isCollaborative = doc?.isCollaborative || (doc?.collaborators && doc.collaborators.length > 0);
    const ownerName = doc?.userId?.name || 'Owner';
    const isOwner = doc?.userId?._id ? doc.userId._id === currentUser._id : true;

    const getPlainText = (htmlContent) => {
        if (!htmlContent) return doc?.docType === 'canvas' ? "Interactive Canvas Project" : "Empty document notes...";
        try {
            const parsed = new DOMParser().parseFromString(htmlContent, "text/html");
            const text = (parsed.body.textContent || "").replace(/\s+/g, " ").trim();
            return text || (doc?.docType === 'canvas' ? "Interactive Canvas Project" : "Empty document notes...");
        } catch {
            const plainText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            return plainText || "Empty document notes...";
        }
    };

    const handleOpenDoc = () => {
        if (doc?._id) {
            const path = doc.docType === 'canvas' ? `/app/canvas/${doc._id}` : `/app/editor/${doc._id}`;
            navigate(path, {
                state: { fromCollection: doc.collectionName }
            });
        }
    };

    const handleShareClick = (e) => {
        e.stopPropagation();
        setShowShareModal(true);
    };

    const titleText = (doc?.tag?.tagTitle || doc?.title || "DOCUMENT NOTES").toUpperCase();
    const descText = getPlainText(doc?.desc);
    const collectionBadge = (doc?.collectionName || doc?.tag?.tagTitle || "General").toUpperCase();

    return (
        <>
            <div
                onClick={handleOpenDoc}
                className="group relative w-full sm:w-52 h-64 rounded-[28px] overflow-hidden flex flex-col justify-between cursor-pointer select-none transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 border border-zinc-800/80 hover:border-zinc-700/80 shrink-0 bg-[#14151C]"
            >
                {/* Top Dark Body Container */}
                <div className="bg-[#1c1c24] group-hover:bg-[#22222c] p-5 flex-1 flex flex-col justify-between transition-colors duration-300">
                    <div>
                        {/* Header Badges */}
                        <div className="flex items-center justify-between gap-1 mb-2.5">
                            {isCollaborative ? (
                                <span className="flex items-center gap-1 text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    <FiUsers className="text-[10px]" /> Collab
                                </span>
                            ) : (
                                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">
                                    {doc?.docType === 'canvas' ? 'Canvas' : 'Doc'}
                                </span>
                            )}

                            <div className="flex items-center gap-1">
                                {doc?.docType === 'canvas' && (
                                    <span title="Interactive Canvas" className="text-zinc-400 group-hover:text-indigo-400">
                                        <FiPenTool size={11} />
                                    </span>
                                )}
                                <button
                                    onClick={handleShareClick}
                                    title="Share Document"
                                    className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-colors"
                                >
                                    <FiShare2 size={11} />
                                </button>
                            </div>
                        </div>

                        {/* Document Title */}
                        <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-1.5 line-clamp-2 leading-snug">
                            {titleText}
                        </h3>

                        {/* Document Description Snippet */}
                        <p className="text-zinc-300 text-[11px] leading-relaxed font-normal line-clamp-3">
                            {descText}
                        </p>
                    </div>

                    {/* Collaborative Owner Tag */}
                    {isCollaborative && (
                        <div 
                            title={`Original Owner: ${ownerName}`}
                            className="mt-2 pt-2 border-t border-zinc-800/50 flex items-center gap-1 text-[10px] text-amber-300 font-medium truncate"
                        >
                            <FaCrown className="text-[9px] shrink-0" />
                            <span className="truncate">Owner: {isOwner ? 'You' : ownerName}</span>
                        </div>
                    )}
                </div>

                {/* Bottom Light Contrast Rounded Footer displaying Collection Name */}
                <div className="bg-[#e2e2e6] text-zinc-900 group-hover:bg-white px-4 py-2.5 flex items-center justify-between font-bold text-[10px] tracking-wider uppercase rounded-b-[28px] transition-colors duration-300 border-t border-zinc-800/20 shadow-inner">
                    <span className="truncate max-w-[130px]" title={`Collection: ${doc?.collectionName || 'General'}`}>
                        {collectionBadge}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                        {doc?.docType === 'canvas' ? 'CANVAS' : 'TEXT'}
                    </span>
                </div>
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                doc={doc}
                onUpdate={(updated) => {
                    if (onUpdate) onUpdate(updated);
                }}
            />
        </>
    );
}

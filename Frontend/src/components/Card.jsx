import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaEdit, FaCrown } from "react-icons/fa";
import { FiUsers, FiShare2, FiPenTool } from "react-icons/fi";
import { motion } from 'framer-motion';
import ShareModal from './ShareModal.jsx';

export default function Card({ data, reference, onUpdate }) {
    const navigate = useNavigate();
    const [showShareModal, setShowShareModal] = useState(false);

    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('userInfo')) || {};
        } catch {
            return {};
        }
    })();

    const isCollaborative = data?.isCollaborative || (data?.collaborators && data.collaborators.length > 0);
    const ownerName = data?.userId?.name || 'Owner';
    const isOwner = data?.userId?._id ? data.userId._id === currentUser._id : true;

    const getShortDesc = (htmlContent) => {
        if (!htmlContent) return data?.docType === 'canvas' ? "Interactive Canvas" : "Empty Document";
        let text = "";
        try {
            const parsed = new DOMParser().parseFromString(htmlContent, "text/html");
            text = (parsed.body.textContent || "").replace(/\s+/g, " ").trim();
        } catch {
            text = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        }
        if (!text) return data?.docType === 'canvas' ? "Interactive Canvas" : "Empty Document";
        const words = text.split(' ');
        if (words.length <= 15) {
            return text;
        }
        return words.slice(0, 15).join(' ') + '...';
    };

    const openEditor = (e) => {
        e.stopPropagation();
        if (data?._id) {
            const path = data.docType === 'canvas' ? `/app/canvas/${data._id}` : `/app/editor/${data._id}`;
            navigate(path, {
                state: { fromCollection: data.collectionName }
            });
        }
    };

    const handleShareClick = (e) => {
        e.stopPropagation();
        setShowShareModal(true);
    };

    return (
        <>
            <motion.div
                layout
                drag
                dragConstraints={reference}
                whileDrag={{ cursor: "grabbing", scale: 1.05 }}
                onClick={openEditor}
                className="md:h-56 shrink-0 overflow-hidden relative rounded-[32px] w-64 h-44 bg-zinc-900/90 hover:bg-zinc-900 text-white md:px-6 md:py-6 px-4 py-5 border border-zinc-800/80 cursor-pointer shadow-lg hover:shadow-2xl hover:border-zinc-700/80 transition-all group flex flex-col justify-between"
            >
                <div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {data?.docType === 'canvas' ? (
                                <FiPenTool className="text-xl text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                            ) : (
                                <IoDocumentTextOutline className="text-xl text-zinc-400 group-hover:text-white transition-colors" />
                            )}
                            {isCollaborative && (
                                <span className="flex items-center gap-1 text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
                                    <FiUsers className="text-[10px]" /> Collab
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <span 
                                onClick={handleShareClick}
                                title="Share Document"
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-zinc-800 group-hover:bg-zinc-700 text-zinc-400 hover:text-indigo-400 transition-all"
                            >
                                <FiShare2 size={12} />
                            </span>
                            <span 
                                onClick={openEditor}
                                title="Open Document"
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-zinc-800 group-hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all"
                            >
                                <FaEdit size={12} />
                            </span>
                        </div>
                    </div>

                    <h4 className="text-xs font-bold text-white tracking-wide mt-2 truncate">
                        {data?.title || data?.tag?.tagTitle || "Document"}
                    </h4>

                    <p className="leading-tight text-xs mt-1.5 font-medium line-clamp-2 overflow-hidden text-zinc-300">
                        {getShortDesc(data?.desc)}
                    </p>
                </div>

                {/* Footer Section */}
                <div className="footer w-full pt-2 border-t border-zinc-800/60 mt-auto">
                    {/* Owner & Collaborative info */}
                    <div className="flex items-center justify-between text-[11px] mb-1">
                        {isCollaborative ? (
                            <span 
                                title={`Original Owner: ${ownerName}`}
                                className="flex items-center gap-1 text-amber-300/90 font-medium truncate max-w-[150px]"
                            >
                                <FaCrown className="text-[9px]" />
                                <span className="truncate">By {isOwner ? 'You' : ownerName}</span>
                            </span>
                        ) : (
                            <span className="text-zinc-500 font-medium">
                                {data?.collectionName || 'General'}
                            </span>
                        )}

                        <span className="text-[10px] text-zinc-500 font-mono">
                            {data?.filesize || '.1mb'}
                        </span>
                    </div>

                    {data?.tag?.tagTitle && (
                        <div className="tag w-full py-1 bg-zinc-800/50 rounded-lg flex items-center justify-center mt-1">
                            <h3 className="text-[10px] font-semibold text-amber-300 tracking-wide truncate px-2">
                                {data.tag.tagTitle}
                            </h3>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                doc={data}
                onUpdate={(updated) => {
                    if (onUpdate) onUpdate(updated);
                }}
            />
        </>
    );
}
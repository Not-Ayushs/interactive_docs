import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardCard({ doc }) {
    const navigate = useNavigate();

    const getPlainText = (htmlContent) => {
        if (!htmlContent) return "This is a sample doc for the design inspiration....";
        const plainText = htmlContent.replace(/<[^>]*>/g, ' ').trim();
        return plainText || "This is a sample doc for the design inspiration....";
    };

    const handleOpenDoc = () => {
        if (doc?._id) {
            navigate(`/app/editor/${doc._id}`, {
                state: { fromCollection: doc.collectionName }
            });
        }
    };

    const titleText = (doc.tag?.tagTitle || doc.title || "DOCUMENT NOTES").toUpperCase();
    const descText = getPlainText(doc.desc);
    const collectionBadge = (doc.collectionName || doc.tag?.tagTitle || "General").toUpperCase();

    return (
        <div
            onClick={handleOpenDoc}
            className="group relative w-full sm:w-48 h-60 rounded-[28px] overflow-hidden flex flex-col justify-between cursor-pointer select-none transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/5 border border-zinc-800/80 hover:border-zinc-700/80 shrink-0"
        >
            {/* Top Dark Body Container */}
            <div className="bg-[#1c1c24] group-hover:bg-[#22222c] p-5 flex-1 flex flex-col transition-colors duration-300">
                {/* Document Title */}
                <h3 className="text-white font-medium text-xs tracking-wider uppercase mb-2 line-clamp-2 leading-snug">
                    {titleText}
                </h3>

                {/* Document Description Snippet */}
                <p className="text-zinc-300 text-[11px] leading-relaxed font-normal line-clamp-3">
                    {descText}
                </p>
            </div>

            {/* Bottom Light Contrast Rounded Footer displaying Collection Name */}
            <div className="bg-[#e2e2e6] text-zinc-900 group-hover:bg-white px-4 py-2.5 flex items-center justify-center font-bold text-[10px] tracking-wider uppercase rounded-b-[28px] transition-colors duration-300 border-t border-zinc-800/20 shadow-inner">
                <span className="truncate max-w-full" title={`Collection: ${doc.collectionName || 'General'}`}>
                    {collectionBadge}
                </span>
            </div>
        </div>
    );
}

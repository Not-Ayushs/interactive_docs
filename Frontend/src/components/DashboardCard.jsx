import React from 'react';
import { useNavigate } from 'react-router-dom';
import CapsuleButton from './CapsuleButton';

export default function DashboardCard({ doc, icon: IconComponent }) {
    const navigate = useNavigate();

    const getPlainText = (htmlContent) => {
        if (!htmlContent) return "";
        return htmlContent.replace(/<[^>]*>/g, ' ');
    };

    const handleConnect = () => {
        if (doc?._id) {
            navigate(`/app/editor/${doc._id}`, {
                state: { fromCollection: doc.collectionName }
            });
        }
    };

    return (
        <div className="group bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700/80 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl">
            <div>
                {/* Top Left Icon Box */}
                <div className="w-10 h-10 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-bold shadow-md shadow-white/10 mb-4 transition-transform group-hover:scale-105">
                    {IconComponent ? <IconComponent size={20} /> : <span className="text-sm font-black">D</span>}
                </div>

                {/* Card Title */}
                <h3 className="text-white font-bold text-base tracking-wide mb-2">
                    {doc.tag?.tagTitle || doc.title || "Document"}
                </h3>

                {/* Card Description */}
                <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3 mb-6 font-normal">
                    {getPlainText(doc.desc) || "Centralized documentation, guidelines, and specifications for project releases."}
                </p>
            </div>

            {/* Bottom Connect Button */}
            <div className="flex items-center justify-start pt-2">
                <CapsuleButton
                    type="outline"
                    onClick={handleConnect}
                    className="py-1 px-4 text-xs font-semibold hover:bg-white hover:text-black border-zinc-700"
                >
                    Connect
                </CapsuleButton>
            </div>
        </div>
    );
}

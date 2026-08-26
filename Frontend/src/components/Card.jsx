import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { motion } from 'framer-motion';

export default function Card({ data, reference }) {
    const navigate = useNavigate();

    const getShortDesc = (htmlContent) => {
        if (!htmlContent) return "Empty Document";
        const plainText = htmlContent.replace(/<[^>]*>/g, ' ');
        const words = plainText.trim().split(/\s+/);
        if (words.length <= 3) {
            return plainText;
        }
        return words.slice(0, 3).join(' ') + '...';
    };

    const openEditor = (e) => {
        e.stopPropagation();
        if (data?._id) {
            navigate(`/app/editor/${data._id}`, {
                state: { fromCollection: data.collectionName }
            });
        }
    };

    return (
        <motion.div
            layout
            drag
            dragConstraints={reference}
            whileDrag={{ cursor: "grabbing", scale: 1.05 }}
            onClick={openEditor}
            className="md:h-52 shrink-0 overflow-hidden relative rounded-[40px] w-60 h-36 bg-zinc-900/90 hover:bg-zinc-900 text-white md:px-7 md:py-8 px-4 py-5 border border-zinc-800/80 cursor-pointer shadow-lg hover:shadow-2xl transition-all group"
        >
            <div className="flex items-center justify-between">
                <IoDocumentTextOutline className="text-xl text-zinc-400 group-hover:text-white transition-colors" />
                <span 
                    onClick={openEditor}
                    title="Open Document Editor"
                    className="w-7 h-7 rounded-full flex items-center justify-center bg-zinc-800 group-hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all"
                >
                    <FaEdit size={12} />
                </span>
            </div>

            <p
                className="leading-tight text-sm mt-3 font-semibold line-clamp-3 overflow-hidden text-zinc-200"
                dangerouslySetInnerHTML={{ __html: getShortDesc(data.desc) }}
            />

            <div className="footer absolute bottom-0 w-full left-0">
                <div className="flex items-center justify-between py-2 px-7">
                    <h5 className="text-[11px] text-zinc-400 font-medium">{data.filesize || '.9mb'}</h5>
                </div>
                {data.tag && (
                    <div className="hidden md:flex tag w-full py-2.5 bg-zinc-800/90 border-t border-zinc-800 flex items-center justify-center">
                        <h3 className="text-xs font-semibold text-amber-300 tracking-wide truncate px-4">
                            {data.tag.tagTitle || 'Untitled Tag'}
                        </h3>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
import { useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { getApiBaseUrl } from '../utils/api.js';

export default function AddDocModal({ showModal, setShowModal, onAdd, collectionName = "" }) {
    const [desc, setDesc] = useState("");
    const [tagTitle, setTagTitle] = useState("");
    const [tagColor, setTagColor] = useState("green");
    const [docType, setDocType] = useState("text");

    const closeModal = () => {
        setShowModal(false);
        // Reset form
        setDesc("");
        setTagTitle("");
        setTagColor("green");
        setDocType("text");
    };

    const handleSave = () => {
        if (docType === "text" && !desc.trim()) return alert("Please enter a description!");

        const newDoc = {
            desc,
            filesize: ".9mb", // static for mockup
            collectionName: collectionName || "General",
            docType,
            tag: {
                isOpen: true,
                tagTitle: tagTitle || "Untitled Tag",
                tagColor: tagColor
            }
        };

        const apiBaseUrl = getApiBaseUrl();
        fetch(`${apiBaseUrl}/api/documents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(newDoc)
        })
        .then(res => res.json())
        .then(savedDoc => {
            onAdd(savedDoc);
            closeModal();
        })
        .catch(err => {
            console.error("Error creating document:", err);
            alert("Failed to save document. Make sure the backend server is running!");
        });
    };

    return (
        <>
            {showModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative w-[30vw] min-w-[320px] rounded-2xl bg-zinc-900 border border-zinc-800 text-white p-8 shadow-2xl">
                        
                        {/* Close button */}
                        <button onClick={closeModal} className="absolute right-4 top-4 cursor-pointer text-zinc-400 hover:text-red-500 transition-colors">
                            <IoIosCloseCircle size={24} />
                        </button>

                        <h2 className="text-xl font-bold mb-1 text-[#ece9e9ef]">Add New Document</h2>
                        {collectionName && (
                            <p className="text-xs text-amber-300 font-medium mb-5">
                                Saving into collection: <span className="font-bold">{collectionName}</span>
                            </p>
                        )}

                        <div className="flex flex-col gap-4">
                            {/* Document Type Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Document Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            value="text" 
                                            checked={docType === "text"} 
                                            onChange={(e) => setDocType(e.target.value)}
                                            className="cursor-pointer"
                                        />
                                        <span className="text-sm">Text Document</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            value="canvas" 
                                            checked={docType === "canvas"} 
                                            onChange={(e) => setDocType(e.target.value)}
                                            className="cursor-pointer"
                                        />
                                        <span className="text-sm">Infinite Canvas</span>
                                    </label>
                                </div>
                            </div>

                            {/* Description */}
                            {docType === "text" && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Description</label>
                                    <textarea 
                                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-white resize-none h-24 text-sm"
                                        placeholder="Enter document details..."
                                        value={desc}
                                        onChange={(e) => setDesc(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Tag Title */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Tag Title</label>
                                <input 
                                    type="text"
                                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-white text-sm"
                                    placeholder="e.g. MBBS, Urgent, Research"
                                    value={tagTitle}
                                    onChange={(e) => setTagTitle(e.target.value)}
                                />
                            </div>

                            {/* Tag Color Selector */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Tag Color</label>
                                <select 
                                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-white cursor-pointer text-sm"
                                    value={tagColor}
                                    onChange={(e) => setTagColor(e.target.value)}
                                >
                                    <option value="green">Green</option>
                                    <option value="blue">Blue</option>
                                    <option value="sky">Sky Blue</option>
                                    <option value="amber">Amber/Yellow</option>
                                </select>
                            </div>

                            {/* Save Button */}
                            <button 
                                onClick={handleSave}
                                className="mt-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer py-3 font-bold transition-all shadow-md active:scale-95"
                            >
                                Save Document
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

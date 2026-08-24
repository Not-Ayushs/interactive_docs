import { useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";

export default function AddDocModal({ showModal, setShowModal, onAdd }) {
    const [desc, setDesc] = useState("");
    const [tagTitle, setTagTitle] = useState("");
    const [tagColor, setTagColor] = useState("green");

    const closeModal = () => {
        setShowModal(false);
        // Reset form
        setDesc("");
        setTagTitle("");
        setTagColor("green");
    };

    const handleSave = () => {
        if (!desc.trim()) return alert("Please enter a description!");

        const newDoc = {
            desc,
            filesize: ".9mb", // static for mockup
            tag: {
                isOpen: true,
                tagTitle: tagTitle || "Untitled Tag",
                tagColor: tagColor
            }
        };

        const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        fetch(`${apiBaseUrl}/api/documents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
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

                        <h2 className="text-xl font-bold mb-6 text-[#ece9e9ef]">Add New Document</h2>

                        <div className="flex flex-col gap-4">
                            {/* Description */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Description</label>
                                <textarea 
                                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-green-100 resize-none h-24"
                                    placeholder="Enter document details..."
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                />
                            </div>

                            {/* Tag Title */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Tag Title</label>
                                <input 
                                    type="text"
                                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-green-100"
                                    placeholder="e.g. MBBS, Urgent, Research"
                                    value={tagTitle}
                                    onChange={(e) => setTagTitle(e.target.value)}
                                />
                            </div>

                            {/* Tag Color Selector */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Tag Color</label>
                                <select 
                                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-green-100 cursor-pointer"
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
                                className="mt-4 rounded-xl bg-[#ece9e9ef] hover:bg-[#bdbdbd] text-zinc-950 cursor-pointer py-3 font-bold transition-all shadow-md shadow-green-500/20 active:scale-95"
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

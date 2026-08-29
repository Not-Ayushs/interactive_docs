import { useState, useEffect } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import Editor from './Editor'

export default function OpenCard({ showModal, setShowModal, doc, onUpdate }) {
    const [currentContent, setCurrentContent] = useState(doc?.desc || "");

    // Sync content state when the doc prop changes
    useEffect(() => {
        if (doc) {
            setCurrentContent(doc.desc || "");
        }
    }, [doc]);

    const closeModal = () => {
        setShowModal(false);
    }

    const handleSave = () => {
        if (!doc || !doc._id) {
            alert("Error: Document ID is missing. Try refreshing the page.");
            return;
        }

        const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        fetch(`${apiBaseUrl}/api/documents/${doc._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ desc: currentContent })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error("Server returned an error status");
            }
            return res.json();
        })
        .then(updatedDoc => {
            if (onUpdate) {
                onUpdate(updatedDoc);
            }
            closeModal();
        })
        .catch(err => {
            console.error("Error saving document:", err);
            alert("Failed to save changes. Make sure the server is running!");
        });
    }

    return (
        <>
            {showModal && <div className=" md:px-10 md:pt-24 md:pb-12 px-3 pt-6 pb-3 overflow-y-scroll md:h-[89vh] h-[49vh] bg-zinc-950 md:w-[40vw] w-[70vw] text-white z-40 rounded-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-zinc-800 shadow-2xl">
                <div><Editor title={doc?.desc || ""} onChange={setCurrentContent}/></div>
                <button onClick={closeModal} className='absolute right-2 top-2 cursor-pointer text-zinc-400 hover:text-red-500 transition-colors' ><IoIosCloseCircle size={16 } />
                </button>
                <button onClick={handleSave} className="text-[10px] md:text-[14px] absolute right-6 bottom-6 rounded-xl bg-green-400 hover:bg-green-600 text-zinc-950 cursor-pointer md:py-2 md:px-5 px-2 py-1  font-bold transition-all shadow-md active:scale-95">Save</button>
            </div>}
        </>
    )
}
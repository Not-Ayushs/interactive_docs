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
                "Content-Type": "application/json"
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
            {showModal && <div className=" px-10 pt-24 pb-12 overflow-y-scroll h-[89vh] bg-zinc-950 w-[40vw] text-white z-100 rounded-xl absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] border border-zinc-800 shadow-2xl">
                <div><Editor title={doc?.desc || ""} onChange={setCurrentContent}/></div>
                <button onClick={closeModal} className='absolute right-2 top-2 cursor-pointer text-zinc-400 hover:text-red-500 transition-colors' ><IoIosCloseCircle size={24} />
                </button>
                <button onClick={handleSave} className="absolute right-6 bottom-6 rounded-xl bg-green-400 hover:bg-green-600 text-zinc-950 cursor-pointer py-2 px-5 font-bold transition-all shadow-md active:scale-95">Save</button>
            </div>}
        </>
    )
}
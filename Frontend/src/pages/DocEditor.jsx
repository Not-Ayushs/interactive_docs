import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor from '../components/Editor.jsx';
import CapsuleButton from '../components/CapsuleButton.jsx';
import { FiArrowLeft, FiX, FiCheck, FiFolder } from 'react-icons/fi';
import { getApiBaseUrl } from '../utils/api.js';

export default function DocEditor() {
    const { docId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [doc, setDoc] = useState(null);
    const [currentContent, setCurrentContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedStatus, setSavedStatus] = useState('');

    const returnCollection = location.state?.fromCollection || doc?.collectionName;

    useEffect(() => {
        const apiBaseUrl = getApiBaseUrl();
        const token = localStorage.getItem('token');
        fetch(`${apiBaseUrl}/api/documents/${docId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Document not found");
                return res.json();
            })
            .then(data => {
                setDoc(data);
                setCurrentContent(data.desc || '');
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching document:", err);
                setLoading(false);
            });
    }, [docId]);

    const handleClose = () => {
        if (returnCollection && returnCollection !== 'General') {
            navigate(`/app/collections/${encodeURIComponent(returnCollection)}`);
        } else {
            navigate('/app/dashboard');
        }
    };

    const handleSave = () => {
        if (!docId) return;

        setSaving(true);
        setSavedStatus('Saving changes...');

        const apiBaseUrl = getApiBaseUrl();
        fetch(`${apiBaseUrl}/api/documents/${docId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ desc: currentContent })
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to save");
                return res.json();
            })
            .then(updated => {
                setDoc(updated);
                setSaving(false);
                setSavedStatus('All changes saved');
                setTimeout(() => setSavedStatus(''), 3000);
            })
            .catch(err => {
                console.error("Error saving document:", err);
                setSaving(false);
                setSavedStatus('Error saving document');
            });
    };

    if (loading) {
        return (
            <div className="w-full h-screen bg-[#0A0E15] flex items-center justify-center text-zinc-400">
                Loading document...
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-[#0A0E15] flex flex-col overflow-hidden text-white">
            {/* Top Google Docs-Style Header Bar */}
            <header className="w-full h-16 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-6 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleClose}
                        title="Close Editor (Return)"
                        className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <FiX className="text-xl" />
                    </button>

                    <div className="h-6 w-[1px] bg-zinc-800" />

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-bold text-base text-white tracking-wide">
                                {doc?.tag?.tagTitle || "Document Notes"}
                            </h1>
                            {doc?.collectionName && (
                                <span className="flex items-center gap-1 text-[11px] bg-zinc-800 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                                    <FiFolder className="text-xs" />
                                    {doc.collectionName}
                                </span>
                            )}
                        </div>
                        {savedStatus && (
                            <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                                <FiCheck className="text-white text-xs" /> {savedStatus}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <CapsuleButton
                        type="outline"
                        onClick={handleClose}
                    >
                        Close
                    </CapsuleButton>

                    <CapsuleButton
                        type="active"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Document'}
                    </CapsuleButton>
                </div>
            </header>

            {/* Scrollable Google Docs Paper Area */}
            <main className="flex-1 overflow-y-auto pt-10 pb-20 px-4 flex justify-center bg-[#0A0E15]">
                <div className="w-full max-w-4xl min-h-[850px] bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl p-10 md:p-14 flex flex-col">
                    <Editor
                        title={doc?.desc || ""}
                        onChange={setCurrentContent}
                    />
                </div>
            </main>
        </div>
    );
}

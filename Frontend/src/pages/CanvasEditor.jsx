import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';
import CapsuleButton from '../components/CapsuleButton.jsx';
import { FiX, FiCheck, FiFolder } from 'react-icons/fi';
import { getApiBaseUrl } from '../utils/api.js';

export default function CanvasEditor() {
    const { docId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedStatus, setSavedStatus] = useState('');
    const [initialData, setInitialData] = useState(null);
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);

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
                
                if (data.canvasData) {
                    try {
                        const snap = typeof data.canvasData === 'string' 
                            ? JSON.parse(data.canvasData) 
                            : data.canvasData;
                            
                        if (snap && typeof snap === 'object' && Object.keys(snap).length > 0) {
                            if (snap.elements) {
                                setInitialData(snap);
                            } else {
                                console.warn("Canvas data is empty or corrupted. Starting fresh.");
                                setInitialData(null);
                            }
                        }
                    } catch (e) {
                        console.error("Failed to load canvas data", e);
                    }
                }
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
        if (!docId || !excalidrawAPI) return;
        setSaving(true);
        setSavedStatus('Saving changes...');

        let snapshotString = "";
        try {
            const elements = excalidrawAPI.getSceneElements();
            const appState = excalidrawAPI.getAppState();
            const files = excalidrawAPI.getFiles();
            snapshotString = JSON.stringify({ elements, appState, files });
        } catch (e) {
            console.error("Error stringifying snapshot", e);
        }

        const apiBaseUrl = getApiBaseUrl();
        fetch(`${apiBaseUrl}/api/documents/${docId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ canvasData: snapshotString }) 
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
                Loading canvas...
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-[#0A0E15] flex flex-col overflow-hidden text-white">
            {/* Header Bar */}
            <header className="w-full h-16 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-6 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleClose}
                        title="Close Canvas (Return)"
                        className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <FiX className="text-xl" />
                    </button>

                    <div className="h-6 w-[1px] bg-zinc-800" />

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-bold text-base text-white tracking-wide">
                                {doc?.tag?.tagTitle || "Infinite Canvas"}
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
                        {saving ? 'Saving...' : 'Save Canvas'}
                    </CapsuleButton>
                </div>
            </header>

            {/* Canvas Area */}
            <main className="flex-1 w-full relative">
                <Excalidraw 
                    theme="dark"
                    initialData={initialData}
                    excalidrawAPI={(api) => setExcalidrawAPI(api)}
                />
            </main>
        </div>
    );
}

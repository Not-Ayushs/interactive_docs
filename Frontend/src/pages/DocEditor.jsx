import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor from '../components/Editor.jsx';
import CapsuleButton from '../components/CapsuleButton.jsx';
import ShareModal from '../components/ShareModal.jsx';
import CollaboratorsBar from '../components/CollaboratorsBar.jsx';
import { FiX, FiCheck, FiFolder, FiWifi } from 'react-icons/fi';
import { getApiBaseUrl } from '../utils/api.js';
import { getSocket, joinDocumentRoom, leaveDocumentRoom, emitDocChange } from '../utils/socket.js';

export default function DocEditor() {
    const { docId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [doc, setDoc] = useState(null);
    const [currentContent, setCurrentContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedStatus, setSavedStatus] = useState('');
    const [activeUsers, setActiveUsers] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);

    // Track if update is from remote to avoid bounce loop
    const isRemoteUpdateRef = useRef(false);

    const returnCollection = location.state?.fromCollection || doc?.collectionName;

    // Load initial document data
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

    // WebSocket Real-Time Communication
    useEffect(() => {
        if (!docId) return;

        joinDocumentRoom(docId);
        const socket = getSocket();

        const handleDocChanged = (data) => {
            if (data && data.content !== undefined) {
                isRemoteUpdateRef.current = true;
                setCurrentContent(data.content);
                const editorName = data.updatedBy?.name || 'Partner';
                setSavedStatus(`Edited in real-time by ${editorName}`);
                setTimeout(() => setSavedStatus('All changes synced'), 2000);
            }
        };

        const handleActiveUsers = (users) => {
            if (Array.isArray(users)) {
                setActiveUsers(users);
            }
        };

        socket.on("doc-changed", handleDocChanged);
        socket.on("active-users", handleActiveUsers);

        return () => {
            socket.off("doc-changed", handleDocChanged);
            socket.off("active-users", handleActiveUsers);
            leaveDocumentRoom(docId);
        };
    }, [docId]);

    const handleContentChange = (newHTML) => {
        if (isRemoteUpdateRef.current) {
            isRemoteUpdateRef.current = false;
            return;
        }

        setCurrentContent(newHTML);
        // Emit live update to all collaborating partners via WebSockets
        emitDocChange(docId, newHTML);
        setSavedStatus('Syncing live...');
        setTimeout(() => setSavedStatus('All changes synced'), 1500);
    };

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
                setSavedStatus('All changes saved to database');
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
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
                    <span>Loading collaborative document...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-[#0A0E15] flex flex-col overflow-hidden text-white">
            {/* Top Google Docs-Style Header Bar */}
            <header className="w-full h-16 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-6 flex items-center justify-between z-40">
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
                                {doc?.title || doc?.tag?.tagTitle || "Document Notes"}
                            </h1>
                            {doc?.collectionName && (
                                <span className="flex items-center gap-1 text-[11px] bg-zinc-800 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                                    <FiFolder className="text-xs" />
                                    {doc.collectionName}
                                </span>
                            )}
                        </div>
                        {savedStatus ? (
                            <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                                <FiCheck className="text-emerald-400 text-xs" /> {savedStatus}
                            </p>
                        ) : (
                            <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Real-time sync enabled
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Action & Collaboration Header Section */}
                <div className="flex items-center gap-3">
                    {/* Live Presence and Collaboration Bar */}
                    <CollaboratorsBar
                        doc={doc}
                        activeUsers={activeUsers}
                        onOpenShare={() => setShowShareModal(true)}
                    />

                    <div className="h-6 w-[1px] bg-zinc-800 hidden sm:block" />

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
                        {saving ? 'Saving...' : 'Save'}
                    </CapsuleButton>
                </div>
            </header>

            {/* Scrollable Google Docs Paper Area */}
            <main className="flex-1 overflow-y-auto pt-10 pb-20 px-4 flex justify-center bg-[#0A0E15]">
                <div className="w-full max-w-[816px] min-h-[1056px] bg-zinc-900 border border-zinc-800/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-12 md:p-16 flex flex-col mx-auto mb-10 rounded-sm">
                    <Editor
                        title={currentContent}
                        onChange={handleContentChange}
                    />
                </div>
            </main>

            {/* Share & Collaboration Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                doc={doc}
                onUpdate={(updatedDoc) => setDoc(updatedDoc)}
            />
        </div>
    );
}

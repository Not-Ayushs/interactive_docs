import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import Background from '../components/Background.jsx';
import CapsuleButton from '../components/CapsuleButton.jsx';
import { FiPlus, FiFolder, FiX, FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi';

const INITIAL_COLLECTIONS = [
    { id: '1', title: 'Engineering' },
    { id: '2', title: 'Medical Research' },
    { id: '3', title: 'Project Notes' },
    { id: '4', title: 'General' },
    { id: '5', title: 'Design System' },
    { id: '6', title: 'API Specs & References' }
];

export default function Collections() {
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [docCounts, setDocCounts] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'rename'
    const [targetColId, setTargetColId] = useState(null);
    const [collectionTitle, setCollectionTitle] = useState('');
    const [error, setError] = useState('');
    const [activeMenuId, setActiveMenuId] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('DOCS_COLLECTIONS');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Ensure default collections like General are present
                const combined = [...parsed];
                INITIAL_COLLECTIONS.forEach(ic => {
                    if (!combined.some(c => c.title === ic.title)) {
                        combined.push(ic);
                    }
                });
                setCollections(combined);
            } catch (e) {
                setCollections(INITIAL_COLLECTIONS);
            }
        } else {
            setCollections(INITIAL_COLLECTIONS);
            localStorage.setItem('DOCS_COLLECTIONS', JSON.stringify(INITIAL_COLLECTIONS));
        }
    }, []);

    // Fetch document counts & dynamically sync collections with MongoDB documents
    useEffect(() => {
        const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        fetch(`${apiBaseUrl}/api/documents`)
            .then(res => res.json())
            .then(docs => {
                const counts = {};
                const dynamicCols = [];

                if (Array.isArray(docs)) {
                    docs.forEach(doc => {
                        const colName = doc.collectionName || 'General';
                        counts[colName] = (counts[colName] || 0) + 1;

                        if (!dynamicCols.includes(colName)) {
                            dynamicCols.push(colName);
                        }
                    });
                }

                setDocCounts(counts);

                // Dynamically append any new collectionName found in MongoDB
                if (dynamicCols.length > 0) {
                    setCollections(prev => {
                        const updated = [...prev];
                        let changed = false;
                        dynamicCols.forEach(colName => {
                            if (!updated.some(c => c.title.toLowerCase() === colName.toLowerCase())) {
                                updated.push({
                                    id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
                                    title: colName
                                });
                                changed = true;
                            }
                        });
                        if (changed) {
                            localStorage.setItem('DOCS_COLLECTIONS', JSON.stringify(updated));
                        }
                        return updated;
                    });
                }
            })
            .catch(err => console.error("Error fetching doc counts:", err));
    }, []);

    // Close active dropdown menu when clicking anywhere outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const saveCollections = (updated) => {
        setCollections(updated);
        localStorage.setItem('DOCS_COLLECTIONS', JSON.stringify(updated));
    };

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setTargetColId(null);
        setCollectionTitle('');
        setError('');
        setShowModal(true);
    };

    const handleOpenRenameModal = (col) => {
        setModalMode('rename');
        setTargetColId(col.id);
        setCollectionTitle(col.title);
        setError('');
        setShowModal(true);
    };

    const handleSubmitForm = (e) => {
        e.preventDefault();
        const trimmed = collectionTitle.trim();
        if (!trimmed) {
            setError('Please enter a collection title.');
            return;
        }

        if (modalMode === 'create') {
            const newCol = {
                id: Date.now().toString(),
                title: trimmed
            };
            const updated = [...collections, newCol];
            saveCollections(updated);
        } else if (modalMode === 'rename') {
            const updated = collections.map(c => 
                c.id === targetColId ? { ...c, title: trimmed } : c
            );
            saveCollections(updated);
        }

        setCollectionTitle('');
        setError('');
        setShowModal(false);
    };

    const handleOpenCollection = (title) => {
        navigate(`/app/collections/${encodeURIComponent(title)}`);
    };

    const handleDeleteCollection = (id) => {
        const updated = collections.filter(c => c.id !== id);
        saveCollections(updated);
        setActiveMenuId(null);
    };

    const toggleMenu = (e, id) => {
        e.stopPropagation();
        setActiveMenuId(prev => prev === id ? null : id);
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#0A0E15]">
            <AppNavbar />
            <Background />

            {/* Main Collections Content Container */}
            <div className="fixed inset-0 z-20 pt-24 px-12 pb-12 overflow-y-auto flex flex-col items-center">
                <div className="w-full max-w-6xl flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <FiFolder className="text-white" /> Collections
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1">
                            Organize your documents by category folders.
                        </p>
                    </div>

                    <CapsuleButton
                        type="active"
                        onClick={handleOpenCreateModal}
                    >
                        <FiPlus className="text-lg" />
                        <span>New Collection</span>
                    </CapsuleButton>
                </div>

                {/* Collections Folder Grid */}
                <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {collections.map((col) => {
                        const count = docCounts[col.title] || 0;
                        const folderSrc = count > 0 ? "/FilledFolder.png" : "/NotFiledFolder.png";

                        return (
                            <div
                                key={col.id}
                                onClick={() => handleOpenCollection(col.title)}
                                className="group relative flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105"
                            >
                                {/* Folder Image Container */}
                                <div className="relative w-64 h-52 flex items-center justify-center drop-shadow-2xl">
                                    <img
                                        src={folderSrc}
                                        alt="Folder"
                                        className="w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-300"
                                    />

                                    {/* Transparent Overlay Div over the Folder Image */}
                                    <div className="absolute inset-x-0 bottom-8 px-4 flex flex-col items-center justify-center text-center pointer-events-none">
                                        <h3 className="text-white font-bold text-base tracking-wide truncate max-w-[85%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                                            {col.title}
                                        </h3>
                                        <span className="text-[11px] text-amber-300 font-semibold tracking-wider uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] mt-0.5">
                                            {count > 0 ? `${count} Document${count > 1 ? 's' : ''}` : 'Open Collection'}
                                        </span>
                                    </div>

                                    {/* 3-Dot Options Button */}
                                    <div className="absolute top-4 right-4 z-30">
                                        <button
                                            type="button"
                                            onClick={(e) => toggleMenu(e, col.id)}
                                            title="Folder Options"
                                            className="p-2 rounded-full bg-black/40 hover:bg-black/80 text-zinc-300 hover:text-white backdrop-blur-sm transition-all duration-200"
                                        >
                                            <FiMoreVertical className="text-base" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeMenuId === col.id && (
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                className="absolute right-0 mt-2 w-36 bg-zinc-900/95 border border-zinc-700/80 rounded-xl shadow-2xl py-1.5 z-40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(null);
                                                        handleOpenRenameModal(col);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
                                                >
                                                    <FiEdit2 className="text-zinc-300 text-sm" />
                                                    <span>Rename</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteCollection(col.id);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                                                >
                                                    <FiTrash2 className="text-sm" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {collections.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-zinc-500 text-lg mb-4">No collections created yet.</p>
                        <CapsuleButton type="active" onClick={handleOpenCreateModal}>
                            <FiPlus className="text-lg" />
                            <span>Create First Collection</span>
                        </CapsuleButton>
                    </div>
                )}
            </div>

            {/* Modal Form for Creating / Renaming Collection */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#121824] border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                            <FiX className="text-xl" />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-1">
                            {modalMode === 'create' ? 'Create New Collection' : 'Rename Collection'}
                        </h2>
                        <p className="text-zinc-400 text-xs mb-6">
                            {modalMode === 'create'
                                ? 'Fill in the title below to create a new folder.'
                                : 'Update the title for this collection folder.'}
                        </p>

                        <form onSubmit={handleSubmitForm} className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                                    Collection Title
                                </label>
                                <input
                                    type="text"
                                    value={collectionTitle}
                                    onChange={(e) => {
                                        setCollectionTitle(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder="Enter title (e.g. Work Docs)"
                                    autoFocus
                                    className="w-full bg-zinc-900/90 border border-zinc-700 focus:border-amber-100 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none transition-colors"
                                />
                                {error && (
                                    <p className="text-red-400 text-xs mt-2 font-medium">{error}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <CapsuleButton
                                    type="outline"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </CapsuleButton>
                                <CapsuleButton
                                    type="active"
                                    buttonType="submit"
                                >
                                    {modalMode === 'create' ? 'Create' : 'Save Title'}
                                </CapsuleButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
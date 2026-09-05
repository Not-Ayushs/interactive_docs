import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../store/uiSlice';
import Sidebar from '../components/Sidebar.jsx';
import Background from '../components/Background.jsx';
import AddDocButton from '../components/AddDocButton.jsx';
import AddDocModal from '../components/AddDocModal.jsx';
import { FiSearch, FiPlus, FiDownload, FiTrash2, FiMenu } from 'react-icons/fi';
import { getApiBaseUrl } from '../utils/api.js';

const DEFAULT_SHORTCUTS = [
    { title: 'Promotion', edited: 'Edited 2 days ago' },
    { title: 'Store', edited: 'Edited 5 days ago' },
    { title: 'Gold store', edited: 'Edited 8 days ago' },
    { title: 'Milke', edited: 'Edited 10 days ago' },
    { title: 'InStore', edited: 'Edited 17 days ago' },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [shortcuts, setShortcuts] = useState(DEFAULT_SHORTCUTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
    const dispatch = useDispatch();

    useEffect(() => {
        const apiBaseUrl = getApiBaseUrl();
        const token = localStorage.getItem('token');
        fetch(`${apiBaseUrl}/api/documents`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(docs => {
                if (Array.isArray(docs) && docs.length > 0) {
                    setDocuments(docs);
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('DOCS_COLLECTIONS');
        if (saved) {
            try {
                const userCols = JSON.parse(saved);
                if (Array.isArray(userCols) && userCols.length > 0) {
                    const combined = [
                        ...userCols.map(c => ({ title: c.title, edited: 'Edited recently' })),
                        ...DEFAULT_SHORTCUTS.filter(ds => !userCols.some(uc => uc.title === ds.title))
                    ];
                    setShortcuts(combined);
                }
            } catch (e) {}
        }
    }, []);

    const handleAddDoc = (newDoc) => {
        setDocuments(prev => [newDoc, ...prev]);
    };

    const filteredShortcuts = shortcuts.filter(sc => 
        sc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#0A0A0A]">
            <Sidebar />
            <Background />

            {/* Main Content Area */}
            <div className={`transition-all duration-300 h-full flex flex-col z-20 relative pl-0 ${sidebarOpen ? 'sm:pl-[240px]' : 'sm:pl-[80px]'}`}>
                
                {/* Header Section */}
                <div className="px-4 sm:px-10 pt-12 pb-6 border-b border-zinc-800/50 flex flex-col md:flex-row md:items-end justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            className="sm:hidden text-zinc-400 hover:text-white"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <FiMenu size={24} />
                        </button>
                        <div>
                            <p className="text-zinc-500 text-sm mb-1">Choose project:</p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                Choose a project to work
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 md:mt-0 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search"
                                className="w-full bg-[#111111] border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                            />
                            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        </div>
                        
                        <div className="flex gap-2">
                            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors bg-[#111111] rounded-lg border border-zinc-800">
                                <FiPlus size={16} /> Create
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors bg-[#111111] rounded-lg border border-zinc-800">
                                <FiTrash2 size={16} /> Remove
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-10">
                    <div className="flex flex-wrap gap-10 mt-4">
                        {filteredShortcuts.map((sc, index) => {
                            const hasDocs = documents.some(doc => doc.collectionName === sc.title);
                            const folderSrc = hasDocs ? "/FilledFolder.png" : "/NotFiledFolder.png";
                            
                            return (
                                <div
                                    key={index}
                                    onClick={() => navigate(`/app/collections/${encodeURIComponent(sc.title)}`)}
                                    className="group flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-105"
                                >
                                    <div className="w-32 h-28 relative flex items-center justify-center">
                                        <img
                                            src={folderSrc}
                                            alt="Folder"
                                            className="w-full h-full object-contain filter group-hover:brightness-125 transition-all"
                                        />
                                    </div>
                                    <span className="text-sm text-zinc-400 group-hover:text-white font-medium text-center mt-3 max-w-[120px] truncate leading-tight">
                                        {sc.title}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>

            {/* Floating Add Document (+) Button */}
            <div className="text-black text-[4.3vh] rounded-full bg-white fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-fit h-fit z-40 flex justify-center items-center hover:scale-110 transition-transform duration-200 shadow-2xl">
                <AddDocButton onClick={() => setShowAddModal(true)} />
            </div>

            <AddDocModal 
                showModal={showAddModal} 
                setShowModal={setShowAddModal} 
                onAdd={handleAddDoc} 
            />
        </div>
    );
}
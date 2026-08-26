import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import Background from '../components/Background.jsx';
import DashboardCard from '../components/DashboardCard.jsx';
import AddDocButton from '../components/AddDocButton.jsx';
import AddDocModal from '../components/AddDocModal.jsx';
import { 
    FiSearch, FiFileText, FiCode, FiDatabase, 
    FiLayers, FiZap, FiFolder 
} from 'react-icons/fi';

const SAMPLE_DOCS = [
    {
        _id: 'doc-1',
        collectionName: 'Engineering',
        title: 'Product Specs',
        desc: 'Centralized documentation for feature requirements, user stories, and technical specs across releases.',
        tag: { tagTitle: 'Product Specs' },
        icon: FiFileText
    },
    {
        _id: 'doc-2',
        collectionName: 'Engineering',
        title: 'Engineering Guidelines',
        desc: 'Best practices, coding standards, and architecture decisions to keep engineering consistent and scalable.',
        tag: { tagTitle: 'Engineering Guidelines' },
        icon: FiCode
    },
    {
        _id: 'doc-3',
        collectionName: 'API References',
        title: 'API References',
        desc: 'Endpoint definitions, payload structures, and authentication guides for internal and external API use.',
        tag: { tagTitle: 'API References' },
        icon: FiDatabase
    },
    {
        _id: 'doc-4',
        collectionName: 'Design System',
        title: 'Design System',
        desc: 'Components, UI patterns, usage rules, and branding assets for maintaining visual and UX consistency.',
        tag: { tagTitle: 'Design System' },
        icon: FiLayers
    },
    {
        _id: 'doc-5',
        collectionName: 'Release Notes',
        title: 'Release Notes',
        desc: 'Chronological logs of version changes, bug fixes, new features, and known issues across builds.',
        tag: { tagTitle: 'Release Notes' },
        icon: FiFileText
    },
    {
        _id: 'doc-6',
        collectionName: 'Sprint Archives',
        title: 'Sprint Archives',
        desc: 'Past sprint plans, retrospectives, and key decisions for tracking team velocity and iteration history.',
        tag: { tagTitle: 'Sprint Archives' },
        icon: FiZap
    }
];

const DEFAULT_SHORTCUTS = [
    { title: 'Research & Testing' },
    { title: 'Integrations & Webhooks' },
    { title: 'API Specs & References' },
    { title: 'Analytics & Metrics' },
    { title: 'Security & Compliance' },
    { title: 'Roadmaps & OKRs' },
    { title: 'Archived Projects' }
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [shortcuts, setShortcuts] = useState(DEFAULT_SHORTCUTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        fetch(`${apiBaseUrl}/api/documents`)
            .then(res => res.json())
            .then(docs => {
                if (Array.isArray(docs) && docs.length > 0) {
                    setDocuments(docs);
                } else {
                    setDocuments(SAMPLE_DOCS);
                }
            })
            .catch(() => setDocuments(SAMPLE_DOCS));
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('DOCS_COLLECTIONS');
        if (saved) {
            try {
                const userCols = JSON.parse(saved);
                if (Array.isArray(userCols) && userCols.length > 0) {
                    const combined = [
                        ...userCols.map(c => ({ title: c.title })),
                        ...DEFAULT_SHORTCUTS.filter(ds => !userCols.some(uc => uc.title === ds.title))
                    ];
                    setShortcuts(combined);
                }
            } catch (e) {
                setShortcuts(DEFAULT_SHORTCUTS);
            }
        }
    }, []);

    const handleAddDoc = (newDoc) => {
        setDocuments(prev => [newDoc, ...prev]);
    };

    const iconsList = [FiFileText, FiCode, FiDatabase, FiLayers, FiZap];

    const filteredDocs = documents.filter(doc => {
        const title = doc.tag?.tagTitle || doc.title || '';
        const desc = doc.desc || '';
        const query = searchQuery.toLowerCase();
        return title.toLowerCase().includes(query) || desc.toLowerCase().includes(query);
    });

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#0A0E15]">
            <AppNavbar />
            <Background />

            {/* Scrollable Dashboard View */}
            <div className="fixed inset-0 z-20 pt-24 px-10 pb-16 overflow-y-auto flex flex-col items-center">
                <div className="w-full max-w-6xl">
                    
                    {/* Top Header Row: DOCS. title + Search bar */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Recent Docs
                        </h1>

                        <div className="relative w-72">
                            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-base" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search"
                                className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-zinc-600 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* 3-Column Document Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {filteredDocs.map((doc, idx) => (
                            <DashboardCard
                                key={doc._id || idx}
                                doc={doc}
                                icon={doc.icon || iconsList[idx % iconsList.length]}
                            />
                        ))}
                    </div>

                    {/* Bottom Shortcut Section */}
                    <div className="mt-4 pt-6 border-t border-zinc-800/60">
                        <h2 className="text-xl font-bold text-white mb-6">
                            Shortcut
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {shortcuts.map((sc, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigate(`/app/collections/${encodeURIComponent(sc.title)}`)}
                                    className="group flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-105"
                                >
                                    <div className="w-24 h-20 relative flex items-center justify-center">
                                        <img
                                            src="/NotFiledFolder.png"
                                            alt="Folder"
                                            className="w-full h-full object-contain filter group-hover:brightness-125 transition-all"
                                        />
                                    </div>
                                    <span className="text-xs text-zinc-400 group-hover:text-white font-medium text-center mt-2 max-w-[100px] truncate leading-tight">
                                        {sc.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Floating Add Document (+) Button */}
            <div className="text-black text-[4.3vh] rounded-full bg-white fixed bottom-10 right-10 w-fit h-fit z-40 flex justify-center items-center hover:scale-110 transition-transform duration-200 shadow-2xl">
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
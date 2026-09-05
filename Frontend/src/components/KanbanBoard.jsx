import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiDownload, FiTrash2 } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getApiBaseUrl } from '../utils/api.js';

const apiBaseUrl = getApiBaseUrl();

const KanbanColumn = ({ title, docs, onCardClick, onAddClick }) => {
    return (
        <div className="flex-1 flex flex-col min-w-[280px]">
            <h2 className="text-xl font-bold text-white mb-6">{title}:</h2>
            <Droppable droppableId={title}>
                {(provided) => (
                    <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex flex-col gap-4 flex-1 min-h-[150px] bg-[#1C1D21]/50 p-2 rounded-xl"
                    >
                        {docs.map((doc, idx) => (
                            <Draggable key={doc._id} draggableId={doc._id} index={idx}>
                                {(provided) => (
                                    <div 
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={() => onCardClick && onCardClick(doc)}
                                        className="bg-[#1C1D21] border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-white font-semibold">{doc.title || `Card`}</h3>
                                        </div>
                                        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-4">
                                            {doc.desc || "No description."}
                                        </p>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        <div className="mt-2 flex gap-2">
                            <button onClick={() => onAddClick(title)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-white transition-colors bg-[#1C1D21] rounded border border-zinc-800">
                                <FiPlus size={12} /> Create
                            </button>
                        </div>
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default function KanbanBoard({ collectionName, onAddClick }) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    const fetchCards = async () => {
        try {
            const res = await fetch(`${apiBaseUrl}/api/kanban?collectionName=${collectionName || 'General'}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                // sort by order if needed, but backend should return sorted
                setCards(data);
            }
        } catch (error) {
            console.error("Error fetching kanban cards:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, [collectionName]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createStatus, setCreateStatus] = useState('');
    const [createTitle, setCreateTitle] = useState('');
    const [createType, setCreateType] = useState('text');

    const handleAddClick = (status) => {
        setCreateStatus(status);
        setCreateTitle('');
        setCreateType('text');
        setShowCreateModal(true);
    };

    const submitCreateCard = async (e) => {
        e.preventDefault();
        if (!createTitle.trim()) return;
        
        try {
            const res = await fetch(`${apiBaseUrl}/api/kanban`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: createTitle,
                    desc: "",
                    status: createStatus,
                    collectionName: collectionName || 'General',
                    docType: createType,
                    order: cards.filter(c => c.status === createStatus).length
                })
            });
            if (res.ok) {
                fetchCards();
                setShowCreateModal(false);
            } else {
                const err = await res.json();
                alert(`Error creating card: ${err.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error creating card:", error);
            alert("Network error: Could not reach the server. Please check your connection or CORS settings.");
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return; // No change
        }

        // Optimistic update
        const sourceStatus = source.droppableId;
        const destStatus = destination.droppableId;

        const newCards = Array.from(cards);
        const cardIndex = newCards.findIndex(c => c._id === draggableId);
        const [movedCard] = newCards.splice(cardIndex, 1);
        movedCard.status = destStatus;
        
        const destCards = newCards.filter(c => c.status === destStatus);
        destCards.splice(destination.index, 0, movedCard);

        const updatedCards = newCards.filter(c => c.status !== destStatus).concat(destCards);
        setCards(updatedCards);

        // Update backend
        try {
            await fetch(`${apiBaseUrl}/api/kanban/${draggableId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: destStatus,
                    order: destination.index
                })
            });
        } catch (error) {
            console.error("Error updating card:", error);
            fetchCards(); // rollback
        }
    };

    const columns = ['User story', 'To do', 'In progress', 'Done'];

    return (
        <div className="w-full h-full flex flex-col p-4 sm:p-10 pt-6 sm:pt-12 overflow-hidden">
            {/* Header Section */}
            <div className="border-b border-zinc-800/50 flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 shrink-0">
                <div>
                    <p className="text-zinc-500 text-sm mb-1">Edit your plan:</p>
                    <h1 className="text-3xl font-bold text-white">
                        Kanban board
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => handleAddClick('User story')} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors bg-[#1C1D21] rounded-lg border border-zinc-800 w-full sm:w-auto justify-center">
                            <FiPlus size={16} /> Create
                        </button>
                    </div>

                    <div className="relative w-full sm:w-48">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full bg-[#1C1D21] border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                        />
                        <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    </div>
                </div>
            </div>

            {/* Kanban Columns */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 overflow-x-auto flex-1 pb-4 items-start">
                    {loading ? (
                        <div className="text-zinc-500">Loading cards...</div>
                    ) : (
                        columns.map(col => (
                            <KanbanColumn 
                                key={col} 
                                title={col} 
                                docs={cards.filter(c => c.status === col && c.title.toLowerCase().includes(searchQuery.toLowerCase()))} 
                                onAddClick={handleAddClick} 
                                onCardClick={(doc) => navigate(doc.docType === 'canvas' ? `/app/canvas/${doc._id}` : `/app/editor/${doc._id}`)}
                            />
                        ))
                    )}
                </div>
            </DragDropContext>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-[30vw] min-w-[320px] rounded-2xl bg-zinc-900 border border-zinc-800 text-white p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setShowCreateModal(false)}
                            className="absolute right-4 top-4 text-zinc-400 hover:text-white transition-colors"
                        >
                            <FiTrash2 className="hidden" /> {/* just importing X from somewhere? No, just use text or an icon */}
                            <span className="text-xl">&times;</span>
                        </button>
                        
                        <h2 className="text-xl font-bold mb-1">Create Card</h2>
                        <p className="text-xs text-zinc-400 mb-5">Adding to: <span className="font-medium text-amber-300">{createStatus}</span></p>
                        
                        <form onSubmit={submitCreateCard} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Title</label>
                                <input
                                    type="text"
                                    value={createTitle}
                                    onChange={(e) => setCreateTitle(e.target.value)}
                                    placeholder="Enter card title..."
                                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-white text-sm"
                                    autoFocus
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Document Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            value="text" 
                                            checked={createType === "text"} 
                                            onChange={(e) => setCreateType(e.target.value)}
                                            className="cursor-pointer"
                                        />
                                        <span className="text-sm">Text Document</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            value="canvas" 
                                            checked={createType === "canvas"} 
                                            onChange={(e) => setCreateType(e.target.value)}
                                            className="cursor-pointer"
                                        />
                                        <span className="text-sm">Infinite Canvas</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!createTitle.trim()}
                                    className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-zinc-950 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

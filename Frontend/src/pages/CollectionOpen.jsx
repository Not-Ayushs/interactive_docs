import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Background from '../components/Background.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';
import AddDocModal from '../components/AddDocModal.jsx';
import { getApiBaseUrl } from '../utils/api.js';

export default function CollectionOpen() {
    const { collectionName } = useParams();
    const navigate = useNavigate();
    const decodedName = collectionName ? decodeURIComponent(collectionName) : 'Untitled Collection';
    
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [documents, setDocuments] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleAddDoc = (newDoc) => {
        setDocuments(prev => [...prev, newDoc]);
    };

    useEffect(() => {
        const apiBaseUrl = getApiBaseUrl();
        const url = collectionName 
            ? `${apiBaseUrl}/api/documents?collectionName=${encodeURIComponent(collectionName)}`
            : `${apiBaseUrl}/api/documents`;

        const token = localStorage.getItem('token');
        fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(docs => {
                if (Array.isArray(docs)) {
                    setDocuments(docs);
                }
            })
            .catch(err => console.error("Error fetching documents:", err));
    }, [collectionName]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#0A0A0A]">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <Background />

            {/* Main Content Area */}
            <div className={`transition-all duration-300 h-full flex flex-col z-20 relative ${sidebarOpen ? 'pl-[240px]' : 'pl-[80px]'}`}>
                <KanbanBoard documents={documents} collectionName={decodedName} onAddClick={() => setShowAddModal(true)} />
            </div>

            <AddDocModal 
                showModal={showAddModal} 
                setShowModal={setShowAddModal} 
                onAdd={handleAddDoc} 
                collectionName={decodedName}
            />
        </div>
    );
}
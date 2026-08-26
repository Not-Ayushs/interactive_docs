import Card from './Card'
import {useRef, useState, useEffect} from 'react'
import AddDocButton from './AddDocButton'
import AddDocModal from './AddDocModal'
import { motion } from 'framer-motion'

export default function Foreground({ className = "", collectionName = "" }) {
    const ref = useRef(null);
    const [data, setData] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const url = collectionName 
            ? `${apiBaseUrl}/api/documents?collectionName=${encodeURIComponent(collectionName)}`
            : `${apiBaseUrl}/api/documents`;

        fetch(url)
            .then(res => res.json())
            .then(docs => setData(docs))
            .catch(err => console.error("Error fetching documents:", err));
    }, [collectionName]);

    const handleAddDoc = (newDoc) => {
        setData(prev => [...prev, newDoc]);
    };

    const handleUpdateDoc = (updatedDoc) => {
        setData(prev => prev.map(doc => doc._id === updatedDoc._id ? updatedDoc : doc));
    };

    return (
        <>
            <motion.div 
                layout
                ref={ref} 
                className={`fixed z-20 top-0 left-0 w-full h-full flex gap-5 flex-wrap px-12 pb-12 overflow-y-auto ${className ? className : 'pt-24'}`}
            >
                {data.map((item, index) => (
                    <Card key={item._id || index} data={item} reference={ref} onUpdate={handleUpdateDoc}/>
                ))}
            </motion.div>

            <div className='text-black text-[4.3vh] rounded-full bg-white absolute bottom-10 right-5 w-fit h-fit z-30 flex justify-center items-center hover:scale-110 transition-transform duration-200 shadow-xl'>
                <AddDocButton onClick={() => setShowAddModal(true)} />
            </div>

            <AddDocModal 
                showModal={showAddModal} 
                setShowModal={setShowAddModal} 
                onAdd={handleAddDoc} 
                collectionName={collectionName}
            />
        </>
    )
}

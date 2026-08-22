import Card from './Card'
import {useRef, useState, useEffect} from 'react'
import AddDocButton from './AddDocButton'
import AddDocModal from './AddDocModal'

export default function Foreground() {
    const ref = useRef(null);
    const [data, setData] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetch("http://localhost:5000/api/documents")
            .then(res => res.json())
            .then(docs => setData(docs))
            .catch(err => console.error("Error fetching documents:", err));
    }, []);

    const handleAddDoc = (newDoc) => {
        setData(prev => [...prev, newDoc]);
    };

    const handleUpdateDoc = (updatedDoc) => {
        setData(prev => prev.map(doc => doc._id === updatedDoc._id ? updatedDoc : doc));
    };

    return (
        <>
            <div ref={ref} className=" fixed z-3 top-0 left-0 w-full h-full flex gap-5 flex-wrap p-20">
                {data.map((item, index) => (
                    <Card key={item._id || index} data={item} reference={ref} onUpdate={handleUpdateDoc}/>
                ))}
            </div>
            
            <div className='text-white text-[4.3vh] rounded-full bg-green-300 absolute bottom-10 right-5 w-fit h-fit z-60 flex justify-center items-center hover:scale-115 transition-transform duration-200'>
                <AddDocButton onClick={() => setShowAddModal(true)} />
            </div>

            <AddDocModal 
                showModal={showAddModal} 
                setShowModal={setShowAddModal} 
                onAdd={handleAddDoc} 
            />
        </>
    )
}


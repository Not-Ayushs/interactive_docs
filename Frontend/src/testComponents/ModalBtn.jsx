import {useState} from 'react'
import Modal from './Modal.jsx'


export default function ModalBtn(){
    const[showModal, setShowModal] = useState(false);

    const openModal = () => {
        setShowModal(prev => !prev)
    }
    return(
        <>
        <button onClick={openModal} className=" cursor-pointer hover:bg-zinc-900 transition-all absolute top-1/2 left-20 translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-zinc-950 px-5 py-2 font-semibold text-white ">Open Modal</button>
        <Modal showModal={showModal} setShowModal={setShowModal}/>
        </>
    )
}
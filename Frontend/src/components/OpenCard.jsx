import { IoIosCloseCircle } from "react-icons/io";



export default function OpenCard({ showModal, setShowModal }) {

    const closeModal = () => {
        setShowModal(prev => !prev)
    }
    return (
        <>
            {showModal && <div className="h-[89vh] bg-zinc-950 w-[36vw] z-100 rounded-xl absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
                <button onClick={closeModal} className='absolute right-0 top-2 cursor-pointer bg-zinc-950 text-white rounded-2xl px-5 py-2 hover:bg-zinc-950 transition-all' ><IoIosCloseCircle color='red' size={20} />
                </button>
            </div>}


        </>
    )
}
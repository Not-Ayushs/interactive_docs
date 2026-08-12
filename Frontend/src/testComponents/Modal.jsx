import Tiptap from './Tiptap.jsx'


export default function Modal({showModal, setShowModal}) {
    let title = 'my first doc'
    return(
        <>
            {showModal && <div className="h-[89vh] text-white px-10 py-8 bg-zinc-950 w-[40vw] z-100 rounded-xl absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]"><Tiptap title={title}/></div>}
            <div>
                
            </div>
        </>
    )
}



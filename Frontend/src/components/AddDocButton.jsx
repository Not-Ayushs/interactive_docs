import { IoMdAddCircle } from "react-icons/io";

export default function AddDocButton({ onClick }){
    return(
        <>
            <button onClick={onClick} className="cursor-pointer flex items-center justify-center p-2">
                <IoMdAddCircle />
            </button>
        </>
    )
}
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaDownload } from "react-icons/fa6";
import {motion} from 'framer-motion';




export default function Card({data, reference}) {
    return (
        <>
            <motion.div drag dragConstraints={reference}  whileDrag={{cursor: "grabbing", scale: 1.1}}  className="shrink-0 overflow-hidden relative rounded-[45px] w-60 h-72 bg-zinc-900/90 text-white px-7 py-10">
                <IoDocumentTextOutline />

                <p className='leading-tight text-sm mt-5 font-semibold'>{data.desc}</p>
                <div className=" footer absolute bottom-0 w-full left-0">
                    <div className="flex items-center justify-between mb-3 py-3 px-8">
                        <h5 className='text-xs'>{data.filesize}</h5>
                        <span className="w-6 h-6 rounded-full flex items-center justify-center bg-zinc-700"><FaDownload size={12}/></span>


                    </div>
                    <div className={`tag w-full py-3 bg-${data.tag.tagColor}-500 flex items-center justify-center`}>
                        <h3 className="text-sm font-semibold">{data.tag.tagTitle}</h3>
                    </div>
                </div>
                   
            </motion.div>
        </>
    )
}
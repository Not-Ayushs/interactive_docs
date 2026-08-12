import Card from './Card'
import {useRef} from 'react'
import AddDocButton from './AddDocButton'
export default function Foreground() {
    const ref = useRef(null);
    const data = [
        // IconBase, DecompressionStream, filesize, closeORdownload, tagdetails
        { desc: "This is the doc content you are seeying rn", filesize: ".9mb", close: true, tag: { isOpen: false , tagTitle: "MBBS", tagColor: "green" }},
        { desc: "This is the second doc content you are seeying ", filesize: ".9mb", close: true, tag: { isOpen: false , tagTitle: "Engineering", tagColor: "green" }},
        { desc: "This is the doc content you are seeying rn", filesize: ".9mb", close: true, tag: { isOpen: false , tagTitle: "Doenload Now", tagColor: "sky" }},
        { desc: "This is the doc content you are seeying rn", filesize: ".9mb", close: true, tag: { isOpen: false , tagTitle: "Doenload Now", tagColor: "blue" }},
        // { desc: "This is the doc content you are seeying rn", filesize: ".9mb", close: true, tag: { isOpen: false , tagTitle: "Doenload Now", tagColor: "amber" }},
        // { desc: "This is the doc content you are seeying rn", filesize: ".9mb", close: true, tag: { isOpen: false , tagTitle: "Doenload ow", tagColor: "green" }},
        // { desc: "This is the doc content you are seeying rn", filesize: ".9mb", close: true, tag: { isOpen: false , tagTitle: "Doenload Now", tagColor: "green" }},
        // { desc: "This is the doc content you are seeying rn", filesize: ".9mb", close: true, tag: { isOpen: false , tagTitle: "Doenload Now", tagColor: "green" }},
    ];

    return (
        <>
            <div ref={ref} className=" fixed z-3 top-0 left-0 w-full h-full flex gap-10 flex-wrap p-20">

                {data.map((item, index) => (
                    <Card key={index} data={item} reference={ref}/>
                ))}
            </div>
            <div className='text-white text-[4.3vh] rounded-full bg-green-300 absolute bottom-10 right-5 w-fit h-fit z-60 flex justify-center items-center '>
                <AddDocButton />
            </div>
        </>
    )
}


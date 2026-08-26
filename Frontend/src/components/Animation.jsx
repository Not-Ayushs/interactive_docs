export default function Animation() {
    return (
        <>
            <div className="">
                <div className='mt-10 h-86 w-72 relative'>
                    <img width={1000} height={1000} src="../../../public/stackreal.png" className='absolute inset-y-0 left-0 h-full w-full object-contain' />
                </div>
                <div className="group absolute bottom-84 z-20 h-80 w-66">
                    <img width={1000} height={1000} src="../../../public/BEFOREHOVER.png" alt="" className='absolute inset-y-0 h-full w-full object-contain left-12 opacity-100' />
                </div>
                <div className="group absolute bottom-84 z-20 h-80 w-66">
                    <img width={1000} height={1000} src="../../../public/HeroCard.png" alt="" className='absolute inset-y-0 h-full w-full object-contain left-12 opacity-0 group-hover:opacity-100 transition-opacity duration-100 group-hover:duration-200' />
                </div>
            </div>
        </>
    )
}
import CapsuleButton from '../components/CapsuleButton.jsx'

export default function Hero() {
    return (
        <>
            

            <div className=" hero flex flex-col justify-center ">
                <h1 className='text-[5.5vw] leading-[5rem] font-extrabold text-[#b36315ff] text-center ali'>Turn your knowledge <br /> into an interactive <br /> workspace.</h1>
                <h3 className="text-center mt-8 text-slate-500 text-2xl">Documentation, notes, and collaboration — all in one place.</h3>
                <p className='text-center mt-5 text-white'>Create, organize, edit, and share documentation and quick notes in one collaborative workspace <br /> designed to make knowledge easier to manage and work with.</p>
                <div className="hero-btns flex justify-center mt-10">
                    <div className="get-started mt-5 mb-5 ml-5 ">
                        <CapsuleButton label={"Get Started"} type={"active"} />
                    </div>
                    <div className="view-demo mt-5 mb-5 ml-5 ">
                        <CapsuleButton label={"View Demo"} type={"not-active"} />
                    </div>
                </div>


            </div>
        </>
    )
}
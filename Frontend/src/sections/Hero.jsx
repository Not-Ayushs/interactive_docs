import CapsuleButton from '../components/CapsuleButton.jsx'

export default function Hero() {
    return (
        <>
            <div className="hero">
                <h1 className='text-8xl font-extrabold text-[#b36315ff] text-center'>Documentation that <br />works with you.</h1>
                <p className='text-center mt-10 text-white'>Create, organize, edit, and share documentation and quick notes in one collaborative workspace <br /> designed to make knowledge easier to manage and work with.</p>
                <div className="hero-btns flex ">
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
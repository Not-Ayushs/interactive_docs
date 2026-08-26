import CapsuleButton from './CapsuleButton'

export default function Navbar() {
    return (
        <>
            <div className="nav flex justify-between align-middle">
                <div className="logo text-white text-2xl font-extrabold mr-20">iDOCS.</div>
                <div className="pages flex text-white text-xl font-bold gap-10">
                    <p>Templates</p>
                    <p>Features</p>
                    <p>Pricing</p>
                    <p>About</p>
                </div>
                <div className="sign flex">
                    <div className="login mr-5">
                        <CapsuleButton label={"Login"} type={"active"}/>
                    </div>
                    <div className="signup">
                        <CapsuleButton label={"Sign up"} type={"not-active"}/>
                    </div>
                </div>
            </div>
        </>
    )
}
import Hero from '../../sections/Hero.jsx'
import Navbar from '../../components/Navbar.jsx'

export default function Landing() {
    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-10 px-10 py-6">
                <Navbar />
            </div>
            <div className="p-32">
                <Hero />
            </div>
        </>
    )
}

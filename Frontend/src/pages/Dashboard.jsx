import Background from '../components/Background.jsx'
import Foreground from '../components/Foreground.jsx'
import AppNavbar from '../components/AppNavbar.jsx'

export default function Dashboard(){
    return (
        <div className="relative w-full h-screen overflow-hidden">
            <AppNavbar />
            <Background />
            <Foreground />
        </div>
    )
}
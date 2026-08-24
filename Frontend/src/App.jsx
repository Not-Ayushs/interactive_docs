import { useState } from 'react'
import './App.css'
import Background from './components/Background.jsx'
import Foreground from './components/Foreground.jsx'
import ModalBtn from './testComponents/ModalBtn.jsx'
import Tiptap from './testComponents/Tiptap.jsx'
import Sidebar from './components/Sidebar.jsx'


function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className=" relative w-full h-screen bg-[#0A0E15] overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Background />
      <Foreground isSidebarOpen={isSidebarOpen} />
    </div>
  )
}

export default App

import { useState } from 'react'
import './App.css'
import Background from './components/Background.jsx'
import Foreground from './components/Foreground.jsx'
import ModalBtn from './testComponents/ModalBtn.jsx'
import Tiptap from './testComponents/Tiptap.jsx'

function App() {

  return (
    <div className=" relative w-full h-screen bg-[#ffffff]">
      <Background />
      <Tiptap />
      {/* <Foreground /> #042a34 */}



    </div>
  )
}

export default App

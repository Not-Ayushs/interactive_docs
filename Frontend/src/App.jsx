import { useState } from 'react'
import './App.css'
import Background from './components/Background.jsx'
import Foreground from './components/Foreground.jsx'
import ModalBtn from './testComponents/ModalBtn.jsx'
import Tiptap from './testComponents/Tiptap.jsx'


function App() {
// c3d0d4 042a34
  return (
    <div className=" relative w-full h-screen bg-[#042a34]">
      <Background />
      {/* <ModalBtn /> */}
      <Foreground /> 



    </div>
  )
}

export default App

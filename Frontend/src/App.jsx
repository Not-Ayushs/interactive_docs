import { useState } from 'react'
import './App.css'
import Background from './components/Background.jsx'
import Foreground from './components/Foreground.jsx'

function App() {

  return (
    <div className=" relative w-full h-screen bg-[#042a34]">
      <Background />
      <Foreground />

    </div>
  )
}

export default App

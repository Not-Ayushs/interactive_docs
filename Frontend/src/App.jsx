import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard.jsx'
import Landing from './pages/Landing/Landing.jsx'


function App() {
  return (


    
    <div className=" relative w-full h-screen bg-[#0A0E15] overflow-hidden">

      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> */}
        <Route path="/app" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
      
    </div>
  )
}

export default App

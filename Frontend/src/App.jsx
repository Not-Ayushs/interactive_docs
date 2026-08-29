import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard.jsx'
import Collections from './pages/Collections.jsx'
import CollectionOpen from './pages/CollectionOpen.jsx'
import DocEditor from './pages/DocEditor.jsx'
import Landing from './pages/Landing/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Prank from './pages/Prank.jsx'

function App() {
  return (
    <div className="relative w-full h-screen bg-[#0A0E15] overflow-hidden">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/collections" element={<Collections />} />
          <Route path="/app/collections/:collectionName" element={<CollectionOpen />} />
          <Route path="/app/editor/:docId" element={<DocEditor />} />
          
          {/* Prank Routes for Snooping Friends */}
          <Route path="/docs" element={<Prank />} />
          <Route path="/admin" element={<Prank />} />
          <Route path="/wp-admin" element={<Prank />} />
          <Route path="/hidden" element={<Prank />} />
          
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App

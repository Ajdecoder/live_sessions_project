import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import './index.css'
import Admin from './components/Admin'
import Student from './components/Student'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App/>}/>
      <Route path="/admin" element={<Admin/>}/>
      <Route path="/session/:id" element={<Student/>}/>
    </Routes>
  </BrowserRouter>
)
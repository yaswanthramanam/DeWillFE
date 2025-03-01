import { useState } from 'react'
import './App.css'
import './components/AppBar/ResponsiveAppBar'
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home'
import FAQ from './components/FAQ/FAQ';
import DeWill from './components/DeWill/DeWill';

function App() {

  return (
    <div>
          <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/dewill" element={<DeWill />} />
          </Routes>
    </div>



  )
}

export default App

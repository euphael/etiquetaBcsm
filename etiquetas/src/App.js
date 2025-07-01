import React, { useState, useEffect } from 'react';
import Etiquetas from './components/Etiquetas/Etiquetas';
import EtiquetasLoja from './components/EtiquetasLoja/EtiquetasLoja';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';

const App = () => {

  return (
    <div >
      <div className="App">
        <Router>
          <Routes>
            <Route path="/etiquetas" element={<Etiquetas />} />
            <Route path="/etiquetasLoja" element={<EtiquetasLoja />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
};

export default App;

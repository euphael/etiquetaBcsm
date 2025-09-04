import React, { useState, useEffect } from 'react';
import Etiquetas from './components/Etiquetas/Etiquetas';
import EtiquetasLoja from './components/EtiquetasLoja/EtiquetasLoja';
import GestaoOrcamento from './components/GestaoOrcamento/GestaoOrcamento';

// import PlanejamentoProd from './components/PlanejamentoProd/PlanejamentoProd';
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
            <Route path="/GestaoOrcamento" element={<GestaoOrcamento />} />

            {/* <Route path="/PlanejamentoProd" element={<PlanejamentoProd />} /> */}
          </Routes>
        </Router>
      </div>
    </div>
  );
};

export default App;

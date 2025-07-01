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
<<<<<<< HEAD
            <Route path="/etiquetas" element={<Etiquetas />}>
=======
            <Route path="etiquetas" element={<Etiquetas />} 
            >
            <Route path="etiquetasLoja" element={<EtiquetasLoja />}
            />
>>>>>>> 1f974d1f34fc88cab82344e696d0e30b1694f93f
            </Route>
              <Route path="/etiquetasLoja" element={<EtiquetasLoja />}/>
          </Routes>
        </Router>
      </div>
    </div>
  );
};

export default App;

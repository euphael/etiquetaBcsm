import React from 'react';
import Etiquetas from './components/Etiquetas/Etiquetas';
import EtiquetasLoja from './components/EtiquetasLoja/EtiquetasLoja';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <Router basename="/">
        <Routes>
          <Route path="/etiquetas" element={<Etiquetas />} />
          <Route path="/etiquetasLoja" element={<EtiquetasLoja />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;

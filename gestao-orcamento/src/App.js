import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GestaoOrcamento from './components/GestaoOrcamento/GestaoOrcamento';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router basename="/">
        <Routes>
          <Route path="/gestao-orcamento" element={<GestaoOrcamento />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

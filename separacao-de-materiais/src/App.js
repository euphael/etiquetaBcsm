import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SeparacaoMateriais from './components/SeparacaoMateriais/SeparacaoMateriais';

function App() {
  return (
    <div className="App">
      <Router basename="/">
        <Routes>
          <Route path="/separacao-de-materiais" element={<SeparacaoMateriais />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

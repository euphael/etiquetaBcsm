import logo from './logo.svg';
import './App.css';
import PlanejamentoProd from './components/PlanejamentoProd/PlanejamentoProd';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {

  return (
    <div >
      <div className="App">
        <Router>
          <Routes>
            <Route path="/PlanejamentoProd" element={<PlanejamentoProd />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
};

export default App;

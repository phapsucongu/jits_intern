import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {Homepage} from './pages/Homepage';
import { CMSLayout } from './pages/CMSLayout';
import { ProductList } from './components/ProductList';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/product" element={<CMSLayout><ProductList /></CMSLayout>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

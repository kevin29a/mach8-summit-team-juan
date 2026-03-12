import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<div style={{padding: '2rem'}}><h2>Register Placeholder</h2><a href="/">Back</a></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import { Home } from "./pages/Home";
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
      
        <Route element={<MainLayout />}>
          <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
          {/* Add more routes here as needed */}
          {/* <Route path="/register" element={<Register />} /> */}
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        </Route>
      </Routes>

    </Router>
  )
}

export default App

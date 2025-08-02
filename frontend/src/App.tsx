import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Home } from "./pages/Home";
import { SurveyPage } from "./pages/SurveyPage";
import { CompleteQuestion } from "./pages/CompleteQuestion";
import { SurveyHistory } from "./pages/SurveyHistory";
import { TestAnalysis } from "./pages/TestAnalysis";
import { AnalysisResultPage } from "./pages/AnalysisResultPage";

import { SurveyDashboard } from './pages/Admin/SurveyDashBoard';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/complete" element={<CompleteQuestion />} />
        <Route path="/survey-history" element={<SurveyHistory />} />
        <Route path="/analysis" element={<AnalysisResultPage />} />
        <Route path="/test-analysis" element={<TestAnalysis />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} /> 
          <Route path="/admin/survey-dashboard" element={<SurveyDashboard />} />
          {/* Add more routes here as needed */}
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App

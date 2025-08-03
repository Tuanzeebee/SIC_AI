import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Home } from "./pages/Home";
import { SurveyPage } from "./pages/SurveyPage";
import { CompleteQuestion } from "./pages/CompleteQuestion";
import { SurveyHistory } from "./pages/SurveyHistory";
import { SurveyDashboard } from './pages/Admin/SurveyDashBoard';
import { Tutorial } from './pages/TutorialPrediction';
import CsvUpload from './components/CsvUpload';
import { CourseDetail } from './pages/CourseDetail';
import { PreLearningPath } from './pages/PreLearingPath';
import StudyWithMe from './pages/Studywithme';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/complete" element={<CompleteQuestion />} />
        <Route path="/survey-history" element={<SurveyHistory />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/study-with-me" element={<StudyWithMe />} /> 
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} /> 
          <Route path="/tutorial" element={<Tutorial />} />
          <Route path="/admin/survey-dashboard" element={<SurveyDashboard />} />
          <Route path="/csv-upload" element={<CsvUpload />} />
          <Route path="/course-detail" element={<CourseDetail />} />
          <Route path="/pre-learning-path" element={<PreLearningPath />} />

          {/* Add more routes here as needed */}
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App

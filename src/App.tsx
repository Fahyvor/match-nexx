import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ApplicantDashboard from './pages/applicant/Dashboard';
import CVBuilder from './pages/applicant/CVBuilder';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import Nav from './components/Nav';
import { useEffect } from 'react';
import { useAppDispatch } from "./redux/hooks";
import { fetchStatesAndLgas } from './redux/slices/stateSlice';
import PageNotFound from './pages/PageNotFound';
import AllJobs from './pages/jobs/AllJobs';
import CreateJobPage from './pages/jobs/CreateJobs';
export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchStatesAndLgas());
  }, [dispatch]);

  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Applicant Routes */}
        <Route element={<ProtectedRoute role="applicant" />}>
          <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
          <Route path="/applicant/cv-builder" element={<CVBuilder />} />
        </Route>

        {/* Recruiter Routes */}
        <Route element={<ProtectedRoute role="recruiter" />}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/create-job" element={<CreateJobPage />} />
        </Route>

        {/* Settings Route */}
        <Route element={<ProtectedRoute />}>
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/jobs" element={<AllJobs />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}
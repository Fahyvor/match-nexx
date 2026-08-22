import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ApplicantDashboard from './pages/applicant/Dashboard';
import CVBuilder from './pages/applicant/CVBuilder';
import CVPreview from './pages/applicant/CVPreview';
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
import JobApplication from './pages/applicant/JobApplication';
import Candidates from './pages/recruiter/Candidates';
import CandidatesProfile from './pages/recruiter/CandidatesProfile';
import PaymentResult from "./components/PaymentResult";
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/Terms';
import Pricing from './pages/Pricing';
import Documentation from './pages/Docs';
import SystemStatus from './pages/Status';
import NDPACompliance from './pages/NDPA-Compliance';
import SecurityOverview from './pages/Security';
import ContactUs from './pages/Contact';
import AboutUs from './pages/About';

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
        <Route path="/privacy" element={<PrivacyPolicy/>}/>
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/status" element={<SystemStatus />} />
        <Route path="/ndpa-compliance" element={<NDPACompliance />} />
        <Route path="/security" element={<SecurityOverview />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* Applicant Routes */}
        <Route element={<ProtectedRoute role="applicant" />}>
          <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
          <Route path="/applicant/cv-builder" element={<CVBuilder />} />
          <Route path="/applicant/cv-preview" element={<CVPreview />} />
          <Route path="/applicant/apply-job/:jobId" element={<JobApplication />} />
        </Route>

        {/* Recruiter Routes */}
        <Route element={<ProtectedRoute role="recruiter" />}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/create-job" element={<CreateJobPage />} />
        </Route>

        {/* Settings Route */}
        <Route element={<ProtectedRoute />}>
          <Route path="/settings" element={<Settings />} />
          <Route path="/jobs" element={<AllJobs />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/candidates/:id" element={<CandidatesProfile />} />
        </Route>
        <Route path="/applicant/cv/payment/callback" element={<PaymentResult />} />
        <Route path="/applicant/cv/payment/success" element={<PaymentResult />} />
        <Route path="/applicant/cv/payment/failed" element={<PaymentResult />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}
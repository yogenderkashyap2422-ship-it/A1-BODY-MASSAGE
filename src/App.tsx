import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Orders from './pages/Orders';
import Report from './pages/Report';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import WorkerDashboard from './pages/WorkerDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="contact" element={<Contact />} />
            <Route path="orders" element={<Orders />} />
            <Route path="report" element={<Report />} />
            <Route path="login" element={<Login />} />
            <Route path="admin" element={<Admin />} />
            <Route path="profile" element={<Profile />} />
            <Route path="worker" element={<WorkerDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

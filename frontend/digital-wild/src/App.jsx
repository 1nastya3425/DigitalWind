import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/authContext';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import EventsList from './components/EventsList';
import Account from './components/Profile';
import Projects from './components/Projects';
import PostCreation from './components/PostCreation';
import Login from './components/LoginForm';
import Register from './components/RegisterForm';
import AdminPanel from './components/AdminPanel';
import EventDetail from './components/EventDetail';
import ModerationPanel from './components/ModerationPanel';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Header />
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/" element={<MainContent />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path='/account' element={<Account  />} />
            <Route path='/projects' element={<Projects  />} />
            <Route path='/create-post' element={<PostCreation  />} />
            <Route path="/event/:id" element={<EventDetail />} />
            {/* Приватные маршруты */}
            <Route 
              path="/admin" 
              element={
                <PrivateRoute requiredAdmin>
                  <AdminPanel />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/moderationpanel" 
              element={
                <PrivateRoute requiredAdmin>
                  <ModerationPanel />
                </PrivateRoute>
              } 
            />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
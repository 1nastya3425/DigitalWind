import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/authContext';
import PrivateRoute from './components/PrivateRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import EventsList from './components/EventsList';
import Projects from './components/Projects';
import PostCreation from './components/PostCreation';
import Login from './components/LoginForm';
import Register from './components/RegisterForm';
import AdminPanel from './components/AdminPanel';
import EventDetail from './components/EventDetail';
import ModerationPanel from './components/ModerationPanel';
import Profile from './components/Profile';
import EditPost from './components/EditPost';
import './App.css';

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
            <Route path='/account' element={<Profile  />} />
            <Route path='/profile' element={<Profile  />} />
            <Route path='/projects' element={<Projects  />} />
            <Route path='/create-post' element={<PostCreation  />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/edit-post/:postId" element={<EditPost />} />
            {/* Приватные маршруты */}
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/edit-post/:postId" 
              element={
                <ProtectedRoute>
                  <EditPost />
                </ProtectedRoute>
              } 
            />

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
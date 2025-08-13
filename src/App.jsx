import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import HomePage from './pages/HomePage';
import CreateTestPage from './pages/CreateTestPage';
import StartTestPage from './pages/StartTestPage';

const useAuth = () => {
  const token = sessionStorage.getItem('token');
  return !!token;
};

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuth();
  return isAuthenticated ? <Navigate to="/my-test" /> : children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/my-test"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-test"
          element={
            <PrivateRoute>
              <CreateTestPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/start-test"
          element={
            <PrivateRoute>
              <StartTestPage />
            </PrivateRoute>
          }
        />
        <Route path="/results" element={<div>Results Page</div>} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;

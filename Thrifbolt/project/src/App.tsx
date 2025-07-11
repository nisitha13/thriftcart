import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import EcommerceComparison from './components/EcommerceComparison';
import RideComparison from './components/RideComparison';
import DeliveryComparison from './components/DeliveryComparison';
import CategorySelection from './components/CategorySelection';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import ChatBot from './components/ChatBot';
import UserProfile from './components/UserProfile';
import TestPage from './components/TestPage';
import TestRoute from './components/TestRoute';
import DirectTest from './components/DirectTest';
import { AuthProvider } from './contexts/AuthContext';

// Debug log to check if App is mounting
console.log('App component is mounting...');

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="categories" element={<CategorySelection />} />
          <Route path="ecommerce" element={<EcommerceComparison />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="test" element={<TestPage />} />
          <Route path="test-route" element={<TestRoute />} />
          <Route path="direct-test" element={<DirectTest />} />
          <Route path="rides" element={<RideComparison />} />
          <Route path="delivery" element={<DeliveryComparison />} />
        </Route>
        
        {/* Redirect to home for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatBot />
    </AuthProvider>
  );
};

export default App;

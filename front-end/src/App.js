import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PropertyDisplay from './components/propertydisplay/propertydisplay';
import PropertyDetails from './components/propertycard/propertycard';
import Favorites from './Pages/Favorites/Favorites';
import ContextProvider from './Context/ContextProvider';
import Home from './Pages/Home/Home';
import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import PropertiesManagement from './Pages/Admin/PropertiesManagement';
import AgentsManagement from './Pages/Admin/AgentsManagement';
import AuthForm from './Pages/AuthForm/AuthForm';
import ReservationForm from './components/Reservation/ReservationForm';
import BookingForm from './components/Booking/BookingForm';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <ContextProvider>
      <Router>
        <NavBar />
        <Routes>
     
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<PropertyDisplay />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/reservation/:propertyId" element={<ReservationForm />} />
          <Route path="/book/:propertyId" element={<BookingForm />} />
        
          <Route 
            path="/favorites" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <Favorites />
              </ProtectedRoute>
            } 
          />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/properties" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PropertiesManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/agents" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AgentsManagement />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Footer />
      </Router>
    </ContextProvider>
  );
}
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGlobalContext } from '../context/appContext';

const PrivateRoute = ({ children }) => {
  const { user } = useGlobalContext(); // Check if the user is authenticated

  // If the user is authenticated, render the children; otherwise, redirect to the homepage
  return user ? children : <Navigate to="/" />;
};

export default PrivateRoute;

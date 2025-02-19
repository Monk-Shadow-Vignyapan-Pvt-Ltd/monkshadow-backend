// import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import 'regenerator-runtime/runtime';

import Layout from './pages/Layout'
import Home from './pages/Home'
import FormPage from './pages/FormPage'
import WizardForm from './components/WizardForm'
import Datatable from './pages/Datatable'
import Login from './pages/Login'
import Users from './pages/Users'
import Billing from './pages/Billing'

import { RolesProvider } from './RolesContext';
import Career from './pages/Career';
import CareerForms from './pages/CareerForms';
import Package from './pages/package';


function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <ProtectedRoute >
          <RolesProvider>
            <Layout />
          </RolesProvider>
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Home /> },
        { path: 'users', element: <Users /> },
        { path: 'package', element: <Package /> },
        { path: 'contacts', element: <Home /> },
        { path: 'career', element:<Career />},
        { path: 'career-forms', element:<CareerForms />},
        { path: 'form-page', element: <FormPage /> },
        { path: 'wizard-form', element: <WizardForm /> },
        { path: 'data-table', element: <Datatable /> },
        { path: 'billing', element: <Billing /> },

      ],
    },
    {
      path: '/login',
      element: <Login />,
    },

  ]);

  return <RouterProvider router={router} />;
}

export default App;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <AuthProvider>
      <App />
    </AuthProvider>
);

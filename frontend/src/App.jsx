import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home   from './pages/Home.jsx';
import Editor from './pages/Editor.jsx';

const App = () => (
  <Routes>
    <Route path="/"                element={<Home />}   />
    <Route path="/documents/:id"   element={<Editor />} />
    <Route path="*"                element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;

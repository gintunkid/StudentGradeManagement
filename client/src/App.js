import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Training from './Training';
import Lecturer from './Lecturer';
import Student from './Student';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/training" element={<Training />} />
        <Route path="/lecturer" element={<Lecturer />} />
        <Route path="/student" element={<Student />} />
      </Routes>
    </Router>
  );
}

export default App;
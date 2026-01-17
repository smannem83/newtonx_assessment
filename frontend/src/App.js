import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import ProfessionalForm from './components/ProfessionalForm';
import ProfessionalList from './components/ProfessionalList';

function App() {
    return (
        <Router>
            <div>
                <nav>
                    <ul>
                        <li><Link to="/add">Add Professional</Link></li>
                        <li><Link to="/list">View Professionals</Link></li>
                    </ul>
                </nav>
                <hr />
                <Routes>
                    <Route path="/" element={<Navigate to="/add" />} />
                    <Route path="/add" element={<ProfessionalForm />} />
                    <Route path="/list" element={<ProfessionalList />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

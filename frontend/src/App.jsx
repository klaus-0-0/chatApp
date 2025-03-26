import React, { useState } from 'react';
import './App.css';
import ChatBox from './components/ChatBox';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [user, setUser] = useState('');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/chatbox" element={<ChatBox user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;

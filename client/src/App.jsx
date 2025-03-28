import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ChatBox from "./components/ChatBox";
import TestingUi from "./components/TestingUi";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chatbox" element={<ChatBox />} />
        <Route path="/testingUi" element={<TestingUi />} />
      </Routes>
    </Router>
  );
}

export default App;

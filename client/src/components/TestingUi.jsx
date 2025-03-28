import { useState } from "react";
import chatImg from '../assets/hello.svg'
import { useNavigate } from "react-router-dom";

const TestingUi = () => {
    const [animation, setanimation] = useState(false)
    const navigate = useNavigate()

    const handleLogin = () => {
        setanimation(true);
        setTimeout(() => {
            navigate('/Chatbox')
        }, 1200);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <div className="flex flex-col items-center gap-4 p-6 bg-transparent rounded-lg shadow-lg w-80">
                <img src={chatImg} className="w-48 h-48 object-contain" alt="Chat" />
                <button
                    onClick={handleLogin}
                    className={`relative mt-4 flex items-center justify-center w-16 h-16 text-lg font-semibold text-white 
                      bg-gradient-to-r from-green-200 to-green-600 rounded-full shadow-xl 
                      transition-all duration-700 ease-in-out transform border-1
                      ${animation ? "border-green-500" : ""}
                      ${animation ? "" : "hover:scale-110 animate-glow-green"}`}
                >
                    {animation ? "✔" : ">"}
                </button>
            </div>
        </div>
    )
}

export default TestingUi;

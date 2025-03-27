/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Picker from "emoji-picker-react";
import chatImg from "../assets/hello.svg";
import axios from "axios";
import config from "../config";

function ChatBox() {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [melt, setMelt] = useState(false);
  const [peoples, setPeoples] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("user-info")) || {};
        if (!userInfo?.user?.email) return;

        setUsername(userInfo.user.username || "");
        setEmail(userInfo.user.email);

        const response = await axios.get(`${config.apiUrl}/users`);
        setPeoples(response.data);
      } catch (error) {
        console.error("❌ Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!email) return;

    socketRef.current = io(`${config.apiUrl}`);

    socketRef.current.on("userList", (userList) => {
      console.log("📢 Updated User List:", userList);
      setUsers(userList); // ✅ Ensure users are updated
    });

    socketRef.current.on("receiveMessage", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message }]);
    });

    return () => socketRef.current?.disconnect();
  }, [email]);

  const fetchMessages = async (user) => {
    try {
      const response = await axios.get(`${config.apiUrl}/messages/${email}/${user}`);
      setMessages(response.data);
      console.log(`✅ Fetched chat history with ${user}:`, response.data);
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (recipient) {
      fetchMessages(recipient); // ✅ Fetch only when a new recipient is selected
    }
  }, [recipient]);  // ✅ Only runs when recipient changes


  const handleUserClick = async (user) => {
    setRecipient(user);
    await fetchMessages(user);
  };

  const registerUser = () => {
    if (username.trim() && email.trim()) {
      console.log("username = ", username.trim(), "email", email.trim());
      socketRef.current.emit("register", username.trim(), email.trim());
      setIsConnected(true);
    }
  };

  const handleLogin = () => {
    console.log("Username:", username, "Email:", email);

    if (!username.trim() || !email.trim()) {
      console.error("⚠️ Username and email are required!");
      return;
    }

    setMelt(true);
    setTimeout(registerUser, 1200);
  };

  const sendMessage = async () => {
    if (inputValue.trim() && recipient.trim()) {
      socketRef.current.emit("privateMessage", {
        sender: email,
        recipient,
        message: inputValue,
      });

      // ✅ Update state directly instead of fetching messages again
      setMessages((prev) => [...prev, { sender: email, message: inputValue }]);
      setInputValue(""); // Clear input field
    }
  };


  const onEmojiClick = (emojiObject) => {
    setInputValue(inputValue + emojiObject.emoji);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      {!isConnected ? (
        <div className="flex flex-col items-center gap-4 p-6 bg-transparent rounded-lg shadow-lg w-80">
          <img src={chatImg} className="w-48 h-48 object-contain" alt="Chat" />
          <button
            onClick={handleLogin}
            className={`relative mt-4 flex items-center justify-center w-16 h-16 text-lg font-semibold text-white 
                      bg-gradient-to-r from-green-200 to-green-600 rounded-full shadow-xl 
                      transition-all duration-700 ease-in-out transform border-1
                      ${melt ? "border-green-500" : ""}
                      ${melt ? "animate-melt" : "hover:scale-110 animate-glow-green"}`}
          >
            {melt ? "✔" : ">"}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-2xl flex flex-col gap-4">
          {recipient && (
            <div className="flex items-center gap-2 bg-gray-800 p-3 rounded-lg shadow-md">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <h2 className="text-lg font-semibold">{recipient}</h2>
            </div>
          )}

          <div className="bg-gray-800 p-4 rounded-lg shadow-md h-80 overflow-auto">
            {Array.isArray(messages) &&
              messages.map((msg, index) => (
                <p
                  key={index} // ✅ Add a unique key
                  className={`text-sm mb-2 p-2 rounded-lg max-w-xs 
          ${msg.sender === email ? "bg-green-600 ml-auto text-right" : "bg-gray-700 text-left"}
        `}
                >
                  <strong>{msg.sender === email ? "You" : msg.sender}:</strong> {msg.message}
                </p>
              ))}
          </div>

          <div className="flex gap-2 relative">
            <input
              className="flex-grow p-2 border rounded bg-gray-700 text-white"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              😀
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 bg-gray-800 rounded-lg shadow-lg">
                <Picker onEmojiClick={onEmojiClick} />
              </div>
            )}
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded" onClick={sendMessage}>
              Send
            </button>
          </div>
          <ul className="mt-2">
            {users.length === 0 ? (
              <p className="text-gray-400">No users online</p>
            ) : (
              users
                .filter((userEmail) => userEmail !== email) // ✅ Remove your own email
                .map((userEmail, idx) => (
                  <li
                    key={userEmail} // ✅ Use email as a unique key
                    className="cursor-pointer p-1 flex items-center gap-2 hover:bg-gray-700 rounded"
                    onClick={() => handleUserClick(userEmail)}
                  >
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    {userEmail} {/* ✅ Display the email directly */}
                  </li>
                ))
            )}
          </ul>

        </div>
      )}
    </div>
  );
}

export default ChatBox;

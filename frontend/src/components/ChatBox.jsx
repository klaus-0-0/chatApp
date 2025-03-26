import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "../App.css";

function ChatBox() {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [username, setUsername] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");

    // Listen for user list updates
    socketRef.current.on("userList", (userList) => {
      console.log("📥 Received user list:", userList);
      setUsers(userList);
    });

    // Listen for messages
    socketRef.current.on("receiveMessage", ({ sender, message }) => {
      setMessages((prev) => [...prev, `${sender}: ${message}`]);
    });

    return () => socketRef.current?.disconnect();
  }, []);

  const registerUser = () => {
    if (username.trim()) {
      console.log("📤 Sending register event:", username);
      socketRef.current.emit("register", username);
      setIsConnected(true);
    }
  };

  const sendMessage = () => {
    if (inputValue.trim() && recipient.trim()) {
      socketRef.current.emit("privateMessage", {
        sender: username,
        recipient,
        message: inputValue,
      });
      setMessages([...messages, `You -> ${recipient}: ${inputValue}`]);
      setInputValue("");
    }
  };

  return (
    <div className="chat-container">
      {!isConnected ? (
        <div className="login-box">
          <h2>Enter your username</h2>
          <input
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="join-button" onClick={registerUser}>
            Join
          </button>
        </div>
      ) : (
        <div className="chat-wrapper">
          <div className="chat-box">
            {messages.map((msg, index) => (
              <p key={index} className="message-item">{msg}</p>
            ))}
          </div>
          <div className="input-container">
            <input
              className="chat-input"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="chat-send-button" onClick={sendMessage}>
              Send
            </button>
          </div>
          <div className="users-list">
            <h2>Users Online</h2>
            <ul>
              {users
                .filter((user) => user !== username)
                .map((user) => (
                  <li
                    key={user}
                    className="user-item"
                    onClick={() => setRecipient(user)}
                  >
                    {user}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBox;

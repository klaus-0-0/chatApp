/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Picker from "emoji-picker-react";
import chatImg from "../assets/hello.svg";
import axios from "axios";
import config from "../config";
import emoji from "../assets/emoji.png"
import send from "../assets/send1.png"

function ChatBox() {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [recipient, setRecipient] = useState("");
  const [users, setUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [melt, setMelt] = useState(false);
  const [peoples, setPeoples] = useState([]);

  // use effect are asyncronous so it take time until it data updates to the state we cant access data in the same useffect so that data will remain empty if we try to use it ""
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user-info")) || {};
    console.log(" Fetched user-info from localStorage:", userInfo);

    if (!userInfo?.user?.email) {
      console.warn(" No email found, skipping registration.");
      return;
    }

    setUsername(userInfo.user.username || "");
    setEmail(userInfo.user.email);
  }, []);

  
  useEffect(() => {
    if (!email) return; // Make sure email is set

    console.log(" Setting up socket connection...");
    socketRef.current = io(`${config.apiUrl}`);

    socketRef.current.on("connect", () => {
      console.log(" Socket connected!");

      if (username && email) {
        console.log(" Emitting register event:", username, email);
        socketRef.current.emit("register", username, email);
      } else {
        console.warn(" Skipping register, username or email missing");
      }
    });

    return () => socketRef.current.disconnect();
  }, [email, username]); // 👈 Runs again only when email & username are updated because of dependency as updated useefect will get run


  useEffect(() => {
    if (!email) return;

    socketRef.current = io(`${config.apiUrl}`);

    socketRef.current.on("userList", (userList) => {
      console.log("📢 Updated User List:", userList);
      setUsers(userList); //  Ensure users are updated
    });

    socketRef.current.on("receiveMessage", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message }]);
    });

    return () => socketRef.current?.disconnect();
  }, [email]);


  useEffect(() => {
    if (recipient) {
      fetchMessages(recipient); //  Fetch only when a new recipient is selected
    }
  }, [recipient]);  //  Only runs when recipient changes



  const fetchMessages = async (user) => {
    try {
      const response = await axios.get(`${config.apiUrl}/messages/${email}/${user}`);
      setMessages(response.data);
      console.log(` Fetched chat history with ${user}:`, response.data);
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
    }
  };

  const handleUserClick = async (user) => {
    setRecipient(user);
    await fetchMessages(user);
  };

  const sendMessage = async () => {
    if (inputValue.trim() && recipient.trim()) {
      socketRef.current.emit("privateMessage", {
        sender: email,
        recipient,
        message: inputValue,
      });

      //  Update state directly instead of fetching messages again
      setMessages((prev) => [...prev, { sender: email, message: inputValue }]);
      setInputValue(""); // Clear input field
    }
  };


  const onEmojiClick = (emojiObject) => {
    setInputValue(inputValue + emojiObject.emoji);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">

      <div className="w-full max-w-2xl flex flex-col gap-4">
        {recipient && (
          <div className="flex items-center gap-2 bg-gray-800 p-3 rounded-lg shadow-md">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <h2 className="text-lg font-semibold">{recipient}</h2>
          </div>
        )}

        <div className="bg-gray-800 p-4 rounded-lg shadow-md h-80 overflow-auto bg-transparent border border-white">
          {Array.isArray(messages) &&
            messages.map((msg, index) => (
              <p
                key={index} //  Add a unique key
                className={`text-sm mb-2 p-2 rounded-lg max-w-xs 
          ${msg.sender === email ? "bg-green-700 ml-auto text-right" : "bg-gray-700 text-left"}
        `}
              >
                <strong>{msg.sender === email ? "You" : msg.sender}:</strong> {msg.message}
              </p>
            ))}
        </div>

        <div className="flex gap-2 relative">
          <input
            className="flex-grow p-2 border-b-2 border-gray-400 bg-transparent text-white outline-none focus:border-green-400"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <button
            className="px-4 py-2 bg-yellow-0 hover:bg-yellow-700 rounded"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <img src={emoji} className="w-12 h-12" alt="emoji picker" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-12 right-0 bg-gray-800 rounded-lg shadow-lg">
              <Picker onEmojiClick={onEmojiClick} />
            </div>
          )}
          <button className=" bg-green-0 hover:bg-green-700 rounded" onClick={sendMessage}>
            <img src={send} className="w-12 h-12" alt="emoji picker" />
          </button>
        </div>
        <ul className="mt-2">
          {users.length === 0 ? (
            <p className="text-gray-400">No users online</p>
          ) : (
            users
              .filter((userEmail) => userEmail !== email) //  Remove your own email
              .map((userEmail, idx) => (
                <li
                  key={userEmail} //  Use email as a unique key
                  className="cursor-pointer p-1 flex items-center gap-2 hover:bg-gray-700 rounded"
                  onClick={() => handleUserClick(userEmail)}
                >
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  {userEmail} {/*  Display the email directly */}
                </li>
              ))
          )}
        </ul>

      </div>
    </div>
  );
}

export default ChatBox;
